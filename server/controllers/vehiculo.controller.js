const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM VEHICULO ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM VEHICULO WHERE id = ?", [id]);
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
      `INSERT INTO VEHICULO (placa, marca, modelo, anio, tipo, capacidad_carga_kg, tipo_carga, estado, fecha_adquisicion, vin, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        v.placa,
        v.marca,
        v.modelo,
        v.anio,
        v.tipo,
        v.capacidad_carga_kg,
        v.tipo_carga,
        v.estado,
        v.fecha_adquisicion,
        v.vin,
        created_by,
      ],
    );

    // Return the created vehicle with complete data
    const [newVehicle] = await db.query("SELECT * FROM VEHICULO WHERE id = ?", [
      result.insertId,
    ]);
    res.json({ success: true, id: result.insertId, data: newVehicle[0] });
  } catch (error) {
    console.error("Error creating vehiculo:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const v = req.body;
    const updated_by = v.updated_by || 1; // Default to user ID 1 if not provided
    const [result] = await db.query(
      `UPDATE VEHICULO SET placa=?, marca=?, modelo=?, anio=?, tipo=?, capacidad_carga_kg=?, tipo_carga=?, estado=?, fecha_adquisicion=?, vin=?, updated_by=? WHERE id=?`,
      [
        v.placa,
        v.marca,
        v.modelo,
        v.anio,
        v.tipo,
        v.capacidad_carga_kg,
        v.tipo_carga,
        v.estado,
        v.fecha_adquisicion,
        v.vin,
        updated_by,
        id,
      ],
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error("Error updating vehiculo:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Get vehicle info before deletion for logging
    const [existingVehicle] = await db.query(
      "SELECT placa FROM VEHICULO WHERE id = ?",
      [id],
    );

    // Proceed with deletion
    const [result] = await db.query("DELETE FROM VEHICULO WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    const placa = existingVehicle.length > 0 ? existingVehicle[0].placa : id;
    console.log(`✅ Vehículo ${placa} eliminado correctamente`);

    res.json({
      success: true,
      affectedRows: result.affectedRows,
      message: `Vehículo eliminado correctamente`,
    });
  } catch (error) {
    console.error("❌ Error deleting vehiculo:", error);

    // Handle specific MySQL errors
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar este vehículo porque tiene viajes asociados. Primero debe eliminar los viajes que usan este vehículo.",
      });
    }

    // Generic database error
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar el vehículo",
    });
  }
};
