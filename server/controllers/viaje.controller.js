const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        v.*,
        r.nombre as ruta_nombre,
        r.origen,
        r.destino,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        u.nombre as repartidor_nombre
      FROM VIAJE v
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      LEFT JOIN USUARIO u ON v.id_repartidor = u.id
      ORDER BY v.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `
      SELECT
        v.*,
        r.nombre as ruta_nombre,
        r.origen,
        r.destino,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        u.nombre as repartidor_nombre
      FROM VIAJE v
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      LEFT JOIN USUARIO u ON v.id_repartidor = u.id
      WHERE v.id = ?
    `,
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
    const v = req.body;
    const created_by = v.created_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `INSERT INTO VIAJE (id_ruta, ruta, id_vehiculo, vehiculo, fecha, id_repartidor, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        v.id_ruta,
        v.ruta,
        v.id_vehiculo,
        v.vehiculo,
        v.fecha,
        v.id_repartidor,
        created_by,
      ],
    );

    // Return the created trip with related data
    const [newTrip] = await db.query(
      `
      SELECT
        v.*,
        r.nombre as ruta_nombre,
        r.origen,
        r.destino,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        u.nombre as repartidor_nombre
      FROM VIAJE v
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      LEFT JOIN USUARIO u ON v.id_repartidor = u.id
      WHERE v.id = ?
    `,
      [result.insertId],
    );

    res.json({ success: true, id: result.insertId, data: newTrip[0] });
  } catch (error) {
    console.error("Error creating viaje:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const v = req.body;
    const updated_by = v.updated_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `UPDATE VIAJE SET id_ruta=?, ruta=?, id_vehiculo=?, vehiculo=?, fecha=?, id_repartidor=?, updated_by=? WHERE id=?`,
      [
        v.id_ruta,
        v.ruta,
        v.id_vehiculo,
        v.vehiculo,
        v.fecha,
        v.id_repartidor,
        updated_by,
        id,
      ],
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM VIAJE WHERE id=?", [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
