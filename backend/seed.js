const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Starting seed process...');

    // 1. Setup Roles / Users
    console.log('Seeding users...');
    const users = [
      { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
      { name: 'Sales User', email: 'sales@example.com', role: 'Sales' },
      { name: 'Warehouse User', email: 'warehouse@example.com', role: 'Warehouse' },
      { name: 'Accounts User', email: 'accounts@example.com', role: 'Accounts' }
    ];

    const passwordHash = await bcrypt.hash('password123', 10);

    for (const user of users) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, passwordHash, user.role]
        );
      }
    }

    // 2. Setup Customers
    console.log('Seeding customers...');
    const customers = [
      { name: 'John Doe', mobile: '1234567890', email: 'john@retail.com', business_name: 'John Retail', customer_type: 'Retail', address: '123 Main St' },
      { name: 'Acme Corp', mobile: '9876543210', email: 'contact@acme.com', business_name: 'Acme Wholesale', customer_type: 'Wholesale', address: '456 Market St' }
    ];

    for (const customer of customers) {
      const [existing] = await pool.query('SELECT id FROM customers WHERE email = ?', [customer.email]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO customers (name, mobile, email, business_name, customer_type, address) VALUES (?, ?, ?, ?, ?, ?)',
          [customer.name, customer.mobile, customer.email, customer.business_name, customer.customer_type, customer.address]
        );
      }
    }

    // 3. Setup Products
    console.log('Seeding products...');
    const products = [
      { name: 'Widget A', sku: 'WDG-A', category: 'Widgets', unit_price: 10.50, current_stock: 100, min_stock_alert: 10 },
      { name: 'Widget B', sku: 'WDG-B', category: 'Widgets', unit_price: 25.00, current_stock: 50, min_stock_alert: 5 },
      { name: 'Gadget X', sku: 'GDG-X', category: 'Gadgets', unit_price: 150.00, current_stock: 20, min_stock_alert: 2 }
    ];

    for (const product of products) {
      const [existing] = await pool.query('SELECT id FROM products WHERE sku = ?', [product.sku]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert) VALUES (?, ?, ?, ?, ?, ?)',
          [product.name, product.sku, product.category, product.unit_price, product.current_stock, product.min_stock_alert]
        );
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
