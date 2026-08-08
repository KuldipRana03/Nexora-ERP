const pool = require('../config/db');
const { validationResult } = require('express-validator');

// GET /products
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const lowStock = req.query.lowStock === 'true';

    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(name LIKE ? OR sku LIKE ? OR category LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (lowStock) {
      conditions.push('current_stock <= min_stock_alert');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    next(error);
  }
};

// POST /products
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_location } = req.body;

    const [result] = await pool.query(
      'INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, unit_price, current_stock || 0, min_stock_alert || 0, warehouse_location || null]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      data: newProduct[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    next(error);
  }
};

// PUT /products/:id
const updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { id } = req.params;
    const { name, sku, category, unit_price, min_stock_alert, warehouse_location } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await pool.query(
      'UPDATE products SET name = ?, sku = ?, category = ?, unit_price = ?, min_stock_alert = ?, warehouse_location = ? WHERE id = ?',
      [name, sku, category, unit_price, min_stock_alert, warehouse_location || null, id]
    );

    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedProduct[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    next(error);
  }
};

// POST /products/:id/stock-movement
const logStockMovement = async (req, res, next) => {
  let connection;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity_changed, movement_type, reason } = req.body;
    
    // Convert to positive integer just in case
    const qty = Math.abs(parseInt(quantity_changed));

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query('SELECT current_stock FROM products WHERE id = ? FOR UPDATE', [id]);
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currentStock = products[0].current_stock;
    
    let newStock = currentStock;
    if (movement_type === 'IN') {
      newStock += qty;
    } else if (movement_type === 'OUT') {
      newStock -= qty;
      if (newStock < 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient stock for this OUT movement' });
      }
    }

    // Update product stock
    await connection.query('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, id]);

    // Insert movement log
    await connection.query(
      'INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, qty, movement_type, reason, req.user.id]
    );

    await connection.commit();

    const [updatedProduct] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Stock movement logged successfully',
      data: updatedProduct[0]
    });

  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  logStockMovement
};
