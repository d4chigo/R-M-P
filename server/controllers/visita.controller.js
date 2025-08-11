const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VISITA ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM VISITA WHERE id = ?', [id]);
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
      `INSERT INTO VISITA (id_viaje, id_cliente, entrega, recojo, llega, sale, sec1, sec2, distancia_km, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id_viaje, v.id_cliente, v.entrega, v.recojo, v.llega, v.sale, v.sec1, v.sec2, v.distancia_km, v.created_by]
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
      `UPDATE VISITA SET id_viaje=?, id_cliente=?, entrega=?, recojo=?, llega=?, sale=?, sec1=?, sec2=?, distancia_km=?, updated_by=? WHERE id=?`,
      [v.id_viaje, v.id_cliente, v.entrega, v.recojo, v.llega, v.sale, v.sec1, v.sec2, v.distancia_km, v.updated_by, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM VISITA WHERE id=?', [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};