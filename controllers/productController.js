const productModel = require('../models/productModel');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;
        const data = { 
            name,
             description, 
             price, 
             stock, 
             category,
              imageUrl 
            };
        const newProduct = await productModel.create(data);
        res.status(201).json({ 
            message: "Product created successfully",
            data: newProduct 
        });
    } catch (error) {
        res.status(500).json({ 
            message: error.message
         });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        res.status(200).json({ 
            message: "Products retrieved successfully", 
            data: products 
        });
    } catch (error) {
        res.status(500).json({ 
            message: error.message 
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(404).json({ 
            message: "Product not found"
         });
        res.status(200).json({ 
            message: "Product retrieved successfully", 
            data: product 
        });
    } catch (error) {
        res.status(500).json({ 
            message: error.message
         });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ 
            message: "Product not found" 
        });
        res.status(200).json({ 
            message: "Product updated successfully",
            data: updatedProduct 
        });
    } catch (error) {
        res.status(500).json({ 
            message: error.message
         });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ 
            message: "Product not found"
         });
        res.status(200).json({
             message: "Product deleted successfully"
             });
    } catch (error) {
        res.status(500).json({
             message: error.message
             });
    }
};
