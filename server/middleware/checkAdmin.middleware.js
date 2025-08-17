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

module.exports = {
    checkNoAdminExists
};
