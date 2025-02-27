const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// User Place Order
exports.placeOrder = async (req, res) => {
    try {
        const { products, shippingAddress } = req.body; 
        let totalPrice = 0;
        
        // calculate and verify product exist
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
            totalPrice += product.price * item.quantity;
        }

       
        const newOrder = new Order({
            userId: req.user.id,
            products,
            totalPrice, 
            shippingAddress, 
        });

        await newOrder.save();
        res.status(201).json({
             message: "Order placed successfully", 
             data: newOrder
             });
    } catch (error) {
        res.status(500).json({ 
            message: error.message
         });
    }
};

// User can Get Their Orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('products.productId');
        res.status(200).json({
             message: 'Orders retrieved successfully',
              data: orders 
            });
    } catch (error) {
        res.status(500).json({ 
            message: error.message 
        });
    }
};

// Admin too can Get All Orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('products.productId');
        res.status(200).json({ 
            message: 'All orders retrieved successfully', 
            data: orders
         });
    } catch (error) {
        res.status(500).json({
             message: error.message 
            });
    }
};

// only admin can update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({
             message: 'Order not found' 
            });
        res.status(200).json({
             message: 'Order status updated successfully',
              data: order
             });
    } catch (error) {
        res.status(500).json({
             message: error.message
             });
    }
};
