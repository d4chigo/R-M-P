const db = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    console.log("🚛 Obteniendo todas las carretas...");
    const [rows] = await db.query("SELECT * FROM CARRETA ORDER BY id DESC");
    console.log(`✅ Carretas obtenidas: ${rows.length} registros`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error en getAll carretas:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message,
        error: error.toString(),
      });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando carreta ID: ${id}`);
    const [rows] = await db.query("SELECT * FROM CARRETA WHERE id = ?", [id]);
    if (!rows.length) {
      console.log(`⚠️ Carreta ID ${id} no encontrada`);
      return res
        .status(404)
        .json({ success: false, message: "Carreta no encontrada" });
    }
    console.log(`✅ Carreta ID ${id} encontrada`);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`❌ Error obteniendo carreta ID ${id}:`, error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message,
        error: error.toString(),
      });
  }
};

exports.create = async (req, res) => {
  try {
    const c = req.body;
    console.log("➕ Creando nueva carreta:", JSON.stringify(c, null, 2));

    // Validaciones básicas
    if (!c.placa || !c.tipo || !c.capacidad_kg || !c.estado) {
      console.log("❌ Datos faltantes para crear carreta");
      return res.status(400).json({
        success: false,
        message:
          "Datos requeridos faltantes: placa, tipo, capacidad_kg, estado",
      });
    }

    const [result] = await db.query(
      `INSERT INTO CARRETA (placa, tipo, capacidad_kg, estado, created_by) VALUES (?, ?, ?, ?, ?)`,
      [c.placa, c.tipo, c.capacidad_kg, c.estado, c.created_by || "sistema"],
    );

    console.log(`✅ Carreta creada con ID: ${result.insertId}`);

    // Devolver la carreta creada completa
    const [newCarreta] = await db.query("SELECT * FROM CARRETA WHERE id = ?", [
      result.insertId,
    ]);
    res.json({ success: true, data: newCarreta[0] });
  } catch (error) {
    console.error("❌ Error creando carreta:", error);
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ success: false, message: "La placa ya existe en el sistema" });
    } else {
      res
        .status(500)
        .json({
          success: false,
          message: error.message,
          error: error.toString(),
        });
    }
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    console.log(
      `📝 Actualizando carreta ID: ${id}`,
      JSON.stringify(c, null, 2),
    );

    // Verificar que la carreta existe
    const [existing] = await db.query("SELECT * FROM CARRETA WHERE id = ?", [
      id,
    ]);
    if (!existing.length) {
      console.log(`⚠️ Carreta ID ${id} no encontrada para actualizar`);
      return res
        .status(404)
        .json({ success: false, message: "Carreta no encontrada" });
    }

    const [result] = await db.query(
      `UPDATE CARRETA SET placa=?, tipo=?, capacidad_kg=?, estado=?, updated_by=? WHERE id=?`,
      [
        c.placa,
        c.tipo,
        c.capacidad_kg,
        c.estado,
        c.updated_by || "sistema",
        id,
      ],
    );

    console.log(
      `✅ Carreta ID ${id} actualizada, filas afectadas: ${result.affectedRows}`,
    );

    // Devolver la carreta actualizada
    const [updatedCarreta] = await db.query(
      "SELECT * FROM CARRETA WHERE id = ?",
      [id],
    );
    res.json({ success: true, data: updatedCarreta[0] });
  } catch (error) {
    console.error(`❌ Error actualizando carreta ID ${id}:`, error);
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ success: false, message: "La placa ya existe en el sistema" });
    } else {
      res
        .status(500)
        .json({
          success: false,
          message: error.message,
          error: error.toString(),
        });
    }
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando carreta ID: ${id}`);

    // Verificar que la carreta existe
    const [existing] = await db.query("SELECT * FROM CARRETA WHERE id = ?", [
      id,
    ]);
    if (!existing.length) {
      console.log(`⚠️ Carreta ID ${id} no encontrada para eliminar`);
      return res
        .status(404)
        .json({ success: false, message: "Carreta no encontrada" });
    }

    const [result] = await db.query("DELETE FROM CARRETA WHERE id=?", [id]);
    console.log(
      `✅ Carreta ID ${id} eliminada, filas afectadas: ${result.affectedRows}`,
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error(`❌ Error eliminando carreta ID ${id}:`, error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      res
        .status(400)
        .json({
          success: false,
          message: "No se puede eliminar: la carreta está siendo utilizada",
        });
    } else {
      res
        .status(500)
        .json({
          success: false,
          message: error.message,
          error: error.toString(),
        });
    }
  }
};
