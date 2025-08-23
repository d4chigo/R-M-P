const db = require("../config/db");

// Obtener todos los registros de tesorería (nuevo esquema)
const getTesoreria = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de tesorería (nuevo esquema)...");

    const [rows] = await db.query(
      `SELECT id, fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, turno, encargado, monto, created_at, updated_at
       FROM tesoreria
       ORDER BY fecha DESC, id DESC`
    );

    console.log(`✅ Se encontraron ${rows.length} registros de tesorería`);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: "Registros de tesorería obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener registros de tesorería",
      error: error.message,
    });
  }
};

// Obtener un registro de tesorería por ID (nuevo esquema)
const getTesoreriaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando registro de tesorería con ID: ${id}`);

    const [rows] = await db.query(
      `SELECT id, fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, turno, encargado, monto, created_at, updated_at
       FROM tesoreria WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }

    res.json({ success: true, data: rows[0], message: "Registro de tesorería obtenido exitosamente" });
  } catch (error) {
    console.error("❌ Error al obtener registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al obtener registro de tesorería", error: error.message });
  }
};

// Crear un nuevo registro de tesorería (nuevo esquema)
const createTesoreria = async (req, res) => {
  try {
    const { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, turno, encargado, monto } = req.body;

    // Validaciones básicas
    if (!fecha || !nombre || !categoria || monto === undefined) {
      return res.status(400).json({ success: false, message: "Fecha, nombre, categoría y monto son requeridos" });
    }

    if (monto <= 0) {
      return res.status(400).json({ success: false, message: "El monto debe ser mayor a 0" });
    }

    const [result] = await db.query(
      `INSERT INTO tesoreria (fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, turno, encargado, monto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha, placa || null, nombre, cargo || null, categoria, detalle || null, reembolso || null, distrito || null, turno ?? null, encargado || null, monto]
    );

    res.status(201).json({ success: true, data: { id: result.insertId }, message: "Registro de tesorería creado exitosamente" });
  } catch (error) {
    console.error("❌ Error al crear registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al crear registro de tesorería", error: error.message });
  }
};

// Actualizar un registro de tesorería (nuevo esquema)
const updateTesoreria = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, turno, encargado, monto } = req.body;

    // Verificar que el registro existe
    const [existing] = await db.query("SELECT id FROM tesoreria WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }

    await db.query(
      `UPDATE tesoreria SET
        fecha = COALESCE(?, fecha),
        placa = COALESCE(?, placa),
        nombre = COALESCE(?, nombre),
        cargo = COALESCE(?, cargo),
        categoria = COALESCE(?, categoria),
        detalle = COALESCE(?, detalle),
        reembolso = COALESCE(?, reembolso),
        distrito = COALESCE(?, distrito),
        turno = COALESCE(?, turno),
        encargado = COALESCE(?, encargado),
        monto = COALESCE(?, monto),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, turno, encargado, monto, id]
    );

    res.json({ success: true, message: "Registro de tesorería actualizado exitosamente" });
  } catch (error) {
    console.error("❌ Error al actualizar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al actualizar registro de tesorería", error: error.message });
  }
};

// Eliminar un registro de tesorería (nuevo esquema)
const deleteTesoreria = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query("SELECT id, nombre, monto, categoria FROM tesoreria WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }

    await db.query("DELETE FROM tesoreria WHERE id = ?", [id]);

    res.json({ success: true, message: `Registro de tesorería eliminado: ${existing[0].nombre} - ${existing[0].categoria} S/.${existing[0].monto}` });
  } catch (error) {
    console.error("❌ Error al eliminar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al eliminar registro de tesorería", error: error.message });
  }
};

// Buscar registros de tesorería (nuevo esquema)
const searchTesoreria = async (req, res) => {
  try {
    const { q, fecha_inicio, fecha_fin, categoria, reembolso, turno, distrito, encargado } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (t.nombre LIKE ? OR t.placa LIKE ? OR t.cargo LIKE ? OR t.detalle LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (fecha_inicio) { whereClause += " AND t.fecha >= ?"; params.push(fecha_inicio); }
    if (fecha_fin) { whereClause += " AND t.fecha <= ?"; params.push(fecha_fin); }
    if (categoria) { whereClause += " AND t.categoria = ?"; params.push(categoria); }
    if (reembolso) { whereClause += " AND t.reembolso = ?"; params.push(reembolso); }
    if (typeof turno !== 'undefined') { whereClause += " AND t.turno = ?"; params.push(turno); }
    if (distrito) { whereClause += " AND t.distrito LIKE ?"; params.push(`%${distrito}%`); }
    if (encargado) { whereClause += " AND t.encargado LIKE ?"; params.push(`%${encargado}%`); }

    const [rows] = await db.query(
      `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
       FROM tesoreria t
       ${whereClause}
       ORDER BY t.fecha DESC, t.id DESC`,
      params
    );

    res.json({ success: true, data: rows, count: rows.length, message: `${rows.length} registros de tesorería encontrados` });
  } catch (error) {
    console.error("❌ Error en búsqueda de tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de tesorería",
      error: error.message,
    });
  }
};

module.exports = {
  getTesoreria,
  getTesoreriaById,
  createTesoreria,
  updateTesoreria,
  deleteTesoreria,
  searchTesoreria,
  // Aliases para compatibilidad
  getAll: getTesoreria,
  getById: getTesoreriaById,
  create: createTesoreria,
  update: updateTesoreria,
  delete: deleteTesoreria,
};