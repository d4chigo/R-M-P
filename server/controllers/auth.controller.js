const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "REMOVED_SECRET";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

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

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
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

    // Buscar usuario actual
    const [rows] = await db.query(
      "SELECT id_usuario, username, nombre_completo, email, telefono, activo, created_at, updated_at FROM USUARIO WHERE id_usuario = ? AND activo = TRUE",
      [decoded.id_usuario],
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado o inactivo",
      });
    }

    res.json({
      success: true,
      data: {
        usuario: rows[0],
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
