const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowup
} = require('../controllers/customerController');

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticate);

// View/Search: Admin, Sales, Warehouse, Accounts
router.get('/', authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), getCustomers);
router.get('/:id', authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), getCustomerById);

// Create/Edit: Admin, Sales
router.post(
  '/',
  authorize(['Admin', 'Sales']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('mobile').notEmpty().withMessage('Mobile is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('business_name').notEmpty().withMessage('Business name is required'),
    body('customer_type').isIn(['Retail', 'Wholesale', 'Distributor']).withMessage('Invalid customer type'),
    body('address').notEmpty().withMessage('Address is required')
  ],
  createCustomer
);

router.put(
  '/:id',
  authorize(['Admin', 'Sales']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('mobile').notEmpty().withMessage('Mobile is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('business_name').notEmpty().withMessage('Business name is required'),
    body('customer_type').isIn(['Retail', 'Wholesale', 'Distributor']).withMessage('Invalid customer type'),
    body('address').notEmpty().withMessage('Address is required'),
    body('status').isIn(['Lead', 'Active', 'Inactive']).withMessage('Invalid status')
  ],
  updateCustomer
);

// Add follow-up: Admin, Sales
router.post(
  '/:id/followups',
  authorize(['Admin', 'Sales']),
  [
    body('note').notEmpty().withMessage('Note is required'),
    body('follow_up_date').isDate().withMessage('Valid follow-up date is required')
  ],
  addFollowup
);

module.exports = router;
