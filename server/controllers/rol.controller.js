/**
 * Controlador para gestión de roles
 * @module controllers/rol
 */

const db = require("../config/db");

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de roles...");

    const [roles] = await db.query(`
      SELECT 
        id_rol,
        nombre,
        descripcion
      FROM ROL
      ORDER BY nombre ASC
    `);

    console.log(`✅ Se encontraron ${roles.length} roles`);

    res.json({
      success: true,
      data: roles,
      message: "Roles obtenidos exitosamente"
    });
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener roles",
      error: error.message
    });
  }
};
