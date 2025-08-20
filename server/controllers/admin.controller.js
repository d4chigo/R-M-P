/**
 * Controlador para gestión de administradores y configuración inicial
 * @module controllers/admin
 */

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");

// Constantes
const JWT_SECRET = process.env.JWT_SECRET || 'REMOVED_SECRET';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Verificar si existen usuarios activos
exports.checkUsersExist = async (req, res) => {
  try {
    const [result] = await db.query("SELECT COUNT(*) as total FROM USUARIO WHERE activo = TRUE");
    const usersExist = result[0].total > 0;
    res.json({
      success: true,
      data: { usersExist, totalUsers: result[0].total },
      message: usersExist ? "Usuarios encontrados en el sistema" : "No hay usuarios registrados en el sistema"
    });
  } catch (error) {
    console.error("❌ Error verificando usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar usuarios",
      error: error.message
    });
  }
};

// Crear primer usuario administrador
exports.createFirstAdmin = async (req, res) => {
  try {
    // Verificar si ya existen usuarios
    const [result] = await db.query("SELECT COUNT(*) as total FROM USUARIO WHERE activo = TRUE");
    if (result[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existen usuarios en el sistema"
      });
    }

    const { username, nombre_completo, email, password, telefono } = req.body;
    if (!username || !nombre_completo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Insertar usuario
      const [userResult] = await connection.query(
        "INSERT INTO USUARIO (username, nombre_completo, email, password_hash, telefono, activo) VALUES (?, ?, ?, ?, ?, TRUE)",
        [username, nombre_completo, email, hashedPassword, telefono]
      );
      // Obtener o crear rol admin
      let [roles] = await connection.query("SELECT id_rol FROM ROL WHERE nombre = 'ADMINISTRADOR'");
      let adminRoleId;
      if (!roles.length) {
        const [newRole] = await connection.query(
          "INSERT INTO ROL (nombre, descripcion) VALUES ('ADMINISTRADOR', 'Administrador del sistema')"
        );
        adminRoleId = newRole.insertId;
      } else {
        adminRoleId = roles[0].id_rol;
      }
      // Asignar rol admin
      await connection.query(
        "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES (?, ?)",
        [userResult.insertId, adminRoleId]
      );
      await connection.commit();
      // Generar token
      const token = jwt.sign(
        { id: userResult.insertId, roles: ['ADMINISTRADOR'] },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.json({
        success: true,
        message: "Administrador creado exitosamente",
        data: {
          user: {
            id: userResult.insertId,
            username,
            nombre_completo,
            email,
            telefono,
            roles: ['ADMINISTRADOR']
          },
          token
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error creando administrador:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el administrador",
      error: error.message
    });
  }
};

// Verificar si existen usuarios en el sistema
exports.checkUsersExist = async (req, res) => {
  try {
    console.log("🔍 Verificando si existen usuarios en el sistema...");

    const [result] = await db.query(
      "SELECT COUNT(*) as total FROM USUARIO WHERE activo = TRUE"
    );

    const usersExist = result[0].total > 0;

    console.log(`📊 Total de usuarios activos: ${result[0].total}`);

    res.json({
      success: true,
      data: {
        usersExist,
        totalUsers: result[0].total,
      },
      message: usersExist
        ? "Usuarios encontrados en el sistema"
        : "No hay usuarios registrados en el sistema",
    });
  } catch (error) {
    console.error("❌ Error verificando usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar usuarios",
      error: error.message,
    });
  }
};


// Gestión de usuarios
const getUsers = exports.getUsers = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de usuarios...");

    const [usuarios] = await db.query(`
      SELECT
        u.id_usuario,
        u.username,
        u.nombre_completo,
        u.email,
        u.telefono,
        u.activo,
        u.created_at,
        u.updated_at,
        GROUP_CONCAT(r.nombre ORDER BY r.nombre) as roles,
        GROUP_CONCAT(r.id_rol ORDER BY r.nombre) as role_ids
      FROM USUARIO u
      LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN ROL r ON ur.id_rol = r.id_rol
      GROUP BY u.id_usuario
      ORDER BY u.nombre_completo ASC
    `);

    // Procesar roles para cada usuario
    const usuariosConRoles = usuarios.map((user) => ({
      ...user,
      roles: user.roles ? user.roles.split(',') : [],
      role_ids: user.role_ids ? user.role_ids.split(',').map(id => parseInt(id)) : [],
    }));

    console.log(`✅ Se encontraron ${usuarios.length} usuarios`);

    res.json({
      success: true,
      data: usuariosConRoles,
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

// Crear nuevo usuario (solo administradores)
const createUser = exports.createUser = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear usuario:', req.body);
    
    const {
      username,
      nombre_completo,
      email,
      telefono,
      roles = [],
      sendPassword = true,
    } = req.body;

    console.log(`👤 Creando nuevo usuario: ${username}`);

    // Validaciones básicas
    if (!username || !nombre_completo || !email) {
      return res.status(400).json({
        success: false,
        message: "Username, nombre completo y email son requeridos",
      });
    }

    // Verificar que el username no exista
    const [existingUsername] = await db.query(
      "SELECT id_usuario FROM USUARIO WHERE username = ?",
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese username",
      });
    }

    // Verificar que el email no exista
    const [existingEmail] = await db.query(
      "SELECT id_usuario FROM USUARIO WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese email",
      });
    }

    // Generar contraseña temporal
    console.log('🔑 Generando contraseña temporal...');
    let tempPassword;
    try {
      tempPassword = emailService.generateTemporaryPassword();
    } catch (error) {
      console.error('Error al generar contraseña temporal:', error);
      tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!';
    }
    console.log('Contraseña temporal generada');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Iniciar transacción
    await db.query("START TRANSACTION");

    try {
      // Crear usuario
      const [userResult] = await db.query(
        `INSERT INTO USUARIO (username, password_hash, nombre_completo, email, telefono, activo)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [username, hashedPassword, nombre_completo, email, telefono || null]
      );

      const userId = userResult.insertId;

      // Asignar roles si se especificaron
      if (roles && roles.length > 0) {
        for (const roleId of roles) {
          await db.query(
            "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES (?, ?)",
            [userId, roleId]
          );
        }
      } else {
        // Si no se especifican roles, asignar rol de USUARIO por defecto
        const [defaultRole] = await db.query(
          "SELECT id_rol FROM ROL WHERE nombre = 'USUARIO'"
        );
        if (defaultRole.length > 0) {
          await db.query(
            "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES (?, ?)",
            [userId, defaultRole[0].id_rol]
          );
        }
      }

      // Confirmar transacción
      await db.query("COMMIT");

      console.log(`✅ Usuario creado con ID: ${userId}`);

      // Enviar contraseña por email si está habilitado
      let emailResult = { success: true, message: "Email no enviado (deshabilitado)" };
      if (sendPassword) {
        emailResult = await emailService.sendNewPassword(
          email,
          nombre_completo,
          tempPassword,
          false
        );
      }

      // Obtener el usuario creado con roles
      const [newUser] = await db.query(
        `SELECT u.id_usuario, u.username, u.nombre_completo, u.email, u.telefono, u.activo, u.created_at, u.updated_at,
                GROUP_CONCAT(r.nombre ORDER BY r.nombre) as roles,
                GROUP_CONCAT(r.id_rol ORDER BY r.nombre) as role_ids
         FROM USUARIO u
         LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
         LEFT JOIN ROL r ON ur.id_rol = r.id_rol
         WHERE u.id_usuario = ?
         GROUP BY u.id_usuario`,
        [userId]
      );

      const userData = {
        ...newUser[0],
        roles: newUser[0].roles ? newUser[0].roles.split(',') : [],
        role_ids: newUser[0].role_ids ? newUser[0].role_ids.split(',').map(id => parseInt(id)) : [],
      };

      res.status(201).json({
        success: true,
        data: userData,
        emailSent: emailResult.success,
        emailMessage: emailResult.message,
        temporaryPassword: !emailResult.success ? emailResult.temporaryPassword : undefined,
        message: "Usuario creado exitosamente",
      });
    } catch (transactionError) {
      await db.query("ROLLBACK");
      throw transactionError;
    }
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// Actualizar usuario (solo administradores)
const updateUser = exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nombre_completo, email, telefono, roles, activo } = req.body;

    console.log(`✏️ Actualizando usuario ID: ${id}`);
    console.log('Datos recibidos:', { username, nombre_completo, email, telefono, roles, activo });
    console.log('Headers:', req.headers);

    // Verificar que el usuario existe
    const [existingUser] = await db.query(
      "SELECT * FROM USUARIO WHERE id_usuario = ?",
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar username único (excluyendo el usuario actual)
    if (username) {
      const [existingUsername] = await db.query(
        "SELECT id_usuario FROM USUARIO WHERE username = ? AND id_usuario != ?",
        [username, id]
      );

      if (existingUsername.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro usuario con ese username",
        });
      }
    }

    // Verificar email único (excluyendo el usuario actual)
    if (email) {
      const [existingEmail] = await db.query(
        "SELECT id_usuario FROM USUARIO WHERE email = ? AND id_usuario != ?",
        [email, id]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro usuario con ese email",
        });
      }
    }

    // Iniciar transacción
    await db.query("START TRANSACTION");

    try {
      // Actualizar datos del usuario
      await db.query(
        `UPDATE USUARIO SET
         username = COALESCE(?, username),
         nombre_completo = COALESCE(?, nombre_completo),
         email = COALESCE(?, email),
         telefono = ?,
         activo = COALESCE(?, activo),
         updated_at = CURRENT_TIMESTAMP
         WHERE id_usuario = ?`,
        [username, nombre_completo, email, telefono, activo, id]
      );

      // Actualizar roles si se proporcionaron
      if (roles !== undefined) {
        // Eliminar roles existentes
        await db.query("DELETE FROM USUARIO_ROL WHERE id_usuario = ?", [id]);

        // Asignar nuevos roles
        if (roles.length > 0) {
          for (const roleId of roles) {
            await db.query(
              "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES (?, ?)",
              [id, roleId]
            );
          }
        }
      }

      // Confirmar transacción
      await db.query("COMMIT");

      console.log(`✅ Usuario ${id} actualizado exitosamente`);

      // Obtener el usuario actualizado con roles
      const [updatedUser] = await db.query(
        `SELECT u.id_usuario, u.username, u.nombre_completo, u.email, u.telefono, u.activo, u.created_at, u.updated_at,
                GROUP_CONCAT(r.nombre ORDER BY r.nombre) as roles,
                GROUP_CONCAT(r.id_rol ORDER BY r.nombre) as role_ids
         FROM USUARIO u
         LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
         LEFT JOIN ROL r ON ur.id_rol = r.id_rol
         WHERE u.id_usuario = ?
         GROUP BY u.id_usuario`,
        [id]
      );

      const userData = {
        ...updatedUser[0],
        roles: updatedUser[0].roles ? updatedUser[0].roles.split(',') : [],
        role_ids: updatedUser[0].role_ids ? updatedUser[0].role_ids.split(',').map(id => parseInt(id)) : [],
      };

      res.json({
        success: true,
        data: userData,
        message: "Usuario actualizado exitosamente",
      });
    } catch (transactionError) {
      await db.query("ROLLBACK");
      throw transactionError;
    }
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

// Eliminar usuario (solo administradores)
const deleteUser = exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.usuario.id_usuario;

    console.log(`🗑️ Eliminando usuario ID: ${id}`);

    // Verificar que no se esté eliminando a sí mismo
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta",
      });
    }

    // Verificar que el usuario existe
    const [existingUser] = await db.query(
      "SELECT * FROM USUARIO WHERE id_usuario = ?",
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar que no sea el último administrador
    const [adminCount] = await db.query(`
      SELECT COUNT(DISTINCT u.id_usuario) as total
      FROM USUARIO u
      JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
      JOIN ROL r ON ur.id_rol = r.id_rol
      WHERE r.nombre = 'ADMINISTRADOR' AND u.activo = TRUE
    `);

    const [userIsAdmin] = await db.query(`
      SELECT COUNT(*) as is_admin
      FROM USUARIO_ROL ur
      JOIN ROL r ON ur.id_rol = r.id_rol
      WHERE ur.id_usuario = ? AND r.nombre = 'ADMINISTRADOR'
    `, [id]);

    if (adminCount[0].total <= 1 && userIsAdmin[0].is_admin > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el último administrador del sistema",
      });
    }

    // Verificar si tiene registros asociados (viajes o visitas)
    const [viajes] = await db.query(
      "SELECT COUNT(*) as count FROM VIAJE WHERE created_by = ? OR updated_by = ?",
      [id, id]
    );
    const [visitas] = await db.query(
      "SELECT COUNT(*) as count FROM VISITA WHERE created_by = ? OR updated_by = ?",
      [id, id]
    );

    await db.query("START TRANSACTION");
    try {
      // Eliminar roles del usuario
      await db.query("DELETE FROM USUARIO_ROL WHERE id_usuario = ?", [id]);

      if (viajes[0].count === 0 && visitas[0].count === 0) {
        // Borrado físico si no tiene registros asociados
        await db.query("DELETE FROM USUARIO WHERE id_usuario = ?", [id]);
        console.log(`✅ Usuario ${id} eliminado completamente (borrado físico)`);
      } else {
        // Soft delete si tiene registros asociados
        await db.query(
          "UPDATE USUARIO SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
          [id]
        );
        console.log(`✅ Usuario ${id} desactivado (soft delete)`);
      }

      await db.query("COMMIT");
      res.json({
        success: true,
        message: "Usuario eliminado exitosamente",
      });
    } catch (transactionError) {
      await db.query("ROLLBACK");
      throw transactionError;
    }
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

// Restablecer contraseña de usuario (solo administradores)
const resetUserPassword = exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;

    console.log(`🔑 Restableciendo contraseña para usuario ID: ${id}`);

    // Verificar que el usuario existe
    const [user] = await db.query(
      "SELECT * FROM USUARIO WHERE id_usuario = ? AND activo = TRUE",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado o inactivo",
      });
    }

    const userData = user[0];

    // Generar nueva contraseña temporal
    const tempPassword = emailService.generateTemporaryPassword();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    await db.query(
      "UPDATE USUARIO SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [hashedPassword, id]
    );

    console.log(`✅ Contraseña restablecida para usuario ${id}`);

    // Enviar contraseña por email si está habilitado
    let emailResult = { success: true, message: "Email no enviado (deshabilitado)" };
    if (sendEmail && userData.email) {
      emailResult = await emailService.sendNewPassword(
        userData.email,
        userData.nombre_completo,
        tempPassword,
        true
      );
    }

    res.json({
      success: true,
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
      temporaryPassword: !emailResult.success ? tempPassword : undefined,
      message: "Contraseña restablecida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error restableciendo contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al restablecer contraseña",
      error: error.message,
    });
  }
};

// Alternar estado activo/inactivo de usuario (solo administradores)
exports.toggleUsuarioActivo = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.usuario.id_usuario; // Asegúrate que el middleware agrega esto

  try {
    // No permitir desactivarse a sí mismo
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "No puedes desactivar tu propia cuenta",
      });
    }

    // Verificar que el usuario existe
    const [usuario] = await db.query('SELECT * FROM USUARIO WHERE id_usuario = ?', [id]);
    if (!usuario || usuario.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Si se va a desactivar, verificar que no sea el último administrador activo
    if (usuario[0].activo) {
      const [adminCount] = await db.query(`
        SELECT COUNT(DISTINCT u.id_usuario) as total
        FROM USUARIO u
        JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
        JOIN ROL r ON ur.id_rol = r.id_rol
        WHERE r.nombre = 'ADMINISTRADOR' AND u.activo = TRUE
      `);

      const [userIsAdmin] = await db.query(`
        SELECT COUNT(*) as is_admin
        FROM USUARIO_ROL ur
        JOIN ROL r ON ur.id_rol = r.id_rol
        WHERE ur.id_usuario = ? AND r.nombre = 'ADMINISTRADOR'
      `, [id]);

      if (adminCount[0].total <= 1 && userIsAdmin[0].is_admin > 0) {
        return res.status(400).json({
          success: false,
          message: "No se puede desactivar el último administrador activo del sistema",
        });
      }
    }

    // Alternar estado
    const nuevoEstado = usuario[0].activo ? 0 : 1;
    await db.query('UPDATE USUARIO SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?', [nuevoEstado, id]);

    // Obtener usuario actualizado
    const [updatedUser] = await db.query(
      `SELECT u.id_usuario, u.username, u.nombre_completo, u.email, u.telefono, u.activo, u.created_at, u.updated_at,
              GROUP_CONCAT(r.nombre ORDER BY r.nombre) as roles,
              GROUP_CONCAT(r.id_rol ORDER BY r.nombre) as role_ids
       FROM USUARIO u
       LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
       LEFT JOIN ROL r ON ur.id_rol = r.id_rol
       WHERE u.id_usuario = ?
       GROUP BY u.id_usuario`,
      [id]
    );

    const userData = {
      ...updatedUser[0],
      roles: updatedUser[0].roles ? updatedUser[0].roles.split(',') : [],
      role_ids: updatedUser[0].role_ids ? updatedUser[0].role_ids.split(',').map(id => parseInt(id)) : [],
    };

    res.json({
      success: true,
      data: userData,
      activo: !!nuevoEstado,
      message: `Usuario ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
    });
  } catch (error) {
    console.error('❌ Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del usuario",
      error: error.message,
    });
  }
};

// Obtener todos los roles disponibles
const getRoles = async (req, res) => {
  try {
    console.log("🏷️ Obteniendo roles disponibles...");

    const [roles] = await db.query(`
      SELECT id_rol, nombre, descripcion, created_at, updated_at
      FROM ROL
      ORDER BY nombre ASC
    `);

    console.log(`✅ Se encontraron ${roles.length} roles`);

    res.json({
      success: true,
      data: roles,
      count: roles.length,
      message: "Roles obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener roles",
      error: error.message,
    });
  }
};

// Solicitar restablecimiento de contraseña (endpoint público)
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(`🔑 Solicitud de restablecimiento de contraseña para: ${email}`);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El email es requerido",
      });
    }

    // Buscar usuario por email
    const [user] = await db.query(
      "SELECT * FROM USUARIO WHERE email = ? AND activo = TRUE",
      [email]
    );

    // Por seguridad, siempre respondemos que se envió el email
    // aunque el usuario no exista
    if (user.length === 0) {
      console.log(`⚠️ Intento de restablecimiento para email no registrado: ${email}`);
      return res.json({
        success: true,
        message: "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña",
      });
    }

    const userData = user[0];

    // Generar nueva contraseña temporal
    const tempPassword = emailService.generateTemporaryPassword();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    await db.query(
      "UPDATE USUARIO SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [hashedPassword, userData.id_usuario]
    );

    console.log(`✅ Contraseña restablecida para usuario ${userData.id_usuario}`);

    // Enviar contraseña por email
    const emailResult = await emailService.sendNewPassword(
      userData.email,
      userData.nombre_completo,
      tempPassword,
      true
    );

    // Log para debugging (no incluir contraseña en logs de producción)
    if (!emailResult.success) {
      console.error("❌ Error enviando email de restablecimiento:", emailResult.message);
    }

    res.json({
      success: true,
      message: "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña",
    });
  } catch (error) {
    console.error("❌ Error en solicitud de restablecimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Verificar configuración del servicio de email
const checkEmailService = async (req, res) => {
  try {
    console.log("📧 Verificando configuración del servicio de email...");

    const verification = await emailService.verifyConnection();

    res.json({
      success: true,
      data: verification,
      message: verification.success
        ? "Servicio de email configurado correctamente"
        : "Problemas con la configuración del servicio de email",
    });
  } catch (error) {
    console.error("❌ Error verificando servicio de email:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar servicio de email",
      error: error.message,
    });
  }
};
