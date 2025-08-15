const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ZONA ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM ZONA WHERE id = ?", [id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "No encontrado" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const z = req.body;
    const created_by = z.created_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `INSERT INTO ZONA (codigo, nombre, descripcion, region, latitud, longitud, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        z.codigo,
        z.nombre,
        z.descripcion,
        z.region,
        z.latitud,
        z.longitud,
        created_by,
      ],
    );

    // Return the created zona with complete data
    const [newZona] = await db.query("SELECT * FROM ZONA WHERE id = ?", [
      result.insertId,
    ]);
    res.json({ success: true, id: result.insertId, data: newZona[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const z = req.body;
    const updated_by = z.updated_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `UPDATE ZONA SET codigo=?, nombre=?, descripcion=?, region=?, latitud=?, longitud=?, updated_by=? WHERE id=?`,
      [
        z.codigo,
        z.nombre,
        z.descripcion,
        z.region,
        z.latitud,
        z.longitud,
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

    // Get zona info before deletion for logging
    const [existingZona] = await db.query(
      "SELECT codigo, nombre FROM ZONA WHERE id = ?",
      [id],
    );

    // Proceed with deletion
    const [result] = await db.query("DELETE FROM ZONA WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada",
      });
    }

    const zonaNombre =
      existingZona.length > 0
        ? `${existingZona[0].codigo} - ${existingZona[0].nombre}`
        : id;
    console.log(`✅ Zona ${zonaNombre} eliminada correctamente`);

    res.json({
      success: true,
      affectedRows: result.affectedRows,
      message: "Zona eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error deleting zona:", error);

    // Handle specific MySQL errors
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar esta zona porque tiene clientes asociados. Primero debe reasignar o eliminar los clientes que usan esta zona.",
      });
    }

    // Generic database error
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar la zona",
    });
  }
};

exports.getByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await db.query("SELECT * FROM ZONA WHERE codigo = ?", [
      codigo,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Zona no encontrada" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
