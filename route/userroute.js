const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userController.createUser);
router.post('/login', userController.userLogin);
router.post('/forgot-password', userController.forgotPassword);

router.post('/change-password', authMiddleware, userController.changePassword);
router.post('/change-dp', authMiddleware, userController.changeDP);

router.get('/user/:id', authMiddleware, userController.getOneUser);
router.get('/users', authMiddleware, userController.getallUser);

module.exports = router;