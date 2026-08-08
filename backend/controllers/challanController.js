const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Helper to generate challan number
const generateChallanNumber = async (connection) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `CH-${dateStr}-`;
  
  // Find the highest sequence number for today
  const [rows] = await connection.query(
    'SELECT challan_number FROM challans WHERE challan_number LIKE ? ORDER BY challan_number DESC LIMIT 1',
    [`${prefix}%`]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const lastNum = rows[0].challan_number.split('-')[2];
    sequence = parseInt(lastNum) + 1;
  }

  return `${prefix}${sequence.toString().padStart(3, '0')}`;
};

// GET /challans
const getChallans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const customer_id = req.query.customer_id;

    let query = 'SELECT ch.*, c.name as customer_name FROM challans ch JOIN customers c ON ch.customer_id = c.id';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('ch.status = ?');
      params.push(status);
    }

    if (customer_id) {
      conditions.push('ch.customer_id = ?');
      params.push(customer_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Pagination count
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    query += ' ORDER BY ch.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [challans] = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        challans,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /challans/:id
const getChallanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [challans] = await pool.query('SELECT ch.*, c.name as customer_name FROM challans ch JOIN customers c ON ch.customer_id = c.id WHERE ch.id = ?', [id]);
    
    if (challans.length === 0) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const [items] = await pool.query('SELECT * FROM challan_items WHERE challan_id = ?', [id]);

    res.json({
      success: true,
      data: {
        challan: challans[0],
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /challans
const createChallan = async (req, res, next) => {
  let connection;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });

    const { customer_id, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Challan must have at least one item' });

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify customer exists
    const [customers] = await connection.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const challanNumber = await generateChallanNumber(connection);
    
    let totalQuantity = 0;
    
    // Create challan draft
    const [challanResult] = await connection.query(
      'INSERT INTO challans (challan_number, customer_id, status, created_by) VALUES (?, ?, ?, ?)',
      [challanNumber, customer_id, 'Draft', req.user.id]
    );
    const challanId = challanResult.insertId;

    // Snapshot items
    for (const item of items) {
      const [products] = await connection.query('SELECT name, sku, unit_price FROM products WHERE id = ?', [item.product_id]);
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Product ID ${item.product_id} not found` });
      }

      const product = products[0];
      const qty = parseInt(item.quantity);
      totalQuantity += qty;

      await connection.query(
        'INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, product_sku_snapshot, unit_price_snapshot, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [challanId, item.product_id, product.name, product.sku, product.unit_price, qty]
      );
    }

    // Update total quantity
    await connection.query('UPDATE challans SET total_quantity = ? WHERE id = ?', [totalQuantity, challanId]);

    await connection.commit();

    const [newChallan] = await connection.query('SELECT * FROM challans WHERE id = ?', [challanId]);
    const [newItems] = await connection.query('SELECT * FROM challan_items WHERE challan_id = ?', [challanId]);

    res.status(201).json({ success: true, data: { challan: newChallan[0], items: newItems } });

  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// PATCH /challans/:id/confirm
const confirmChallan = async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [challans] = await connection.query('SELECT * FROM challans WHERE id = ? FOR UPDATE', [id]);
    if (challans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challans[0];
    if (challan.status !== 'Draft') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: `Cannot confirm challan with status ${challan.status}` });
    }

    const [items] = await connection.query('SELECT * FROM challan_items WHERE challan_id = ?', [id]);
    
    // Check stock for all items first
    let shortProducts = [];
    for (const item of items) {
      const [products] = await connection.query('SELECT name, current_stock FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      if (products.length === 0) continue;
      
      const product = products[0];
      if (product.current_stock < item.quantity) {
        shortProducts.push(`${product.name} (Short by ${item.quantity - product.current_stock})`);
      }
    }

    if (shortProducts.length > 0) {
      await connection.rollback();
      return res.status(409).json({ 
        success: false, 
        message: 'Insufficient stock for confirmation', 
        errors: shortProducts 
      });
    }

    // Decrement stock and insert logs
    for (const item of items) {
      await connection.query('UPDATE products SET current_stock = current_stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      
      await connection.query(
        'INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, item.quantity, 'OUT', `Challan ${challan.challan_number} confirmed`, req.user.id]
      );
    }

    await connection.query('UPDATE challans SET status = ? WHERE id = ?', ['Confirmed', id]);
    await connection.commit();

    res.json({ success: true, message: 'Challan confirmed successfully' });

  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// PATCH /challans/:id/cancel
const cancelChallan = async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [challans] = await connection.query('SELECT * FROM challans WHERE id = ? FOR UPDATE', [id]);
    if (challans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challans[0];
    if (challan.status === 'Cancelled') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Challan is already cancelled' });
    }

    if (challan.status === 'Confirmed') {
      const [items] = await connection.query('SELECT * FROM challan_items WHERE challan_id = ?', [id]);
      
      // Reverse stock and insert logs
      for (const item of items) {
        await connection.query('UPDATE products SET current_stock = current_stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        
        await connection.query(
          'INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
          [item.product_id, item.quantity, 'IN', `Challan ${challan.challan_number} cancelled`, req.user.id]
        );
      }
    }

    // Set to Cancelled
    await connection.query('UPDATE challans SET status = ? WHERE id = ?', ['Cancelled', id]);
    await connection.commit();

    res.json({ success: true, message: 'Challan cancelled successfully' });

  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan
};
