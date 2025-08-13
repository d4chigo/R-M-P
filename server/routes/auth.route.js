const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Ruta de login
router.post('/login', authController.login);

// Ruta de logout
router.post('/logout', authController.logout);

// Ruta para verificar token y obtener usuario actual
router.get('/me', authController.verifyToken);

// Ruta para cambiar contraseña (requiere autenticación)
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
