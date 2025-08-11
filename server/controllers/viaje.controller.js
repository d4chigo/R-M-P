const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VIAJE ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM VIAJE WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const v = req.body;
    const [result] = await db.query(
      `INSERT INTO VIAJE (id_ruta, ruta, id_vehiculo, vehiculo, fecha, id_repartidor, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [v.id_ruta, v.ruta, v.id_vehiculo, v.vehiculo, v.fecha, v.id_repartidor, v.created_by]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const v = req.body;
    const [result] = await db.query(
      `UPDATE VIAJE SET id_ruta=?, ruta=?, id_vehiculo=?, vehiculo=?, fecha=?, id_repartidor=?, updated_by=? WHERE id=?`,
      [v.id_ruta, v.ruta, v.id_vehiculo, v.vehiculo, v.fecha, v.id_repartidor, v.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM VIAJE WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};