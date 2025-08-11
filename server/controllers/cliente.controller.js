const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CLIENTE ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM CLIENTE WHERE id = ?', [id]);
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
      `INSERT INTO CLIENTE (nombre, codigo, id_tipo_cliente, id_zona_pvta, id_zona_tvta, ruc, ciudad, telefono, email, contacto_nombre, horario, estado, latitud, longitud, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.nombre, c.codigo, c.id_tipo_cliente, c.id_zona_pvta, c.id_zona_tvta, c.ruc, c.ciudad, c.telefono, c.email, c.contacto_nombre, c.horario, c.estado, c.latitud, c.longitud, c.created_by]
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
      `UPDATE CLIENTE SET nombre=?, codigo=?, id_tipo_cliente=?, id_zona_pvta=?, id_zona_tvta=?, ruc=?, ciudad=?, telefono=?, email=?, contacto_nombre=?, horario=?, estado=?, latitud=?, longitud=?, updated_by=? WHERE id=?`,
      [c.nombre, c.codigo, c.id_tipo_cliente, c.id_zona_pvta, c.id_zona_tvta, c.ruc, c.ciudad, c.telefono, c.email, c.contacto_nombre, c.horario, c.estado, c.latitud, c.longitud, c.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM CLIENTE WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};