const db = require("../config/db");

// Helper: construir cláusula WHERE según scope y filtros
function buildWhereAndParams(query) {
  const { scope = "active", q, fecha_inicio, fecha_fin, categoria, reembolso, turno, distrito, encargado } = query;
  let where = "WHERE 1=1";
  const params = [];

  // Scope
  if (scope === "trash") {
    where += " AND t.deleted_at IS NOT NULL";
  } else if (scope === "history") {
    where += " AND t.deleted_at IS NULL AND t.fecha < CURDATE()";
  } else { // active (default)
    where += " AND t.deleted_at IS NULL AND t.fecha = CURDATE()";
  }

  // Búsqueda libre
  if (q && String(q).trim()) {
    const term = `%${String(q).trim()}%`;
    where += " AND (t.nombre LIKE ? OR t.placa LIKE ? OR t.cargo LIKE ? OR t.detalle LIKE ?)";
    params.push(term, term, term, term);
  }

  // Filtros adicionales
  if (fecha_inicio) { where += " AND t.fecha >= ?"; params.push(fecha_inicio); }
  if (fecha_fin) { where += " AND t.fecha <= ?"; params.push(fecha_fin); }
  if (categoria) { where += " AND t.categoria = ?"; params.push(categoria); }
  if (reembolso) { where += " AND t.reembolso = ?"; params.push(reembolso); }
  if (typeof turno !== "undefined" && turno !== "") { where += " AND t.turno = ?"; params.push(turno); }
  if (distrito) { where += " AND t.distrito LIKE ?"; params.push(`%${distrito}%`); }
  if (encargado) { where += " AND t.encargado LIKE ?"; params.push(`%${encargado}%`); }

  return { where, params };
}

// Obtener registros de tesorería con soporte de scope (por defecto: active/hoy)
const getTesoreria = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de tesorería (con scope)...");

    const { where, params } = buildWhereAndParams({ ...req.query });
    const [rows] = await db.query(
      `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
       FROM TESORERIA t
       LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
       ${where}
       ORDER BY t.fecha DESC, t.id DESC`,
      params
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
      `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
       FROM TESORERIA t
       LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
       WHERE t.id = ?`,
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
  const { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto } = req.body;

    // Validaciones básicas
    if (!fecha || !nombre || !categoria || monto === undefined) {
      return res.status(400).json({ success: false, message: "Fecha, nombre, categoría y monto son requeridos" });
    }

    if (monto <= 0) {
      return res.status(400).json({ success: false, message: "El monto debe ser mayor a 0" });
    }

    // Si se proporcionó id_centro, validar que exista
    if (typeof id_centro !== 'undefined' && id_centro !== null) {
      const [centroRows] = await db.query('SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?', [id_centro]);
      if (centroRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Centro de distribución no encontrado' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO TESORERIA (fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha, placa || null, nombre, cargo || null, categoria, detalle || null, reembolso || null, distrito || null, id_centro ?? null, turno ?? null, encargado || null, monto]
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
  const { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto } = req.body;

    // Verificar que el registro existe
    const [existing] = await db.query("SELECT id FROM TESORERIA WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }

    // Si se proporcionó id_centro, validar que exista
    if (typeof id_centro !== 'undefined' && id_centro !== null) {
      const [centroRows] = await db.query('SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?', [id_centro]);
      if (centroRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Centro de distribución no encontrado' });
      }
    }

    await db.query(
      `UPDATE TESORERIA SET
        fecha = COALESCE(?, fecha),
        placa = COALESCE(?, placa),
        nombre = COALESCE(?, nombre),
        cargo = COALESCE(?, cargo),
        categoria = COALESCE(?, categoria),
        detalle = COALESCE(?, detalle),
        reembolso = COALESCE(?, reembolso),
        distrito = COALESCE(?, distrito),
        id_centro = COALESCE(?, id_centro),
        turno = COALESCE(?, turno),
        encargado = COALESCE(?, encargado),
        monto = COALESCE(?, monto),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro ?? null, turno, encargado, monto, id]
    );

    res.json({ success: true, message: "Registro de tesorería actualizado exitosamente" });
  } catch (error) {
    console.error("❌ Error al actualizar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al actualizar registro de tesorería", error: error.message });
  }
};

// Eliminar (soft delete) un registro de tesorería
const deleteTesoreria = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query("SELECT id, nombre, monto, categoria, deleted_at FROM TESORERIA WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }

    // Si ya está en papelera, no hacer nada
    if (existing[0].deleted_at) {
      return res.json({ success: true, message: "El registro ya se encuentra en la papelera" });
    }

    await db.query("UPDATE TESORERIA SET deleted_at = NOW(), updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);

    res.json({ success: true, message: `Registro enviado a la papelera: ${existing[0].nombre} - ${existing[0].categoria} S/.${existing[0].monto}` });
  } catch (error) {
    console.error("❌ Error al eliminar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al eliminar registro de tesorería", error: error.message });
  }
};

// Restaurar un registro desde la papelera (soft restore)
const restoreTesoreria = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query("SELECT id, deleted_at FROM TESORERIA WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }
    if (!existing[0].deleted_at) {
      return res.status(400).json({ success: false, message: "El registro no está en la papelera" });
    }

    await db.query("UPDATE TESORERIA SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
    res.json({ success: true, message: "Registro restaurado exitosamente" });
  } catch (error) {
    console.error("❌ Error al restaurar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al restaurar registro de tesorería", error: error.message });
  }
};

// Buscar registros de tesorería con filtros y scope
const searchTesoreria = async (req, res) => {
  try {
    const { where, params } = buildWhereAndParams({ ...req.query });
    const [rows] = await db.query(
      `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
       FROM TESORERIA t
       ${where}
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

// Purgar definitivamente registros en papelera con más de 7 días
const purgeTesoreria = async (_req, res) => {
  try {
    // Elimina filas cuya deleted_at sea anterior a 7 días
    const [result] = await db.query(
      `DELETE FROM TESORERIA
       WHERE deleted_at IS NOT NULL
         AND deleted_at < (NOW() - INTERVAL 7 DAY)`
    );

    const affected = result?.affectedRows ?? 0;
    res.json({ success: true, purged: affected, message: `Registros eliminados definitivamente: ${affected}` });
  } catch (error) {
    console.error("❌ Error al purgar tesorería:", error);
    res.status(500).json({ success: false, message: "Error al purgar registros de tesorería", error: error.message });
  }
};

module.exports = {
  getTesoreria,
  getTesoreriaById,
  createTesoreria,
  updateTesoreria,
  deleteTesoreria,
  restoreTesoreria,
  searchTesoreria,
  purgeTesoreria,
  // Aliases para compatibilidad
  getAll: getTesoreria,
  getById: getTesoreriaById,
  create: createTesoreria,
  update: updateTesoreria,
  delete: deleteTesoreria,
};