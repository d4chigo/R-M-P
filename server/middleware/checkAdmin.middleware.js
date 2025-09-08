const pool = require('../config/db');

const checkNoAdminExists = async (req, res, next) => {
    try {
        const [admins] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM USUARIO u 
            JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario 
            JOIN ROL r ON ur.id_rol = r.id_rol 
            WHERE r.nombre = 'ADMINISTRADOR'
        `);
        
        if (admins[0].count > 0) {
            return res.status(400).json({
                message: "Ya existe un usuario administrador en el sistema"
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Middleware para verificar si el usuario es administrador
const checkAdmin = async (req, res, next) => {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.usuario || !req.usuario.id_usuario) {
            return res.status(401).json({
                success: false,
                message: "Autenticación requerida"
            });
        }

        // Verificar si el usuario tiene rol de administrador
        if (!req.usuario.roles || !req.usuario.roles.includes('ADMINISTRADOR')) {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Se requieren permisos de administrador"
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware checkAdmin:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

module.exports = {
    checkNoAdminExists,
    checkAdmin
};
