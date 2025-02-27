const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);

router.get('/profile', authMiddleware, userController.getProfile);
router.post('/change-password', authMiddleware, userController.changePassword);

router.get('/users', authMiddleware, userController.getAllUsers);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

module.exports = router;

