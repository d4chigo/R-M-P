const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'rmp_secret_key_2024';

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario aún existe y está activo
    const [rows] = await db.query(
      'SELECT id, nombre, email, estado FROM USUARIO WHERE id = ? AND estado = 1',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar información del usuario al request
    req.usuario = rows[0];
    req.token = token;

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware opcional - no falla si no hay token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);

      const [rows] = await db.query(
        'SELECT id, nombre, email, estado FROM USUARIO WHERE id = ? AND estado = 1',
        [decoded.id]
      );

      if (rows.length) {
        req.usuario = rows[0];
        req.token = token;
      }
    }

    next();

  } catch (error) {
    // En auth opcional, continuamos incluso si hay error
    console.warn('Error en autenticación opcional:', error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
