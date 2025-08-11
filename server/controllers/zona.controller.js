const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ZONA ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM ZONA WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const z = req.body;
    const [result] = await db.query(
      `INSERT INTO ZONA (nombre, descripcion, region, latitud, longitud, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [z.nombre, z.descripcion, z.region, z.latitud, z.longitud, z.created_by]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const z = req.body;
    const [result] = await db.query(
      `UPDATE ZONA SET nombre=?, descripcion=?, region=?, latitud=?, longitud=?, updated_by=? WHERE id=?`,
      [z.nombre, z.descripcion, z.region, z.latitud, z.longitud, z.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM ZONA WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};