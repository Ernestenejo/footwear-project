const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, address, phoneNumber, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            address,
            phoneNumber,
            role: role
        });

        await newUser.save();
        res.status(201).json({
             message: 'User registered successfully', 
             data: newUser
             });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
             message: "User not found" 
            });

      
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({
             message: "Invalid credentials" 
            });

        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
             message: "Login successful", token
             });
    } catch (error) {
        res.status(500).json({ 
            message: error.message
         });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ 
            message: "User not found" 
        });

      
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
             message: "Password reset successful" 
            });

    } catch (error) {
        res.status(500).json({ 
            message: error.message 
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ 
            message: "User not found" 
        });

       
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({
             message: "Old password is incorrect" 
            });

      
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ 
            message: "Password changed successfully"
         });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({
             message: "User not found"
             });

        res.status(200).json({ 
            message: "Profile retrieved successfully",
             data: user 
            });

    } catch (error) {
        res.status(500).json({
             message: error.message
             });
    }
};

// admin can gwet all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ 
            message: "Users retrieved successfully",
             data: users });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin fit Delete User
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ 
            message: "User not found" 
        });

        res.status(200).json({
             message: "User deleted successfully"
             });

    } catch (error) {
        res.status(500).json({ 
            message: error.message
         });
    }
};
