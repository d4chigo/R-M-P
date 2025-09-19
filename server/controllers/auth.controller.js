const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "REMOVED_SECRET";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Crear primer admin
exports.createFirstAdmin = async (req, res) => {
  try {
    // Aceptar los mismos campos que envia el cliente
    const { username, nombre_completo, email, password, telefono } = req.body;

    // Validaciones básicas
    if (!username || !nombre_completo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, nombre_completo, email y password son requeridos'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario admin con una transacción
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insertar usuario (incluyendo telefono cuando exista)
      const [result] = await connection.query(
        `INSERT INTO USUARIO (username, password_hash, nombre_completo, email, telefono, activo)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [username, passwordHash, nombre_completo, email, telefono || null]
      );

      // Obtener o crear rol admin
      let [roles] = await connection.query(
        "SELECT id_rol FROM ROL WHERE nombre = 'ADMINISTRADOR'"
      );

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
        [result.insertId, adminRoleId]
      );

      await connection.commit();

      // Generar token
      const token = jwt.sign(
        { id_usuario: result.insertId, roles: ['ADMINISTRADOR'] },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 día
      });

      res.json({
        success: true,
        message: 'Administrador creado exitosamente',
        data: {
          id: result.insertId,
          username,
          nombre_completo,
          email,
          telefono: telefono || null,
          roles: ['ADMINISTRADOR']
        },
        token
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Error al crear primer admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el administrador',
      error: error.message
    });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("👤 Intento de login para:", email);

    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // ===== Rate limiting / intentos fallidos =====
    // Asegurarnos que exista la tabla LOGIN_ATTEMPT
    await db.query(`
      CREATE TABLE IF NOT EXISTS LOGIN_ATTEMPT (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        attempts INT DEFAULT 0,
        last_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        locked_until DATETIME DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_login_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Obtener estado de intentos para este email
    const [attemptRows] = await db.query('SELECT * FROM LOGIN_ATTEMPT WHERE email = ?', [email]);
    const attemptRec = attemptRows && attemptRows[0] ? attemptRows[0] : null;
    const now = new Date();
    if (attemptRec && attemptRec.locked_until) {
      const lockedUntil = new Date(attemptRec.locked_until);
      if (lockedUntil > now) {
        const diffMs = lockedUntil - now;
        return res.status(429).json({ success: false, message: 'Demasiados intentos. Intenta más tarde.', lockedUntil: lockedUntil.toISOString(), attemptsLeft: 0 });
      }
    }

    // ===== Buscar usuario por email y obtener sus roles en una sola consulta =====
    const [rows] = await db.query(`
      SELECT 
        u.*,
        GROUP_CONCAT(DISTINCT r.nombre) as roles_list
      FROM USUARIO u
      LEFT JOIN USUARIO_ROL ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN ROL r ON ur.id_rol = r.id_rol
      WHERE u.email = ? AND u.activo = TRUE
      GROUP BY u.id_usuario
    `, [email]);

    console.log("🔍 Resultado de búsqueda:", rows.length ? "Usuario encontrado" : "Usuario no encontrado");

    if (!rows.length) {
      // Incrementar contador de intentos fallidos
      if (attemptRec) {
        const newAttempts = (attemptRec.attempts || 0) + 1;
        let lockedUntil = null;
        if (newAttempts >= 5) {
          // Bloquear por 30 minutos
          lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
          await db.query('UPDATE LOGIN_ATTEMPT SET attempts = ?, last_attempt_at = NOW(), locked_until = ? WHERE email = ?', [0, lockedUntil.toISOString().slice(0,19).replace('T',' '), email]);
          return res.status(429).json({ success: false, message: 'Demasiados intentos. Intenta más tarde.', lockedUntil: lockedUntil.toISOString(), attemptsLeft: 0 });
        } else {
          await db.query('UPDATE LOGIN_ATTEMPT SET attempts = ?, last_attempt_at = NOW() WHERE email = ?', [newAttempts, email]);
          return res.status(401).json({ success: false, message: 'Credenciales inválidas', attemptsLeft: Math.max(0, 5 - newAttempts) });
        }
      } else {
        // Crear registro de intento
        await db.query('INSERT INTO LOGIN_ATTEMPT (email, attempts, last_attempt_at) VALUES (?, 1, NOW())', [email]);
        return res.status(401).json({ success: false, message: 'Credenciales inválidas', attemptsLeft: 4 });
      }
    }

    const user = rows[0];

    // Validar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: "Tu cuenta está inactiva. Contacta al administrador.",
      });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Manejar intentos fallidos: incrementar contador y posiblemente bloquear
      if (attemptRec) {
        const newAttempts = (attemptRec.attempts || 0) + 1;
        if (newAttempts >= 5) {
          const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
          await db.query('UPDATE LOGIN_ATTEMPT SET attempts = ?, last_attempt_at = NOW(), locked_until = ? WHERE email = ?', [0, lockedUntil.toISOString().slice(0,19).replace('T',' '), email]);
          return res.status(429).json({ success: false, message: 'Demasiados intentos. Intenta más tarde.', lockedUntil: lockedUntil.toISOString(), attemptsLeft: 0 });
        } else {
          await db.query('UPDATE LOGIN_ATTEMPT SET attempts = ?, last_attempt_at = NOW() WHERE email = ?', [newAttempts, email]);
          return res.status(401).json({ success: false, message: 'Credenciales inválidas', attemptsLeft: Math.max(0, 5 - newAttempts) });
        }
      } else {
        await db.query('INSERT INTO LOGIN_ATTEMPT (email, attempts, last_attempt_at) VALUES (?, 1, NOW())', [email]);
        return res.status(401).json({ success: false, message: 'Credenciales inválidas', attemptsLeft: 4 });
      }
    }

    // Procesar roles del usuario
    const roles = user.roles_list ? user.roles_list.split(',') : [];

    // Generar token JWT con los roles incluidos
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        roles: roles
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

  // Respuesta exitosa (no incluir contraseña)
  const { password_hash: _, ...usuarioSinPassword } = user;
  // Ensure must_change_password is returned to client
  usuarioSinPassword.must_change_password = !!user.must_change_password;

    console.log("✅ Login exitoso para:", email, "Roles:", roles);

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        usuario: {
          ...usuarioSinPassword,
          roles_list: roles,
          must_change_password: usuarioSinPassword.must_change_password || false,
        },
        token,
      },
    });
    // Login exitoso -> resetear intentos
    try {
      await db.query('DELETE FROM LOGIN_ATTEMPT WHERE email = ?', [email]);
    } catch (err) {
      console.warn('No se pudo limpiar LOGIN_ATTEMPT tras login exitoso:', err.message || err);
    }
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
  "UPDATE USUARIO SET password_hash = ?, updated_at = CURRENT_TIMESTAMP, must_change_password = FALSE WHERE id_usuario = ?",
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
    if (!email) {
      return res.status(400).json({ success: false, message: "Email requerido" });
    }

    // Buscar usuario
    const [rows] = await db.query("SELECT * FROM USUARIO WHERE email = ?", [email]);
    if (!rows.length) {
      // Responder igual para evitar enumeración de usuarios
      return res.json({ success: true, message: "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña." });
    }

    const user = rows[0];

    // Generar token seguro y fecha de expiración (ej: 1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token y expiración en la BD
    await db.query(
      "UPDATE USUARIO SET reset_token = ?, reset_token_expires = ? WHERE id_usuario = ?",
      [resetToken, expires, user.id_usuario]
    );

    // Construir enlace de recuperación
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Enviar email con el enlace
    await emailService.sendPasswordResetEmail(user.email, user.nombre_completo, resetUrl);

    return res.json({
      success: true,
      message: "Si el email está registrado, recibirás instrucciones para restablecer tu contraseña."
    });
  } catch (error) {
    console.error("Error en requestPasswordReset:", error);
    res.status(500).json({ success: false, message: "Error al solicitar recuperación" });
  }
};

// Restablecer contraseña usando el token
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token y nueva contraseña requeridos" });
    }

    // Buscar usuario con ese token y que no haya expirado
    const [rows] = await db.query(
      "SELECT * FROM USUARIO WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );
    if (!rows.length) {
      return res.status(400).json({ success: false, message: "Token inválido o expirado" });
    }

    const user = rows[0];
    const password_hash = await bcrypt.hash(password, 10);

    // Actualizar contraseña y limpiar token
    await db.query(
      "UPDATE USUARIO SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id_usuario = ?",
      [password_hash, user.id_usuario]
    );

    res.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en resetPasswordWithToken:", error);
    res.status(500).json({ success: false, message: "Error al restablecer contraseña" });
  }
};
