const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, estado, created_at, updated_at FROM USUARIO ORDER BY id DESC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, nombre, email, estado, created_at, updated_at FROM USUARIO WHERE id = ?",
      [id],
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "No encontrado" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const u = req.body;

    // Validaciones básicas
    if (!u.nombre || !u.email || !u.contrasena) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y contraseña son requeridos",
      });
    }

    // Verificar si el email ya existe
    const [existingUser] = await db.query(
      "SELECT id FROM USUARIO WHERE email = ?",
      [u.email],
    );
    if (existingUser.length) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(u.contrasena, saltRounds);

    const [result] = await db.query(
      `INSERT INTO USUARIO (nombre, contrasena, email, estado, created_by) VALUES (?, ?, ?, ?, ?)`,
      [u.nombre, hashedPassword, u.email, u.estado || 1, u.created_by],
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const u = req.body;

    // Si se proporciona una nueva contraseña, hacer hash
    let updateQuery = `UPDATE USUARIO SET nombre=?, email=?, estado=?, updated_by=? WHERE id=?`;
    let updateParams = [u.nombre, u.email, u.estado, u.updated_by, id];

    if (u.contrasena && u.contrasena.trim() !== "") {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(u.contrasena, saltRounds);
      updateQuery = `UPDATE USUARIO SET nombre=?, contrasena=?, email=?, estado=?, updated_by=? WHERE id=?`;
      updateParams = [
        u.nombre,
        hashedPassword,
        u.email,
        u.estado,
        u.updated_by,
        id,
      ];
    }

    const [result] = await db.query(updateQuery, updateParams);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM USUARIO WHERE id=?", [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
