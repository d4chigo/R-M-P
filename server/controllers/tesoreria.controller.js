const db = require("../config/db");
const { logAudit } = require("../lib/audit");

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

      // Audit
      try {
        await logAudit({
          req,
          evento: 'CREATE',
          entidad: 'TESORERIA',
          entityId: result.insertId,
          detalle: { after: { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto }, saldo_after: nuevoSaldo }
        });
      } catch (e) {}

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

// Actualizar un registro de tesorería (ajusta el saldo si cambia el monto)
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
    const { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado } = req.body;
    const newMonto = req.body.monto;

    // Verificar que el registro existe
    const [existing] = await db.query("SELECT id, monto, deleted_at FROM TESORERIA WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }
    if (existing[0].deleted_at) {
      return res.status(400).json({ success: false, message: 'No se puede editar un registro en la papelera' });
    }

    // Si se proporcionó id_centro, validar que exista
    if (typeof id_centro !== 'undefined' && id_centro !== null) {
      const [centroRows] = await db.query('SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?', [id_centro]);
      if (centroRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Centro de distribución no encontrado' });
      }
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Ajustar saldo si cambia el monto
      if (typeof newMonto !== 'undefined' && newMonto !== null) {
        const oldMonto = parseFloat(existing[0].monto);
        const delta = parseFloat(newMonto) - oldMonto; // si >0: restar adicional; si <0: devolver saldo
        if (delta !== 0) {
          const [saldoRows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
          let saldoId, saldoActual;
          if (saldoRows.length === 0) {
            const [ins] = await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (0)');
            saldoId = ins.insertId;
            saldoActual = 0;
          } else {
            saldoId = saldoRows[0].id;
            saldoActual = parseFloat(saldoRows[0].saldo || 0);
          }

          if (delta > 0 && delta > saldoActual) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Saldo insuficiente para aumentar el monto' });
          }

          const nuevoSaldo = saldoActual - delta; // si delta negativo, se suma
          await connection.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId]);
        }
      }

      // Actualizar registro
      await connection.query(
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
        [fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro ?? null, turno, encargado, newMonto, req.usuario ? req.usuario.id_usuario : null, id]
      );

      await connection.commit();
      // Audit
      try {
        await logAudit({
          req,
          evento: 'UPDATE',
          entidad: 'TESORERIA',
          entityId: Number(id),
          detalle: { change: { fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto: newMonto }, note: 'Saldo ajustado si cambió el monto' }
        });
      } catch (e) {}
      res.json({ success: true, message: "Registro de tesorería actualizado exitosamente" });
    } catch (txErr) {
      await connection.rollback();
      console.error('Error en transacción actualizar tesorería:', txErr);
      res.status(500).json({ success: false, message: 'Error al actualizar registro de tesorería', error: txErr.message });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al actualizar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al actualizar registro de tesorería", error: error.message });
  }
};

// Obtener saldo actual de la tarjeta de tesorería (incluye nombre de quien actualizó si está disponible)
const getSaldo = async (_req, res) => {
  try {
    try {
      const [rows] = await db.query(
        `SELECT s.id, s.saldo, s.updated_by, s.updated_at, s.created_at, u.nombre_completo AS updated_by_nombre
         FROM TESORERIA_SALDO s
         LEFT JOIN USUARIO u ON s.updated_by = u.id_usuario
         LIMIT 1`
      );
      if (rows.length === 0) {
        return res.json({ success: true, data: { saldo: 0 }, message: 'Saldo por defecto' });
      }
      return res.json({ success: true, data: rows[0], message: 'Saldo obtenido' });
    } catch (e) {
      const [rows2] = await db.query('SELECT id, saldo, updated_by, updated_at, created_at FROM TESORERIA_SALDO LIMIT 1');
      if (rows2.length === 0) {
        return res.json({ success: true, data: { saldo: 0 }, message: 'Saldo por defecto' });
      }
      const r = rows2[0];
      r.updated_by_nombre = null;
      return res.json({ success: true, data: r, message: 'Saldo obtenido' });
    }
  } catch (error) {
    console.error('Error obteniendo saldo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener saldo', error: error.message });
  }
};

// Actualizar saldo (solo admin)
const updateSaldo = async (req, res) => {
  try {
    const { saldo, motivo } = req.body || {};
    if (typeof saldo === 'undefined' || isNaN(parseFloat(saldo))) {
      return res.status(400).json({ success: false, message: 'Saldo inválido' });
    }
    if (parseFloat(saldo) < 0) {
      return res.status(400).json({ success: false, message: 'El saldo no puede ser negativo' });
    }

    const [rows] = await db.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1');
    if (rows.length === 0) {
      if (typeof motivo === 'undefined' || String(motivo).trim() === '') {
        return res.status(400).json({ success: false, message: 'Debe especificar un motivo para establecer el saldo inicial' });
      }
      const [ins] = await db.query('INSERT INTO TESORERIA_SALDO (saldo, updated_by) VALUES (?, ?)', [saldo, req.usuario ? req.usuario.id_usuario : null]);
      try { await logAudit({ req, evento: 'ADJUST_SALDO', entidad: 'TESORERIA_SALDO', entityId: ins.insertId, detalle: { motivo, before: { saldo: 0 }, after: { saldo: parseFloat(saldo) }, delta: parseFloat(saldo) } }); } catch(e) {}
      return res.json({ success: true, data: { id: ins.insertId, saldo }, message: 'Saldo creado' });
    }

    const id = rows[0].id;
    const beforeSaldo = parseFloat(rows[0].saldo || 0);
    const afterSaldo = parseFloat(saldo);
    const delta = afterSaldo - beforeSaldo;
    if (delta === 0) {
      return res.json({ success: true, data: { id, saldo: afterSaldo }, message: 'Saldo sin cambios' });
    }
    if (typeof motivo === 'undefined' || String(motivo).trim() === '') {
      return res.status(400).json({ success: false, message: 'Debe especificar un motivo para ajustar el saldo' });
    }
    await db.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [afterSaldo, req.usuario ? req.usuario.id_usuario : null, id]);
    try { await logAudit({ req, evento: 'ADJUST_SALDO', entidad: 'TESORERIA_SALDO', entityId: id, detalle: { motivo, before: { saldo: beforeSaldo }, after: { saldo: afterSaldo }, delta } }); } catch(e) {}
    res.json({ success: true, data: { id, saldo }, message: 'Saldo actualizado' });
  } catch (error) {
    console.error('Error actualizando saldo:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar saldo', error: error.message });
  }
};

// Eliminar (soft delete) un registro de tesorería y devolver el monto al saldo
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

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Devolver monto al saldo
      const [saldoRows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
      let saldoId, saldoActual;
      if (saldoRows.length === 0) {
        const [ins] = await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (0)');
        saldoId = ins.insertId;
        saldoActual = 0;
      } else {
        saldoId = saldoRows[0].id;
        saldoActual = parseFloat(saldoRows[0].saldo || 0);
      }
      const nuevoSaldo = saldoActual + parseFloat(existing[0].monto);
      await connection.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId]);

      // Marcar como eliminado
      await connection.query("UPDATE TESORERIA SET deleted_at = NOW(), updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await connection.commit();
    } catch (txErr) {
      await connection.rollback();
      console.error('Error en transacción eliminar tesorería:', txErr);
      return res.status(500).json({ success: false, message: 'Error al eliminar registro de tesorería', error: txErr.message });
    } finally {
      connection.release();
    }

    // Audit
    try {
      await logAudit({
        req,
        evento: 'DELETE',
        entidad: 'TESORERIA',
        entityId: Number(id),
        detalle: { before: existing[0] }
      });
    } catch (e) {}
    res.json({ success: true, message: `Registro enviado a la papelera: ${existing[0].nombre} - ${existing[0].categoria} S/.${existing[0].monto}` });
  } catch (error) {
    console.error("❌ Error al eliminar registro de tesorería:", error);
    res.status(500).json({ success: false, message: "Error al eliminar registro de tesorería", error: error.message });
  }
};

// Restaurar un registro desde la papelera (soft restore) y descontar nuevamente del saldo
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
    const [existing] = await db.query("SELECT id, monto, deleted_at FROM TESORERIA WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de tesorería no encontrado" });
    }
    if (!existing[0].deleted_at) {
      return res.status(400).json({ success: false, message: "El registro no está en la papelera" });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Descontar del saldo nuevamente
      const [saldoRows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
      let saldoId, saldoActual;
      if (saldoRows.length === 0) {
        const [ins] = await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (0)');
        saldoId = ins.insertId;
        saldoActual = 0;
      } else {
        saldoId = saldoRows[0].id;
        saldoActual = parseFloat(saldoRows[0].saldo || 0);
      }
      const monto = parseFloat(existing[0].monto);
      if (monto > saldoActual) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Saldo insuficiente para restaurar el registro' });
      }
      const nuevoSaldo = saldoActual - monto;
      await connection.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId]);

      await connection.query("UPDATE TESORERIA SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await connection.commit();
    } catch (txErr) {
      await connection.rollback();
      console.error('Error en transacción restaurar tesorería:', txErr);
      return res.status(500).json({ success: false, message: 'Error al restaurar registro de tesorería', error: txErr.message });
    } finally {
      connection.release();
    }

    // Audit
    try {
      await logAudit({
        req,
        evento: 'RESTORE',
        entidad: 'TESORERIA',
        entityId: Number(id),
        detalle: { restored: true }
      });
    } catch (e) {}
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
  try { await logAudit({ req, evento: 'ROLLOVER', entidad: 'TESORERIA_SALDO', entityId: rows[0]?.id || null, detalle: { fecha: fechaHoy, saldo_final: saldoActual } }); } catch(e) {}
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

// =====================
// Ajustes contables y resumen
// =====================
async function ensureAjusteTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS TESORERIA_AJUSTE (
      id INT PRIMARY KEY AUTO_INCREMENT,
      fecha DATE NOT NULL,
      tipo ENUM('incremento','decremento') NOT NULL,
      monto DECIMAL(14,2) NOT NULL,
      motivo VARCHAR(255) NOT NULL,
      created_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES USUARIO(id_usuario) ON DELETE SET NULL,
      INDEX idx_ajuste_fecha (fecha),
      INDEX idx_ajuste_tipo (tipo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// Crear ajuste que impacta el saldo general (admin)
const createAjuste = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }

    const { tipo, monto, motivo, fecha } = req.body || {};
    if (!['incremento','decremento'].includes(String(tipo))) {
      return res.status(400).json({ success: false, message: 'Tipo inválido (use incremento/decremento)' });
    }
    const amount = parseFloat(monto);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Monto inválido' });
    }
    if (!motivo || !String(motivo).trim()) {
      return res.status(400).json({ success: false, message: 'Motivo requerido' });
    }

    await ensureAjusteTables();

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [saldoRows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
      let saldoId, saldoActual;
      if (saldoRows.length === 0) {
        const [ins] = await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (0)');
        saldoId = ins.insertId; saldoActual = 0;
      } else {
        saldoId = saldoRows[0].id; saldoActual = parseFloat(saldoRows[0].saldo || 0);
      }
      const signo = tipo === 'incremento' ? 1 : -1;
      const nuevoSaldo = saldoActual + signo * amount;
      if (nuevoSaldo < 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Saldo insuficiente para aplicar el ajuste' });
      }

      const f = fecha && String(fecha).trim() ? fecha : new Date().toISOString().split('T')[0];
      const [aj] = await connection.query(
        'INSERT INTO TESORERIA_AJUSTE (fecha, tipo, monto, motivo, created_by) VALUES (?, ?, ?, ?, ?)',
        [f, tipo, amount, String(motivo).trim(), req.usuario ? req.usuario.id_usuario : null]
      );
      await connection.query('UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId]);
      await connection.commit();

      try { await logAudit({ req, evento: 'AJUSTE', entidad: 'TESORERIA_SALDO', entityId: saldoId, detalle: { ajuste_id: aj.insertId, fecha: f, tipo, monto: amount, motivo, saldo_before: saldoActual, saldo_after: nuevoSaldo } }); } catch(e) {}
      res.status(201).json({ success: true, data: { id: aj.insertId, saldo: nuevoSaldo }, message: 'Ajuste aplicado' });
    } catch (txErr) {
      await connection.rollback();
      console.error('❌ Error en ajuste:', txErr);
      res.status(500).json({ success: false, message: 'Error al aplicar ajuste', error: txErr.message });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error creando ajuste:', error);
    res.status(500).json({ success: false, message: 'Error creando ajuste', error: error.message });
  }
};

const listAjustes = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }
    await ensureAjusteTables();
    const { fecha_inicio, fecha_fin } = req.query || {};
    let where = 'WHERE 1=1'; const params = [];
    if (fecha_inicio) { where += ' AND fecha >= ?'; params.push(fecha_inicio); }
    if (fecha_fin) { where += ' AND fecha <= ?'; params.push(fecha_fin); }
    const [rows] = await db.query(
      `SELECT a.*, u.nombre_completo AS created_by_nombre
       FROM TESORERIA_AJUSTE a
       LEFT JOIN USUARIO u ON a.created_by = u.id_usuario
       ${where}
       ORDER BY a.fecha DESC, a.id DESC
       LIMIT 500`, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('❌ Error listando ajustes:', error);
    res.status(500).json({ success: false, message: 'Error listando ajustes', error: error.message });
  }
};

const resumenDia = async (req, res) => {
  try {
    const fecha = (req.query?.fecha && String(req.query.fecha).trim()) || new Date().toISOString().split('T')[0];
    await ensureAjusteTables();
    // Opening: saldo_final del día anterior (si existe)
    const [openRows] = await db.query('SELECT saldo_final FROM TESORERIA_SALDO_HISTORY WHERE fecha = DATE_SUB(?, INTERVAL 1 DAY) LIMIT 1', [fecha]);
    const opening = openRows.length ? parseFloat(openRows[0].saldo_final || 0) : null;
    const [gastoRows] = await db.query('SELECT COALESCE(SUM(monto),0) AS total FROM TESORERIA WHERE deleted_at IS NULL AND fecha = ?', [fecha]);
    const totalGastos = parseFloat(gastoRows[0].total || 0);
    const [ajInc] = await db.query("SELECT COALESCE(SUM(monto),0) AS total FROM TESORERIA_AJUSTE WHERE tipo='incremento' AND fecha = ?", [fecha]);
    const [ajDec] = await db.query("SELECT COALESCE(SUM(monto),0) AS total FROM TESORERIA_AJUSTE WHERE tipo='decremento' AND fecha = ?", [fecha]);
    const totalInc = parseFloat(ajInc[0].total || 0);
    const totalDec = parseFloat(ajDec[0].total || 0);
    const closingCalc = (opening ?? 0) + totalInc - totalDec - totalGastos;
    const [saldoNow] = await db.query('SELECT saldo FROM TESORERIA_SALDO LIMIT 1');
    const saldoActual = saldoNow.length ? parseFloat(saldoNow[0].saldo || 0) : 0;
    res.json({ success: true, data: { fecha, opening, total_ajustes_incremento: totalInc, total_ajustes_decremento: totalDec, total_gastos: totalGastos, closing_calculado: closingCalc, saldo_actual: saldoActual } });
  } catch (error) {
    console.error('❌ Error en resumen diario:', error);
    res.status(500).json({ success: false, message: 'Error en resumen diario', error: error.message });
  }
};

module.exports.createAjuste = createAjuste;
module.exports.listAjustes = listAjustes;
module.exports.resumenDia = resumenDia;
// =====================
// Auditoría (solo lectura, admin)
// =====================
const getAudit = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }

    const { entidad, entity_id, desde, hasta, evento } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (entidad) { where += ' AND entidad = ?'; params.push(entidad); }
    if (entity_id) { where += ' AND entity_id = ?'; params.push(Number(entity_id)); }
    if (evento) { where += ' AND evento = ?'; params.push(evento); }
    if (desde) { where += ' AND fecha_evento >= ?'; params.push(desde); }
    if (hasta) { where += ' AND fecha_evento <= ?'; params.push(hasta); }

    const [rows] = await db.query(
      `SELECT a.id, a.fecha_evento, a.evento, a.entidad, a.entity_id, a.user_id, u.nombre_completo AS user_nombre, a.ip, a.detalle
       FROM TESORERIA_AUDIT a
       LEFT JOIN USUARIO u ON a.user_id = u.id_usuario
       ${where}
       ORDER BY a.fecha_evento DESC, a.id DESC
       LIMIT 500`,
      params
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('❌ Error obteniendo auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al obtener auditoría', error: error.message });
  }
};

const getAuditByTesoreriaId = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map(r => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes('ADMINISTRADOR')) {
      return res.status(403).json({ success: false, message: 'Acción no permitida: se requiere rol ADMINISTRADOR' });
    }
    const id = Number(req.params.id);
    const [rows] = await db.query(
      `SELECT a.id, a.fecha_evento, a.evento, a.entidad, a.entity_id, a.user_id, u.nombre_completo AS user_nombre, a.ip, a.detalle
       FROM TESORERIA_AUDIT a
       LEFT JOIN USUARIO u ON a.user_id = u.id_usuario
       WHERE a.entidad = 'TESORERIA' AND a.entity_id = ?
       ORDER BY a.fecha_evento DESC, a.id DESC`,
      [id]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('❌ Error obteniendo auditoría por id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener auditoría', error: error.message });
  }
};

module.exports.getAudit = getAudit;
module.exports.getAuditByTesoreriaId = getAuditByTesoreriaId;