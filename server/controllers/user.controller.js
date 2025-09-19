const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Crear nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { username, nombre_completo, email, password, telefono, roles } = req.body;

    if (!username || !nombre_completo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos"
      });
    }

    // Generar una contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insertar usuario
      const [userResult] = await connection.query(
        "INSERT INTO USUARIO (username, nombre_completo, email, password_hash, telefono, activo) VALUES (?, ?, ?, ?, ?, TRUE)",
        [username, nombre_completo, email, hashedPassword, telefono]
      );

      // Asignar roles
      if (roles && roles.length > 0) {
        const roleValues = roles.map(roleId => [userResult.insertId, roleId]);
        await connection.query(
          "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES ?",
          [roleValues]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: {
          id: userResult.insertId,
          username,
          nombre_completo,
          email,
          telefono,
          roles
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el usuario",
      error: error.message
    });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, email, telefono, activo, roles } = req.body;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Actualizar información básica
      await connection.query(
        `UPDATE USUARIO SET 
          nombre_completo = COALESCE(?, nombre_completo),
          email = COALESCE(?, email),
          telefono = COALESCE(?, telefono),
          activo = COALESCE(?, activo),
          updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = ?`,
        [nombre_completo, email, telefono, activo, id]
      );

      // Actualizar roles si se proporcionaron
      if (roles) {
        // Eliminar roles actuales
        await connection.query(
          "DELETE FROM USUARIO_ROL WHERE id_usuario = ?",
          [id]
        );

        // Asignar nuevos roles
        if (roles.length > 0) {
          const roleValues = roles.map(roleId => [id, roleId]);
          await connection.query(
            "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES ?",
            [roleValues]
          );
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: "Usuario actualizado exitosamente"
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el usuario",
      error: error.message
    });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no sea el último admin
    const [adminCount] = await db.query(`
      SELECT COUNT(*) as count 
      FROM USUARIO u
      JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
      JOIN ROL r ON ur.id_rol = r.id_rol
      WHERE r.nombre = 'ADMINISTRADOR' AND u.activo = TRUE
    `);

    if (adminCount[0].count <= 1) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el último administrador activo"
      });
    }

    // Marcar como inactivo en lugar de eliminar
    await db.query(
      "UPDATE USUARIO SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente"
    });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: error.message
    });
  }
};

// Restablecer contraseña de usuario
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Nueva contraseña es requerida"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE USUARIO SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: "Contraseña restablecida exitosamente"
    });
  } catch (error) {
    console.error("❌ Error al restablecer contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al restablecer la contraseña",
      error: error.message
    });
  }
};
