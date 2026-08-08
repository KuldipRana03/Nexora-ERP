const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan
} = require('../controllers/challanController');

const router = express.Router();

router.use(authenticate);

// View: Admin, Sales, Warehouse, Accounts
router.get('/', authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), getChallans);
router.get('/:id', authorize(['Admin', 'Sales', 'Warehouse', 'Accounts']), getChallanById);

// Create draft: Admin, Sales
router.post(
  '/',
  authorize(['Admin', 'Sales']),
  [
    body('customer_id').isInt().withMessage('Valid customer ID is required'),
    body('items').isArray().withMessage('Items must be an array')
  ],
  createChallan
);

// Confirm/Cancel: Admin, Sales
router.patch('/:id/confirm', authorize(['Admin', 'Sales']), confirmChallan);
router.patch('/:id/cancel', authorize(['Admin', 'Sales']), cancelChallan);

module.exports = router;
