CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Sales', 'Warehouse', 'Accounts') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(20) NULL,
  customer_type ENUM('Retail', 'Wholesale', 'Distributor') NOT NULL,
  address TEXT NOT NULL,
  status ENUM('Lead', 'Active', 'Inactive') NOT NULL DEFAULT 'Lead',
  follow_up_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_followups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  note TEXT NOT NULL,
  follow_up_date DATE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 0,
  warehouse_location VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity_changed INT NOT NULL,
  movement_type ENUM('IN', 'OUT') NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challan_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  status ENUM('Draft', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Draft',
  total_quantity INT NOT NULL DEFAULT 0,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challan_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challan_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  product_sku_snapshot VARCHAR(100) NOT NULL,
  unit_price_snapshot DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (challan_id) REFERENCES challans(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
