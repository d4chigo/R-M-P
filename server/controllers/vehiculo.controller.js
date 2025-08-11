const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VEHICULO ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM VEHICULO WHERE id = ?', [id]);
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
      `INSERT INTO VEHICULO (placa, marca, modelo, anio, tipo, capacidad_carga_kg, tipo_carga, estado, fecha_adquisicion, vin, id_carreta, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.placa, v.marca, v.modelo, v.anio, v.tipo, v.capacidad_carga_kg, v.tipo_carga, v.estado, v.fecha_adquisicion, v.vin, v.id_carreta, v.created_by]
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
      `UPDATE VEHICULO SET placa=?, marca=?, modelo=?, anio=?, tipo=?, capacidad_carga_kg=?, tipo_carga=?, estado=?, fecha_adquisicion=?, vin=?, id_carreta=?, updated_by=? WHERE id=?`,
      [v.placa, v.marca, v.modelo, v.anio, v.tipo, v.capacidad_carga_kg, v.tipo_carga, v.estado, v.fecha_adquisicion, v.vin, v.id_carreta, v.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM VEHICULO WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};