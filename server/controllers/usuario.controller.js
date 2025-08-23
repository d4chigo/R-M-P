const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de usuarios...");

    const [usuarios] = await db.query(`
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      ORDER BY nombre_completo ASC
    `);

    console.log(`✅ Se encontraron ${usuarios.length} usuarios`);

    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length,
      message: "Usuarios obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando usuario con ID: ${id}`);

    const [usuario] = await db.query(
      `
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      WHERE id_usuario = ?
    `,
      [id],
    );

    if (usuario.length === 0) {
      console.log(`⚠️ Usuario con ID ${id} no encontrado`);
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    console.log(`✅ Usuario encontrado: ${usuario[0].nombre_completo}`);

    res.json({
      success: true,
      data: usuario[0],
      message: "Usuario obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

// Crear un nuevo usuario
const createUsuario = async (req, res) => {
  try {
    const {
      username,
      password,
      nombre_completo,
      email,
      telefono,
      activo = true,
    } = req.body;

    console.log("➕ Creando nuevo usuario:", { username, nombre_completo });

    // Validaciones básicas
    if (!username || !password || !nombre_completo) {
      return res.status(400).json({
        success: false,
        message: "Username, contraseña y nombre completo son requeridos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar que el username no exista
    const [existingUsername] = await db.query(
      "SELECT id_usuario FROM USUARIO WHERE username = ?",
      [username],
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese username",
      });
    }

    // Verificar que el email no exista (si se proporciona)
    if (email) {
      const [existingEmail] = await db.query(
        "SELECT id_usuario FROM USUARIO WHERE email = ?",
        [email],
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con ese email",
        });
      }
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      `
      INSERT INTO USUARIO (username, password_hash, nombre_completo, email, telefono, activo)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        username,
        hashedPassword,
        nombre_completo,
        email || null,
        telefono || null,
        activo,
      ],
    );

    console.log(`✅ Usuario creado con ID: ${result.insertId}`);

    // Obtener el usuario creado (sin contraseña)
    const [newUsuario] = await db.query(
      `
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      WHERE id_usuario = ?
    `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newUsuario[0],
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// Actualizar un usuario
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nombre_completo, email, telefono, activo } = req.body;

    console.log(`✏️ Actualizando usuario ID: ${id}`);

    // Verificar que el usuario existe
    const [existing] = await db.query(
      "SELECT id_usuario FROM USUARIO WHERE id_usuario = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar username único (si se está cambiando)
    if (username) {
      const [existingUsername] = await db.query(
        "SELECT id_usuario FROM USUARIO WHERE username = ? AND id_usuario != ?",
        [username, id],
      );

      if (existingUsername.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro usuario con ese username",
        });
      }
    }

    // Verificar email único (si se está cambiando)
    if (email) {
      const [existingEmail] = await db.query(
        "SELECT id_usuario FROM USUARIO WHERE email = ? AND id_usuario != ?",
        [email, id],
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro usuario con ese email",
        });
      }
    }

    await db.query(
      `
      UPDATE USUARIO
      SET
        username = COALESCE(?, username),
        nombre_completo = COALESCE(?, nombre_completo),
        email = ?,
        telefono = ?,
        activo = COALESCE(?, activo),
        updated_at = CURRENT_TIMESTAMP
      WHERE id_usuario = ?
    `,
      [username, nombre_completo, email, telefono, activo, id],
    );

    console.log(`✅ Usuario ${id} actualizado exitosamente`);

    // Obtener el usuario actualizado
    const [updatedUsuario] = await db.query(
      `
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      WHERE id_usuario = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedUsuario[0],
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

// Cambiar contraseña de un usuario
const changeUsuarioPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    console.log(`🔐 Cambiando contraseña del usuario ID: ${id}`);

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Nueva contraseña es requerida",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar que el usuario existe
    const [existing] = await db.query(
      "SELECT id_usuario, nombre_completo FROM USUARIO WHERE id_usuario = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await db.query(
      "UPDATE USUARIO SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [hashedNewPassword, id],
    );

    console.log(`✅ Contraseña del usuario ${existing[0].nombre_completo} actualizada`);

    res.json({
      success: true,
      message: `Contraseña del usuario ${existing[0].nombre_completo} actualizada exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al cambiar contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar contraseña",
      error: error.message,
    });
  }
};

// Eliminar un usuario (soft delete)
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando usuario ID: ${id}`);

    // Verificar que el usuario existe
    const [existing] = await db.query(
      "SELECT id_usuario, nombre_completo FROM USUARIO WHERE id_usuario = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si tiene registros asociados (viajes creados/actualizados)
    const [viajes] = await db.query(
      "SELECT COUNT(*) as count FROM VIAJE WHERE created_by = ? OR updated_by = ?",
      [id, id],
    );


    if (viajes[0].count > 0) {
      // Si tiene registros asociados, hacer soft delete
      await db.query(
        "UPDATE USUARIO SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
        [id],
      );

      console.log(
        `✅ Usuario ${existing[0].nombre_completo} desactivado (soft delete)`,
      );

      res.json({
        success: true,
        message: `Usuario ${existing[0].nombre_completo} desactivado exitosamente`,
      });
    } else {
      // Si no tiene registros asociados, eliminar completamente
      await db.query("DELETE FROM USUARIO WHERE id_usuario = ?", [id]);

      console.log(
        `✅ Usuario ${existing[0].nombre_completo} eliminado completamente`,
      );

      res.json({
        success: true,
        message: `Usuario ${existing[0].nombre_completo} eliminado exitosamente`,
      });
    }
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

// Buscar usuarios
const searchUsuarios = async (req, res) => {
  try {
    const { q, activo } = req.query;
    console.log(`🔍 Buscando usuarios con término: ${q}, activo: ${activo}`);

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        username LIKE ? OR
        nombre_completo LIKE ? OR
        email LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (activo !== undefined) {
      whereClause += " AND activo = ?";
      params.push(activo === "true");
    }

    const [usuarios] = await db.query(
      `
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      ${whereClause}
      ORDER BY nombre_completo ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${usuarios.length} resultados`);

    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length,
      message: `${usuarios.length} usuarios encontrados`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de usuarios",
      error: error.message,
    });
  }
};

// Obtener usuarios activos
const getUsuariosActivos = async (req, res) => {
  try {
    console.log("📋 Obteniendo usuarios activos...");

    const [usuarios] = await db.query(`
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      WHERE activo = TRUE
      ORDER BY nombre_completo ASC
    `);

    console.log(`✅ Se encontraron ${usuarios.length} usuarios activos`);

    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length,
      message: "Usuarios activos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios activos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios activos",
      error: error.message,
    });
  }
};

// Activar/Desactivar usuario
const toggleUsuarioActivo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Cambiando estado de usuario ID: ${id}`);

    // Verificar que el usuario existe
    const [existing] = await db.query(
      "SELECT id_usuario, nombre_completo, activo FROM USUARIO WHERE id_usuario = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const nuevoEstado = !existing[0].activo;

    await db.query(
      "UPDATE USUARIO SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [nuevoEstado, id],
    );

    console.log(
      `✅ Usuario ${existing[0].nombre_completo} ${nuevoEstado ? "activado" : "desactivado"}`,
    );

    // Obtener el usuario actualizado
    const [updatedUsuario] = await db.query(
      `
      SELECT
        id_usuario,
        username,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        updated_at
      FROM USUARIO
      WHERE id_usuario = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedUsuario[0],
      message: `Usuario ${existing[0].nombre_completo} ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del usuario",
      error: error.message,
    });
  }
};

// Obtener usuarios con estadísticas de actividad
const getUsuariosConEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo usuarios con estadísticas...");

    const [usuarios] = await db.query(`
      SELECT
        u.id_usuario,
        u.username,
        u.nombre_completo,
        u.email,
        u.telefono,
        u.activo,
        COALESCE(stats_viajes.total_viajes_creados, 0) as total_viajes_creados,
        COALESCE(stats_viajes.total_viajes_actualizados, 0) as total_viajes_actualizados,
        0 as total_visitas_creadas,
        0 as total_visitas_actualizadas,
        u.created_at,
        u.updated_at
      FROM USUARIO u
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(*) as total_viajes_creados,
          0 as total_viajes_actualizados
        FROM VIAJE
        WHERE created_by IS NOT NULL
        GROUP BY created_by
        UNION ALL
        SELECT
          updated_by,
          0 as total_viajes_creados,
          COUNT(*) as total_viajes_actualizados
        FROM VIAJE
        WHERE updated_by IS NOT NULL AND updated_by != created_by
        GROUP BY updated_by
      ) stats_viajes ON u.id_usuario = stats_viajes.created_by

      ORDER BY u.nombre_completo ASC
    `);

    console.log(
      `✅ Se encontraron ${usuarios.length} usuarios con estadísticas`,
    );

    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length,
      message: "Usuarios con estadísticas obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios con estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios con estadísticas",
      error: error.message,
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  changeUsuarioPassword,
  deleteUsuario,
  searchUsuarios,
  getUsuariosActivos,
  toggleUsuarioActivo,
  getUsuariosConEstadisticas,
  // Aliases para compatibilidad
  getAll: getUsuarios,
  getById: getUsuarioById,
  create: createUsuario,
  update: updateUsuario,
  delete: deleteUsuario,
};
