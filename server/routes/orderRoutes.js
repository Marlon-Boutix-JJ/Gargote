const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/active/:tableId', orderController.getActiveOrderForTable);
router.post('/', orderController.createOrder);
router.put('/:id/add-items', orderController.addItemsToOrder);
router.put('/:id/validate', orderController.validateOrder);
router.put('/:id/pay', orderController.payOrder);
router.get('/stats', orderController.getOrderStats);
router.get('/history', orderController.getSalesHistory);

module.exports = router;
