const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "REMOVED_SECRET";

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario aún existe y está activo
    const [rows] = await db.query(
      "SELECT id_usuario, username, nombre_completo, email, telefono, activo FROM USUARIO WHERE id_usuario = ? AND activo = TRUE",
      [decoded.id_usuario],
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado o inactivo",
      });
    }

    // Agregar información del usuario al request
    req.usuario = rows[0];
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    console.error("Error en middleware de autenticación:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Middleware opcional - no falla si no hay token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);

      const [rows] = await db.query(
        "SELECT id_usuario, username, nombre_completo, email, telefono, activo FROM USUARIO WHERE id_usuario = ? AND activo = TRUE",
        [decoded.id_usuario],
      );

      if (rows.length) {
        req.usuario = rows[0];
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // En auth opcional, continuamos incluso si hay error
    console.warn("Error en autenticación opcional:", error.message);
    next();
  }
};

// Middleware para verificar roles específicos (requiere authenticateToken primero)
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: "Autenticación requerida",
        });
      }

      // Obtener roles del usuario
      const [userRoles] = await db.query(
        `SELECT r.nombre as rol_nombre
         FROM USUARIO_ROL ur
         JOIN ROL r ON ur.id_rol = r.id_rol
         WHERE ur.id_usuario = ?`,
        [req.usuario.id_usuario],
      );

      const userRoleNames = userRoles.map((role) => role.rol_nombre);
      const hasRequiredRole = roles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos suficientes para realizar esta acción",
        });
      }

      req.userRoles = userRoleNames;
      next();
    } catch (error) {
      console.error("Error en verificación de roles:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
};

// Middleware para verificar si es administrador
const requireAdmin = requireRole(["administrador", "admin"]);

// Middleware para verificar si es operador o superior
const requireOperator = requireRole(["administrador", "admin", "operador"]);

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOperator,
};
