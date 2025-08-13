const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.*,
        tc.nombre as tipo_cliente_nombre,
        zp.nombre as zona_pvta_nombre,
        zt.nombre as zona_tvta_nombre,
        u.nombre as created_by_nombre
      FROM CLIENTE c
      LEFT JOIN TIPO_CLIENTE tc ON c.id_tipo_cliente = tc.id
      LEFT JOIN ZONA zp ON c.id_zona_pvta = zp.id
      LEFT JOIN ZONA zt ON c.id_zona_tvta = zt.id
      LEFT JOIN USUARIO u ON c.created_by = u.id
      ORDER BY c.id DESC
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
        c.*,
        tc.nombre as tipo_cliente_nombre,
        zp.nombre as zona_pvta_nombre,
        zt.nombre as zona_tvta_nombre,
        u.nombre as created_by_nombre
      FROM CLIENTE c
      LEFT JOIN TIPO_CLIENTE tc ON c.id_tipo_cliente = tc.id
      LEFT JOIN ZONA zp ON c.id_zona_pvta = zp.id
      LEFT JOIN ZONA zt ON c.id_zona_tvta = zt.id
      LEFT JOIN USUARIO u ON c.created_by = u.id
      WHERE c.id = ?
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
    const c = req.body;
    const created_by = c.created_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `INSERT INTO CLIENTE (nombre, codigo, id_tipo_cliente, id_zona_pvta, id_zona_tvta, ruc, ciudad, telefono, email, contacto_nombre, horario, estado, latitud, longitud, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.nombre,
        c.codigo,
        c.id_tipo_cliente,
        c.id_zona_pvta,
        c.id_zona_tvta,
        c.ruc,
        c.ciudad,
        c.telefono,
        c.email,
        c.contacto_nombre,
        c.horario,
        c.estado,
        c.latitud,
        c.longitud,
        created_by,
      ],
    );

    // Return the created client with related data
    const [newClient] = await db.query(
      `
      SELECT
        c.*,
        tc.nombre as tipo_cliente_nombre,
        zp.nombre as zona_pvta_nombre,
        zt.nombre as zona_tvta_nombre,
        u.nombre as created_by_nombre
      FROM CLIENTE c
      LEFT JOIN TIPO_CLIENTE tc ON c.id_tipo_cliente = tc.id
      LEFT JOIN ZONA zp ON c.id_zona_pvta = zp.id
      LEFT JOIN ZONA zt ON c.id_zona_tvta = zt.id
      LEFT JOIN USUARIO u ON c.created_by = u.id
      WHERE c.id = ?
    `,
      [result.insertId],
    );

    res.json({ success: true, id: result.insertId, data: newClient[0] });
  } catch (error) {
    console.error("Error creating cliente:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    const updated_by = c.updated_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `UPDATE CLIENTE SET nombre=?, codigo=?, id_tipo_cliente=?, id_zona_pvta=?, id_zona_tvta=?, ruc=?, ciudad=?, telefono=?, email=?, contacto_nombre=?, horario=?, estado=?, latitud=?, longitud=?, updated_by=? WHERE id=?`,
      [
        c.nombre,
        c.codigo,
        c.id_tipo_cliente,
        c.id_zona_pvta,
        c.id_zona_tvta,
        c.ruc,
        c.ciudad,
        c.telefono,
        c.email,
        c.contacto_nombre,
        c.horario,
        c.estado,
        c.latitud,
        c.longitud,
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
    const [result] = await db.query("DELETE FROM CLIENTE WHERE id=?", [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
