const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        vis.*,
        c.nombre as cliente_nombre,
        c.codigo as cliente_codigo,
        c.ruc as cliente_ruc,
        v.fecha as viaje_fecha,
        r.nombre as ruta_nombre,
        vh.placa as vehiculo_placa
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      ORDER BY vis.id DESC
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
        vis.*,
        c.nombre as cliente_nombre,
        c.codigo as cliente_codigo,
        c.ruc as cliente_ruc,
        v.fecha as viaje_fecha,
        r.nombre as ruta_nombre,
        vh.placa as vehiculo_placa
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      WHERE vis.id = ?
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
      `INSERT INTO VISITA (id_viaje, id_cliente, entrega, recojo, llega, sale, sec1, sec2, distancia_km, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        v.id_viaje,
        v.id_cliente,
        v.entrega,
        v.recojo,
        v.llega,
        v.sale,
        v.sec1,
        v.sec2,
        v.distancia_km,
        created_by,
      ],
    );

    // Return the created visit with related data
    const [newVisit] = await db.query(
      `
      SELECT
        vis.*,
        c.nombre as cliente_nombre,
        c.codigo as cliente_codigo,
        c.ruc as cliente_ruc,
        v.fecha as viaje_fecha,
        r.nombre as ruta_nombre,
        vh.placa as vehiculo_placa
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id
      LEFT JOIN RUTA r ON v.id_ruta = r.id
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id
      WHERE vis.id = ?
    `,
      [result.insertId],
    );

    res.json({ success: true, id: result.insertId, data: newVisit[0] });
  } catch (error) {
    console.error("Error creating visita:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const v = req.body;
    const updated_by = v.updated_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `UPDATE VISITA SET id_viaje=?, id_cliente=?, entrega=?, recojo=?, llega=?, sale=?, sec1=?, sec2=?, distancia_km=?, updated_by=? WHERE id=?`,
      [
        v.id_viaje,
        v.id_cliente,
        v.entrega,
        v.recojo,
        v.llega,
        v.sale,
        v.sec1,
        v.sec2,
        v.distancia_km,
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
    const [result] = await db.query("DELETE FROM VISITA WHERE id=?", [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
