const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/orders', authMiddleware, orderController.placeOrder);
router.get('/orders/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/orders', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put('/orders/:id', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;
