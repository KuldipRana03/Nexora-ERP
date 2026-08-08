const pool = require('../config/db');
const { validationResult } = require('express-validator');

// GET /customers
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR business_name LIKE ? OR mobile LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [customers] = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        customers,
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

// GET /customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    
    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const [followups] = await pool.query(
      'SELECT cf.*, u.name as created_by_name FROM customer_followups cf JOIN users u ON cf.created_by = u.id WHERE cf.customer_id = ? ORDER BY cf.follow_up_date DESC',
      [id]
    );

    res.json({
      success: true,
      data: {
        customer: customers[0],
        followups
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /customers
const createCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

    const [result] = await pool.query(
      'INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, mobile, email, business_name, gst_number || null, customer_type, address, status || 'Lead', follow_up_date || null, notes || null]
    );

    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      data: newCustomer[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { id } = req.params;
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await pool.query(
      'UPDATE customers SET name = ?, mobile = ?, email = ?, business_name = ?, gst_number = ?, customer_type = ?, address = ?, status = ?, follow_up_date = ?, notes = ? WHERE id = ?',
      [name, mobile, email, business_name, gst_number || null, customer_type, address, status, follow_up_date || null, notes || null, id]
    );

    const [updatedCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedCustomer[0]
    });
  } catch (error) {
    next(error);
  }
};

// POST /customers/:id/followups
const addFollowup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { id } = req.params;
    const { note, follow_up_date } = req.body;

    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by) VALUES (?, ?, ?, ?)',
      [id, note, follow_up_date, req.user.id]
    );

    // Also update the customer's next follow_up_date
    await pool.query('UPDATE customers SET follow_up_date = ? WHERE id = ?', [follow_up_date, id]);

    const [newFollowup] = await pool.query('SELECT * FROM customer_followups WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      data: newFollowup[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowup
};
