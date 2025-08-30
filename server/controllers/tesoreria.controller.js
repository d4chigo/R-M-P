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
    let rows;
    try {
      const [r] = await db.query(
        `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at, t.created_by, t.updated_by,
                u1.nombre_completo AS created_by_nombre,
                u2.nombre_completo AS updated_by_nombre
         FROM TESORERIA t
         LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
         LEFT JOIN USUARIO u1 ON t.created_by = u1.id_usuario
         LEFT JOIN USUARIO u2 ON t.updated_by = u2.id_usuario
         ${where}
         ORDER BY t.fecha DESC, t.id DESC`,
        params
      );
      rows = r;
    } catch (errQuery) {
      // Si falla por esquema antiguo (columnas/joins inexistentes), intentar una consulta de respaldo sin joins a USUARIO
      if (String(errQuery.message).includes('Unknown column') || String(errQuery.code).includes('ER_BAD_FIELD_ERROR')) {
        console.warn('⚠️ Consulta con joins de auditoría falló, intentando consulta de respaldo sin joins de USUARIO');
        const [r2] = await db.query(
          `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
           FROM TESORERIA t
           LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
           ${where}
           ORDER BY t.fecha DESC, t.id DESC`,
          params
        );
        rows = r2;
        // No habrá campos created_by_nombre/updated_by_nombre en esta variante
        rows.forEach(r => { r.created_by_nombre = null; r.updated_by_nombre = null; });
      } else {
        throw errQuery;
      }
    }

    console.log(`✅ Se encontraron ${rows.length} registros de tesorería`);

    // Si el request no tiene roles (no autenticado) o no es admin, ocultar nombres
    const userRoles = req.userRoles || [];
    const isAdmin = Array.isArray(userRoles) && userRoles.includes('ADMINISTRADOR');
    if (!isAdmin) {
      rows.forEach(r => {
        r.created_by_nombre = null;
        r.updated_by_nombre = null;
      });
    }

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

    let rows;
    try {
      const [r] = await db.query(
        `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at, t.created_by, t.updated_by,
                u1.nombre_completo AS created_by_nombre,
                u2.nombre_completo AS updated_by_nombre
         FROM TESORERIA t
         LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
         LEFT JOIN USUARIO u1 ON t.created_by = u1.id_usuario
         LEFT JOIN USUARIO u2 ON t.updated_by = u2.id_usuario
         WHERE t.id = ?`,
        [id]
      );
      rows = r;
    } catch (errQuery) {
      if (String(errQuery.message).includes('Unknown column') || String(errQuery.code).includes('ER_BAD_FIELD_ERROR')) {
        console.warn('⚠️ Consulta detalle con joins de auditoría falló, intentando consulta de respaldo sin joins de USUARIO');
        const [r2] = await db.query(
          `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
           FROM TESORERIA t
           LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
           WHERE t.id = ?`,
          [id]
        );
        rows = r2;
        rows.forEach(r => { r.created_by_nombre = null; r.updated_by_nombre = null; });
      } else {
        throw errQuery;
      }
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }

    // ocultar nombres si no es admin
    const userRoles = req.userRoles || [];
    const isAdmin = Array.isArray(userRoles) && userRoles.includes('ADMINISTRADOR');
    if (!isAdmin) {
      rows[0].created_by_nombre = null;
      rows[0].updated_by_nombre = null;
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

    // Manejar decremento de saldo: obtener saldo actual y restar monto dentro de una transacción
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Obtener saldo actual (si no existe, inicializar a 0)
      const [saldoRows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
      let saldoId = null;
      let saldoActual = 0;
      if (saldoRows.length === 0) {
        const [ins] = await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (?)', [0]);
        saldoId = ins.insertId;
        saldoActual = 0;
      } else {
        saldoId = saldoRows[0].id;
        saldoActual = parseFloat(saldoRows[0].saldo || 0);
      }

      if (monto > saldoActual) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Saldo insuficiente en la tarjeta de tesorería' });
      }

      // Insertar registro de tesorería
      const [result] = await connection.query(
        `INSERT INTO TESORERIA (fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fecha, placa || null, nombre, cargo || null, categoria, detalle || null, reembolso || null, distrito || null, id_centro ?? null, turno ?? null, encargado || null, monto, req.usuario ? req.usuario.id_usuario : null]
      );

      // Restar monto del saldo
      const nuevoSaldo = (saldoActual - parseFloat(monto));
      await connection.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId]);

      await connection.commit();

      res.status(201).json({ success: true, data: { id: result.insertId }, message: "Registro de tesorería creado exitosamente" });
    } catch (txErr) {
      console.error('Error en transacción crear tesorería:', txErr);
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Error al crear registro de tesorería', error: txErr.message });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al crear registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al crear registro de tesorería", error: error.message });
  }
};

// Actualizar un registro de tesorería (nuevo esquema)
const updateTesoreria = async (req, res) => {
  try {
  // Defensa en profundidad: verificar roles en request (debe establecer middleware)
  if (!req.userRoles && req.usuario && req.usuario.roles) {
    // normalizar roles si vienen en req.usuario.roles
    req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
  }
  if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
    return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
  }
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
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro ?? null, turno, encargado, monto, req.usuario ? req.usuario.id_usuario : null, id]
    );

    res.json({ success: true, message: "Registro de tesorería actualizado exitosamente" });
  } catch (error) {
    console.error("❌ Error al actualizar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al actualizar registro de tesorería", error: error.message });
  }
};

// Obtener saldo actual de la tarjeta de tesorería
const getSaldo = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, saldo, updated_by, updated_at, created_at FROM TESORERIA_SALDO LIMIT 1');
    if (rows.length === 0) {
      return res.json({ success: true, data: { saldo: 0 }, message: 'Saldo por defecto' });
    }
    res.json({ success: true, data: rows[0], message: 'Saldo obtenido' });
  } catch (error) {
    console.error('Error obteniendo saldo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener saldo', error: error.message });
  }
};

// Actualizar saldo (solo admin)
const updateSaldo = async (req, res) => {
  try {
    const { saldo } = req.body;
    if (typeof saldo === 'undefined' || isNaN(parseFloat(saldo))) {
      return res.status(400).json({ success: false, message: 'Saldo inválido' });
    }

    const [rows] = await db.query('SELECT id FROM TESORERIA_SALDO LIMIT 1');
    if (rows.length === 0) {
      const [ins] = await db.query('INSERT INTO TESORERIA_SALDO (saldo, updated_by) VALUES (?, ?)', [saldo, req.usuario ? req.usuario.id_usuario : null]);
      return res.json({ success: true, data: { id: ins.insertId, saldo }, message: 'Saldo creado' });
    }

    const id = rows[0].id;
    await db.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [saldo, req.usuario ? req.usuario.id_usuario : null, id]);
    res.json({ success: true, data: { id, saldo }, message: 'Saldo actualizado' });
  } catch (error) {
    console.error('Error actualizando saldo:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar saldo', error: error.message });
  }
};

// Eliminar (soft delete) un registro de tesorería
const deleteTesoreria = async (req, res) => {
  try {
    // Defensa en profundidad: sólo ADMINISTRADOR puede eliminar
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }
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
    // Defensa en profundidad: sólo ADMINISTRADOR puede restaurar
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }
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
    // Nota: esta ruta normalmente estará protegida por middleware requireAdmin, pero añadimos
    // una comprobación extra si llamadas directas bypassearon middleware.
    const reqObj = _req || {};
    if (!reqObj.userRoles && reqObj.usuario && reqObj.usuario.roles) {
      reqObj.userRoles = reqObj.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!reqObj.userRoles || !reqObj.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }
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

// Exportar saldo
module.exports.getSaldo = getSaldo;
module.exports.updateSaldo = updateSaldo;

// Rollover diario: snapshot del saldo actual y reset al inicio del nuevo día
const rolloverSaldo = async (req, res) => {
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Obtener saldo actual
      const [rows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
      if (rows.length === 0) {
        // nada que snapshotear, crear fila con saldo 0
        await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (?)', [0]);
        await connection.commit();
        return res.json({ success: true, message: 'Rollover completado: saldo inicializado a 0' });
      }
      const saldoActual = parseFloat(rows[0].saldo || 0);
      const fechaHoy = new Date().toISOString().split('T')[0];
  // Insertar snapshot en history
  await connection.query('INSERT INTO TESORERIA_SALDO_HISTORY (fecha, saldo_final) VALUES (?, ?)', [fechaHoy, saldoActual]);
  // Política actual: mantener el sobrante para el día siguiente (no resetear el saldo)
      await connection.commit();
      console.log(`✅ Rollover tesorería: snapshot ${saldoActual} guardado para ${fechaHoy}`);
      return res.json({ success: true, message: 'Rollover completado', saldo_final: saldoActual });
    } catch (txErr) {
      await connection.rollback();
      console.error('Error en transacción rollover:', txErr);
      return res.status(500).json({ success: false, message: 'Error en rollover', error: txErr.message });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error en rolloverSaldo:', err);
    return res.status(500).json({ success: false, message: 'Error en rollover', error: err.message });
  }
};

module.exports.rolloverSaldo = rolloverSaldo;