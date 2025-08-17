const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");

const JWT_SECRET = process.env.JWT_SECRET || "REMOVED_SECRET";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Crear primer admin
exports.createFirstAdmin = async (req, res) => {
    try {
        const { nombre, apellidos, email, password } = req.body;

        // Encriptar password
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear nuevo usuario admin con una transacción
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insertar usuario
            const [result] = await connection.query(
                "INSERT INTO USUARIO (username, password_hash, nombre_completo, email) VALUES (?, ?, ?, ?)",
                [email, passwordHash, `${nombre} ${apellidos}`, email]
            );

            // Obtener el id del rol admin
            const [roles] = await connection.query(
                "SELECT id_rol FROM ROL WHERE nombre = 'ADMINISTRADOR'"
            );

            if (!roles.length) {
                throw new Error("Rol de administrador no encontrado");
            }

            // Asignar rol de admin al usuario
            await connection.query(
                "INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES (?, ?)",
                [result.insertId, roles[0].id_rol]
            );

            await connection.commit();

            // Generar token
            const token = jwt.sign(
                { id: result.insertId, rol: 'admin' },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 día
            });

            res.json({
                success: true,
                message: "Administrador creado exitosamente",
                data: {
                    id: result.insertId,
                    nombre,
                    apellidos,
                    email,
                    rol: 'admin'
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error al crear el administrador",
            error: error.message 
        });
    }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario por email
    const [rows] = await db.query(
      "SELECT * FROM USUARIO WHERE email = ? AND activo = TRUE",
      [email],
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const usuario = rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Obtener roles del usuario y respuesta completa
    const [userWithRoles] = await db.query(`
      SELECT 
        u.*,
        GROUP_CONCAT(r.nombre) as roles_list
      FROM USUARIO u
      LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN ROL r ON ur.id_rol = r.id_rol
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario
    `, [usuario.id_usuario]);

    const roles = userWithRoles.roles_list ? userWithRoles.roles_list.split(',') : [];

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        roles: roles,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // Respuesta exitosa (no incluir contraseña)
    const { password_hash: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        usuario: usuarioSinPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Logout (invalidar token - en este caso solo confirmamos)
exports.logout = async (req, res) => {
  try {
    // En una implementación más robusta, se podría mantener una blacklist de tokens
    res.json({
      success: true,
      message: "Logout exitoso",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Verificar token y obtener información del usuario
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar usuario actual con sus roles
    const [rows] = await db.query(
      `SELECT 
        u.id_usuario, 
        u.username, 
        u.nombre_completo, 
        u.email, 
        u.telefono, 
        u.activo, 
        u.created_at, 
        u.updated_at,
        GROUP_CONCAT(r.nombre) as roles_list,
        GROUP_CONCAT(r.id_rol) as role_ids
      FROM USUARIO u
      LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN ROL r ON ur.id_rol = r.id_rol
      WHERE u.id_usuario = ? AND u.activo = TRUE
      GROUP BY u.id_usuario`,
      [decoded.id_usuario],
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado o inactivo",
      });
    }

    // Procesar los roles
    const usuario = {
      ...rows[0],
      roles_list: rows[0].roles_list ? rows[0].roles_list.split(',') : [],
      role_ids: rows[0].role_ids ? rows[0].role_ids.split(',').map(Number) : []
    };

    res.json({
      success: true,
      data: {
        usuario,
        token,
      },
    });
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

    console.error("Error en verificación de token:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.usuario.id_usuario;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva contraseña son requeridas",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    // Obtener usuario actual
    const [rows] = await db.query(
      "SELECT password_hash FROM USUARIO WHERE id_usuario = ?",
      [userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      rows[0].password_hash,
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await db.query(
      "UPDATE USUARIO SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = ?",
      [hashedNewPassword, userId],
    );

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Registrar nuevo usuario (solo para administradores)
exports.register = async (req, res) => {
  try {
    const { username, password, nombre_completo, email, telefono } = req.body;

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

    // Crear usuario
    const [result] = await db.query(
      `INSERT INTO USUARIO (username, password_hash, nombre_completo, email, telefono, activo)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [
        username,
        hashedPassword,
        nombre_completo,
        email || null,
        telefono || null,
      ],
    );

    console.log(`✅ Usuario creado con ID: ${result.insertId}`);

    // Obtener el usuario creado (sin contraseña)
    const [newUser] = await db.query(
      `SELECT id_usuario, username, nombre_completo, email, telefono, activo, created_at, updated_at
       FROM USUARIO WHERE id_usuario = ?`,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newUser[0],
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    const userId = req.usuario.id_usuario;

    const [rows] = await db.query(
      `SELECT id_usuario, username, nombre_completo, email, telefono, activo, created_at, updated_at
       FROM USUARIO WHERE id_usuario = ?`,
      [userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      data: rows[0],
      message: "Perfil obtenido exitosamente",
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.usuario.id_usuario;
    const { nombre_completo, email, telefono } = req.body;

    // Verificar que el email no exista en otro usuario (si se proporciona)
    if (email) {
      const [existingEmail] = await db.query(
        "SELECT id_usuario FROM USUARIO WHERE email = ? AND id_usuario != ?",
        [email, userId],
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro usuario con ese email",
        });
      }
    }

    // Actualizar perfil
    await db.query(
      `UPDATE USUARIO SET
       nombre_completo = COALESCE(?, nombre_completo),
       email = ?,
       telefono = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario = ?`,
      [nombre_completo, email, telefono, userId],
    );

    // Obtener usuario actualizado
    const [updatedUser] = await db.query(
      `SELECT id_usuario, username, nombre_completo, email, telefono, activo, created_at, updated_at
       FROM USUARIO WHERE id_usuario = ?`,
      [userId],
    );

    res.json({
      success: true,
      data: updatedUser[0],
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Solicitar restablecimiento de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(
      `🔑 Solicitud de restablecimiento de contraseña para: ${email}`,
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El email es requerido",
      });
    }

    // Buscar usuario por email
    const [user] = await db.query(
      "SELECT * FROM USUARIO WHERE email = ? AND activo = TRUE",
      [email],
    );

    // Por seguridad, siempre respondemos que se envió el email
    // aunque el usuario no exista
    if (user.length === 0) {
      console.log(
        `⚠️ Intento de restablecimiento para email no registrado: ${email}`,
      );
      return res.json({
        success: true,
        message:
          "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña",
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
      [hashedPassword, userData.id_usuario],
    );

    console.log(
      `✅ Contraseña restablecida para usuario ${userData.id_usuario}`,
    );

    // Enviar contraseña por email
    const emailResult = await emailService.sendNewPassword(
      userData.email,
      userData.nombre_completo,
      tempPassword,
      true,
    );

    // Log para debugging (no incluir contraseña en logs de producción)
    if (!emailResult.success) {
      console.error(
        "❌ Error enviando email de restablecimiento:",
        emailResult.message,
      );
    }

    res.json({
      success: true,
      message:
        "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña",
    });
  } catch (error) {
    console.error("❌ Error en solicitud de restablecimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
