const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CARRETA ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM CARRETA WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const c = req.body;
    const [result] = await db.query(
      `INSERT INTO CARRETA (placa, tipo, capacidad_kg, estado, created_by) VALUES (?, ?, ?, ?, ?)`,
      [c.placa, c.tipo, c.capacidad_kg, c.estado, c.created_by]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    const [result] = await db.query(
      `UPDATE CARRETA SET placa=?, tipo=?, capacidad_kg=?, estado=?, updated_by=? WHERE id=?`,
      [c.placa, c.tipo, c.capacidad_kg, c.estado, c.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM CARRETA WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};