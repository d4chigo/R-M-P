const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM RUTA ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM RUTA WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const r = req.body;
    const [result] = await db.query(
      `INSERT INTO RUTA (codigo, nombre, origen, destino, distancia_km, duracion_aproximada, tipo_ruta, estado, fecha_creacion, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.codigo, r.nombre, r.origen, r.destino, r.distancia_km, r.duracion_aproximada, r.tipo_ruta, r.estado, r.fecha_creacion, r.created_by]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const r = req.body;
    const [result] = await db.query(
      `UPDATE RUTA SET codigo=?, nombre=?, origen=?, destino=?, distancia_km=?, duracion_aproximada=?, tipo_ruta=?, estado=?, fecha_creacion=?, updated_by=? WHERE id=?`,
      [r.codigo, r.nombre, r.origen, r.destino, r.distancia_km, r.duracion_aproximada, r.tipo_ruta, r.estado, r.fecha_creacion, r.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM RUTA WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};