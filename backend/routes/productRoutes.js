const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  logStockMovement
} = require('../controllers/productController');

const router = express.Router();

router.use(authenticate);

// View: Admin, Sales, Warehouse, Accounts
router.get('/', authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), getProducts);
router.get('/:id', authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), getProductById);

// Create/Edit: Admin, Warehouse
router.post(
  '/',
  authorize(['Admin', 'Warehouse']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit_price').isNumeric().withMessage('Valid unit price is required'),
    body('current_stock').optional().isInt({ min: 0 }).withMessage('Stock must be positive integer'),
    body('min_stock_alert').optional().isInt({ min: 0 }).withMessage('Min stock must be positive integer')
  ],
  createProduct
);

router.put(
  '/:id',
  authorize(['Admin', 'Warehouse']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit_price').isNumeric().withMessage('Valid unit price is required'),
    body('min_stock_alert').isInt({ min: 0 }).withMessage('Min stock must be positive integer')
  ],
  updateProduct
);

// Stock Movement: Admin, Warehouse
router.post(
  '/:id/stock-movement',
  authorize(['Admin', 'Warehouse']),
  [
    body('quantity_changed').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('movement_type').isIn(['IN', 'OUT']).withMessage('Movement type must be IN or OUT'),
    body('reason').notEmpty().withMessage('Reason is required')
  ],
  logStockMovement
);

module.exports = router;
