const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM RUTA ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM RUTA WHERE id = ?", [id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "No encontrado" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const r = req.body;
    const created_by = r.created_by || 1; // Default to user ID 1 if not provided
    const fecha_creacion =
      r.fecha_creacion ||
      new Date().toISOString().slice(0, 19).replace("T", " ");

    // Log the data being inserted for debugging
    console.log("🚛 Creating ruta with data:", {
      codigo: r.codigo,
      nombre: r.nombre,
      origen: r.origen,
      destino: r.destino,
      distancia_km: r.distancia_km,
      duracion_aproximada: r.duracion_aproximada,
      tipo_ruta: r.tipo_ruta,
      estado: r.estado,
      fecha_creacion,
      created_by,
    });

    const [result] = await db.query(
      `INSERT INTO RUTA (codigo, nombre, origen, destino, distancia_km, duracion_aproximada, tipo_ruta, estado, fecha_creacion, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.codigo,
        r.nombre,
        r.origen,
        r.destino,
        r.distancia_km,
        r.duracion_aproximada,
        r.tipo_ruta,
        r.estado,
        fecha_creacion,
        created_by,
      ],
    );

    // Return the created route with complete data
    const [newRoute] = await db.query("SELECT * FROM RUTA WHERE id = ?", [
      result.insertId,
    ]);
    res.json({ success: true, id: result.insertId, data: newRoute[0] });
  } catch (error) {
    console.error("❌ Error creating ruta:", error);

    // Handle specific MySQL errors
    if (error.code === "ER_DATA_TOO_LONG") {
      return res.status(400).json({
        success: false,
        message:
          "Uno o más campos exceden el tamaño máximo permitido. Verifique que los valores no sean demasiado largos.",
        details: error.message,
      });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message:
          "Ya existe una ruta con este código. Por favor use un código diferente.",
        details: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la ruta",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const r = req.body;
    const updated_by = r.updated_by || 1; // Default to user ID 1 if not provided

    const [result] = await db.query(
      `UPDATE RUTA SET codigo=?, nombre=?, origen=?, destino=?, distancia_km=?, duracion_aproximada=?, tipo_ruta=?, estado=?, updated_by=? WHERE id=?`,
      [
        r.codigo,
        r.nombre,
        r.origen,
        r.destino,
        r.distancia_km,
        r.duracion_aproximada,
        r.tipo_ruta,
        r.estado,
        updated_by,
        id,
      ],
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error("Error updating ruta:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM RUTA WHERE id=?", [id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
