const db = require("../config/db");
const { logAudit } = require("../lib/audit");
const {
  getTodayLimaYMD,
  getLimaTodaySQLClause,
  getLimaNowSQLClause,
  isValidYMDDate,
} = require("../lib/date-lima");

// Helper: construir cláusula WHERE según scope y filtros
function buildWhereAndParams(query) {
  const {
    scope = "active",
    q,
    fecha,
    fecha_inicio,
    fecha_fin,
    categoria,
    reembolso,
    turno,
    distrito,
    encargado,
  } = query;
  let where = "WHERE 1=1";
  const params = [];

  // Usar la nueva utilidad para obtener la fecha de Lima
  const PERU_TODAY_SQL = getLimaTodaySQLClause();

  // Debug: log de parámetros recibidos
  console.log(
    "🔍 buildWhereAndParams - query recibida:",
    JSON.stringify(query, null, 2),
  );

  // Scope + política de fechas
  const hasDate = (fecha && String(fecha).trim()) || fecha_inicio || fecha_fin;
  if (scope === "trash") {
    where += " AND t.deleted_at IS NOT NULL";
    // En papelera no imponemos fecha por defecto; aplicar fecha si el cliente la envía
  } else {
    where += " AND t.deleted_at IS NULL";
  }
  if (hasDate) {
    if (fecha && String(fecha).trim()) {
      const fechaStr = String(fecha).trim();
      if (isValidYMDDate(fechaStr)) {
        where += " AND t.fecha = ?";
        params.push(fechaStr);
      } else {
        console.warn("⚠️ Fecha inválida recibida:", fechaStr);
      }
    } else {
      if (fecha_inicio && isValidYMDDate(fecha_inicio)) {
        where += " AND t.fecha >= ?";
        params.push(fecha_inicio);
      }
      if (fecha_fin && isValidYMDDate(fecha_fin)) {
        where += " AND t.fecha <= ?";
        params.push(fecha_fin);
      }
    }
  } else {
    // Sin filtros de fecha explícitos: aplicar comportamiento por scope (hoy/histórico)
    if (scope === "history") {
      // Historial muestra TODOS los registros (sin restricción de fecha)
      // No agregamos filtro de fecha para mostrar el historial completo
    } else if (scope === "active") {
      where += ` AND t.fecha = ${PERU_TODAY_SQL}`;
    }
  }

  // Búsqueda libre
  if (q && String(q).trim()) {
    const term = `%${String(q).trim()}%`;
    where +=
      " AND (t.nombre LIKE ? OR t.placa LIKE ? OR t.cargo LIKE ? OR t.detalle LIKE ?)";
    params.push(term, term, term, term);
  }

  // Filtros adicionales
  // (Rango de fechas ya aplicado arriba si correspondía)
  if (categoria) {
    where += " AND t.categoria = ?";
    params.push(categoria);
  }
  if (reembolso) {
    where += " AND t.reembolso = ?";
    params.push(reembolso);
  }
  if (typeof turno !== "undefined" && turno !== "") {
    where += " AND t.turno = ?";
    params.push(turno);
  }
  if (distrito) {
    where += " AND t.distrito LIKE ?";
    params.push(`%${distrito}%`);
  }
  if (encargado) {
    where += " AND t.encargado LIKE ?";
    params.push(`%${encargado}%`);
  }

  return { where, params };
}

// ======================================
// HELPERS PARA MANEJO DE CATEGORÍAS MÚLTIPLES
// ======================================

/**
 * Crear categorías múltiples para un registro de tesorería
 * @param {Object} connection - Conexión de base de datos activa
 * @param {number} idTesoreria - ID del registro principal
 * @param {Array} categorias - Array de objetos {categoria, monto}
 */
const createCategorias = async (connection, idTesoreria, categorias) => {
  if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
    return;
  }

  for (let i = 0; i < categorias.length; i++) {
    const { categoria, monto } = categorias[i];
    if (categoria && monto) {
      await connection.query(
        `INSERT INTO TESORERIA_CATEGORIAS (id_tesoreria, categoria, monto, orden)
         VALUES (?, ?, ?, ?)`,
        [idTesoreria, categoria, parseFloat(monto), i + 1]
      );
    }
  }
};

/**
 * Obtener todas las categorías de un registro
 */
const getCategorias = async (connection, idTesoreria) => {
  const [rows] = await connection.query(
    `SELECT id, categoria, monto, orden FROM TESORERIA_CATEGORIAS 
     WHERE id_tesoreria = ? ORDER BY orden ASC`,
    [idTesoreria]
  );
  return rows || [];
};

/**
 * Eliminar todas las categorías de un registro
 */
const deleteCategorias = async (connection, idTesoreria) => {
  await connection.query(
    `DELETE FROM TESORERIA_CATEGORIAS WHERE id_tesoreria = ?`,
    [idTesoreria]
  );
};

/**
 * Calcular monto total a partir de array de categorías
 */
const calcularMontoTotal = (categorias) => {
  if (!categorias || !Array.isArray(categorias)) return 0;
  return categorias.reduce((acc, cat) => acc + (parseFloat(cat.monto) || 0), 0);
};

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
        params,
      );
      rows = r;
    } catch (errQuery) {
      // Si falla por esquema antiguo (columnas/joins inexistentes), intentar una consulta de respaldo sin joins a USUARIO
      if (
        String(errQuery.message).includes("Unknown column") ||
        String(errQuery.code).includes("ER_BAD_FIELD_ERROR")
      ) {
        console.warn(
          "⚠️ Consulta con joins de auditoría falló, intentando consulta de respaldo sin joins de USUARIO",
        );
        const [r2] = await db.query(
          `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
           FROM TESORERIA t
           LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
           ${where}
           ORDER BY t.fecha DESC, t.id DESC`,
          params,
        );
        rows = r2;
        // No habrá campos created_by_nombre/updated_by_nombre en esta variante
        rows.forEach((r) => {
          r.created_by_nombre = null;
          r.updated_by_nombre = null;
        });
      } else {
        throw errQuery;
      }
    }

    console.log(`✅ Se encontraron ${rows.length} registros de tesorería`);

    // Si el request no tiene roles (no autenticado) o no es admin, ocultar nombres
    const userRoles = req.userRoles || [];
    const isAdmin =
      Array.isArray(userRoles) && userRoles.includes("ADMINISTRADOR");
    if (!isAdmin) {
      rows.forEach((r) => {
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
        `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.es_multiple, t.created_at, t.updated_at, t.created_by, t.updated_by,
                u1.nombre_completo AS created_by_nombre,
                u2.nombre_completo AS updated_by_nombre
         FROM TESORERIA t
         LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
         LEFT JOIN USUARIO u1 ON t.created_by = u1.id_usuario
         LEFT JOIN USUARIO u2 ON t.updated_by = u2.id_usuario
         WHERE t.id = ?`,
        [id],
      );

      if (r.length > 0) {
        // Si es múltiple, obtener las categorías
        if (r[0].es_multiple) {
          const connection = await db.getConnection();
          try {
            const cats = await getCategorias(connection, id);
            r[0].categorias = cats;
          } finally {
            connection.release();
          }
        }
      }

      rows = r;
    } catch (errQuery) {
      if (
        String(errQuery.message).includes("Unknown column") ||
        String(errQuery.code).includes("ER_BAD_FIELD_ERROR")
      ) {
        console.warn(
          "⚠️ Consulta detalle con joins de auditoría falló, intentando consulta de respaldo sin joins de USUARIO",
        );
        const [r2] = await db.query(
          `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.es_multiple, t.created_at, t.updated_at
           FROM TESORERIA t
           LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
           WHERE t.id = ?`,
          [id],
        );
        rows = r2;
        // Si es múltiple, obtener las categorías en el fallback también
        if (rows.length > 0 && rows[0].es_multiple) {
          const connection = await db.getConnection();
          try {
            const cats = await getCategorias(connection, id);
            rows[0].categorias = cats;
          } finally {
            connection.release();
          }
        }
        rows.forEach((r) => {
          r.created_by_nombre = null;
          r.updated_by_nombre = null;
        });
      } else {
        throw errQuery;
      }
    }

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro de tesorería no encontrado",
      });
    }

    // ocultar nombres si no es admin
    const userRoles = req.userRoles || [];
    const isAdmin =
      Array.isArray(userRoles) && userRoles.includes("ADMINISTRADOR");
    if (!isAdmin) {
      rows[0].created_by_nombre = null;
      rows[0].updated_by_nombre = null;
    }

    res.json({
      success: true,
      data: rows[0],
      message: "Registro de tesorería obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener registro de tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener registro de tesorería",
      error: error.message,
    });
  }
};

// Crear un nuevo registro de tesorería (nuevo esquema)
const createTesoreria = async (req, res) => {
  try {
    let {
      fecha,
      placa,
      nombre,
      cargo,
      categoria,
      categorias, // Array de {categoria, monto} para múltiples
      detalle,
      reembolso,
      distrito,
      id_centro,
      turno,
      encargado,
      monto,
    } = req.body;
    // Normalize empty-string id_centro to null so both '' and null mean 'no centro'
    if (id_centro === "") id_centro = null;

    // Si viene categorias (array) con MÁS DE 1 elemento, usar múltiples; sino usar categoria simple + monto
    const usarMultiples = Array.isArray(categorias) && categorias.length > 1;
    const montoTotal = usarMultiples 
      ? calcularMontoTotal(categorias)
      : (Array.isArray(categorias) && categorias.length === 1)
        ? categorias[0].monto
        : parseFloat(monto || 0);

    // Validaciones básicas
    if (!fecha || !nombre) {
      return res.status(400).json({
        success: false,
        message: "Fecha y nombre son requeridos",
      });
    }

    // Validar que tenga al menos una categoría
    const hasCategoryData = usarMultiples || 
                          (Array.isArray(categorias) && categorias.length >= 1) ||
                          categoria;
    if (!hasCategoryData) {
      return res.status(400).json({
        success: false,
        message: "Debe seleccionar al menos una categoría",
      });
    }

    if (montoTotal <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "El monto total debe ser mayor a 0" });
    }

    // Validar que id_centro sea obligatorio
    if (!id_centro || id_centro === "" || id_centro === null) {
      return res.status(400).json({
        success: false,
        message: "El centro de distribución es requerido",
      });
    }

    // Validar que el centro exista
    const [centroRows] = await db.query(
      "SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?",
      [id_centro],
    );
    if (centroRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Centro de distribución no encontrado",
      });
    }

    // Manejar decremento de saldo del centro: obtener saldo actual y restar monto dentro de una transacción
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Obtener saldo del centro (si no existe, crearlo con saldo 0)
      const [saldoCentroRows] = await connection.query(
        "SELECT saldo FROM TESORERIA_SALDO_CENTRO WHERE id_centro = ? FOR UPDATE",
        [id_centro],
      );

      let saldoActual = 0;
      if (saldoCentroRows.length === 0) {
        // Crear registro de saldo para el centro si no existe
        await connection.query(
          "INSERT INTO TESORERIA_SALDO_CENTRO (id_centro, saldo, created_at, updated_at) VALUES (?, 0, NOW(), NOW())",
          [id_centro],
        );
        saldoActual = 0;
      } else {
        saldoActual = parseFloat(saldoCentroRows[0].saldo || 0);
      }

      if (montoTotal > saldoActual) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Saldo insuficiente en el centro de distribución. Saldo disponible: S/ ${saldoActual.toFixed(2)}`,
        });
      }

      // Cuando hay múltiples categorías, usar "Multiple" como categoría principal
      // Cuando hay 1 categoría en el array, usar el nombre de esa categoría
      // Cuando no hay array, usar la categoría simple
      let categoriaPrincipal;
      if (usarMultiples) {
        categoriaPrincipal = "Multiple";
      } else if (Array.isArray(categorias) && categorias.length === 1) {
        categoriaPrincipal = categorias[0].categoria;
      } else {
        categoriaPrincipal = categoria;
      }

      // Insertar registro de tesorería
      const [result] = await connection.query(
        `INSERT INTO TESORERIA (fecha, placa, nombre, cargo, categoria, detalle, reembolso, distrito, id_centro, turno, encargado, monto, es_multiple, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fecha,
          placa || null,
          nombre,
          cargo || null,
          categoriaPrincipal,
          detalle || null,
          reembolso || null,
          distrito || null,
          id_centro ?? null,
          turno ?? null,
          encargado || null,
          montoTotal,
          usarMultiples ? true : false,
          req.usuario ? req.usuario.id_usuario : null,
        ],
      );

      // Si hay categorías múltiples, insertarlas en la tabla de detalle
      if (usarMultiples) {
        await createCategorias(connection, result.insertId, categorias);
      }

      // Restar monto del saldo del centro
      const nuevoSaldo = saldoActual - montoTotal;
      await connection.query(
        `UPDATE TESORERIA_SALDO_CENTRO SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()} WHERE id_centro = ?`,
        [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, id_centro],
      );

      // Registrar en historial del centro
      try {
        await connection.query(
          `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
           (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, id_registro_tesoreria, created_by, created_at)
           VALUES (?, 'gasto', ?, ?, ?, ?, ?, ?, ${getLimaNowSQLClause()})`,
          [
            id_centro,
            saldoActual,
            montoTotal,
            nuevoSaldo,
            `Gasto: ${categoriaPrincipal} - ${nombre}${usarMultiples ? ' (múltiples categorías)' : ''}`,
            result.insertId,
            req.usuario ? req.usuario.id_usuario : null,
          ],
        );
      } catch (histErr) {
        console.warn(
          "No se pudo registrar en historial de centro:",
          histErr.message,
        );
      }

      await connection.commit();

      // Audit
      try {
        await logAudit({
          req,
          evento: "CREATE",
          entidad: "TESORERIA",
          entityId: result.insertId,
          detalle: {
            after: {
              fecha,
              placa,
              nombre,
              cargo,
              categoria: categoriaPrincipal,
              detalle,
              reembolso,
              distrito,
              id_centro,
              turno,
              encargado,
              monto: montoTotal,
              es_multiple: usarMultiples,
              categorias: usarMultiples ? categorias : undefined,
            },
            saldo_after: nuevoSaldo,
          },
        });
      } catch (e) {}

      // Intentar ejecutar rollover automáticamente (no bloquear el flujo si falla)
      try {
        await performRollover?.(req);
      } catch (rrErr) {
        console.error(
          "Error ejecutando rollover automático tras createTesoreria:",
          rrErr,
        );
      }

      res.status(201).json({
        success: true,
        data: { id: result.insertId },
        message: "Registro de tesorería creado exitosamente",
      });
    } catch (txErr) {
      console.error("Error en transacción crear tesorería:", txErr);
      await connection.rollback();
      res.status(500).json({
        success: false,
        message: "Error al crear registro de tesorería",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al crear registro de tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear registro de tesorería",
      error: error.message,
    });
  }
};

// Actualizar un registro de tesorería (ajusta el saldo si cambia el monto)
const updateTesoreria = async (req, res) => {
  try {
    // Defensa en profundidad: verificar roles en request (debe establecer middleware)
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      // normalizar roles si vienen en req.usuario.roles
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }

    const { id } = req.params;
    const {
      fecha,
      placa,
      nombre,
      cargo,
      categoria,
      categorias, // Array de {categoria, monto}
      detalle,
      reembolso,
      distrito,
      id_centro,
      turno,
      encargado,
    } = req.body;
    const newMonto = req.body.monto;
    
    // Debug: mostrar body recibido para inspección (temporal)
    try {
      console.log(
        "tesoreria.update - req.body keys=",
        Object.keys(req.body || {}),
        "body=",
        req.body,
      );
    } catch (e) {}
    
    // Detectar si el cliente incluyó la clave id_centro en el body
    const hasIdCentro = Object.prototype.hasOwnProperty.call(
      req.body,
      "id_centro",
    );
    const clearIdCentroHeader =
      ((req.get && req.get("X-Clear-Id-Centro")) || "").toString() === "1";

    // Detectar si se están actualizando categorías múltiples (más de 1)
    const usarMultiples = Array.isArray(categorias) && categorias.length > 1;
    const montoTotal = usarMultiples 
      ? calcularMontoTotal(categorias)
      : (Array.isArray(categorias) && categorias.length === 1)
        ? categorias[0].monto
        : (newMonto ? parseFloat(newMonto) : undefined);

    // Verificar que el registro existe
    const [existing] = await db.query(
      "SELECT id, monto, deleted_at, id_centro, es_multiple FROM TESORERIA WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro de tesorería no encontrado",
      });
    }
    if (existing[0].deleted_at) {
      return res.status(400).json({
        success: false,
        message: "No se puede editar un registro en la papelera",
      });
    }

    // Si el body incluye id_centro y su valor NO es vacío/NULL, validar que exista.
    if (
      hasIdCentro &&
      id_centro !== "" &&
      id_centro !== null &&
      typeof id_centro !== "undefined"
    ) {
      const [centroRows] = await db.query(
        "SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?",
        [id_centro],
      );
      if (centroRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Centro de distribución no encontrado",
        });
      }
    }

    // Normalizar intención de 'limpiar' cuando cliente envía ''
    if (hasIdCentro && id_centro === "") {
      req.body.id_centro = null;
    }

    const connection = await db.getConnection();
      try {
      await connection.beginTransaction();

      // Preparar id_centro para UPDATE (necesario también en ajuste de saldos)
      const idCentroParam = hasIdCentro 
        ? (id_centro === "" ? null : (id_centro ?? null))
        : (clearIdCentroHeader ? null : existing[0].id_centro ?? null);

      // Ajustar saldo si cambia el monto (aplicar política de no aumentar)
      if (usarMultiples || typeof newMonto !== "undefined") {
        const oldMonto = parseFloat(existing[0].monto);
        const parsedNewMonto = usarMultiples ? montoTotal : parseFloat(newMonto);

        // Política: en edición solo se permiten montos inferiores o iguales al original
        if (parsedNewMonto > oldMonto) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Edición inválida: no está permitido aumentar el monto original. Para sumar nuevo gasto, cree un nuevo registro.",
          });
        }

        const delta = parsedNewMonto - oldMonto;
        if (delta !== 0) {
          // Actualizar saldo global
          const [saldoRows] = await connection.query(
            "SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE",
          );
          let saldoId, saldoActual;
          if (saldoRows.length === 0) {
            const [ins] = await connection.query(
              "INSERT INTO TESORERIA_SALDO (saldo) VALUES (0)",
            );
            saldoId = ins.insertId;
            saldoActual = 0;
          } else {
            saldoId = saldoRows[0].id;
            saldoActual = parseFloat(saldoRows[0].saldo || 0);
          }

          const nuevoSaldo = saldoActual - delta;
          await connection.query(
            `UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()} WHERE id = ?`,
            [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId],
          );

          // Actualizar saldo del centro específico si existe
          const centroPrincipal = idCentroParam ?? existing[0].id_centro;
          if (centroPrincipal) {
            const [centrSaldoRows] = await connection.query(
              "SELECT saldo FROM TESORERIA_SALDO_CENTRO WHERE id_centro = ? FOR UPDATE",
              [centroPrincipal],
            );
            let centroSaldoActual;
            if (centrSaldoRows.length === 0) {
              // Si no existe, crear registro con saldo 0
              await connection.query(
                "INSERT INTO TESORERIA_SALDO_CENTRO (id_centro, saldo, created_at, updated_at) VALUES (?, 0, NOW(), NOW())",
                [centroPrincipal],
              );
              centroSaldoActual = 0;
            } else {
              centroSaldoActual = parseFloat(centrSaldoRows[0].saldo || 0);
            }

            const nuevoSaldoCentro = centroSaldoActual - delta;
            await connection.query(
              `UPDATE TESORERIA_SALDO_CENTRO SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()} WHERE id_centro = ?`,
              [nuevoSaldoCentro, req.usuario ? req.usuario.id_usuario : null, centroPrincipal],
            );

            // Registrar en historial del centro
            const historiMotivo = `Ajuste por edición: disminución de monto en registro ID ${id}`;
            const historiParams = [
              centroPrincipal,
              centroSaldoActual,
              -delta,
              nuevoSaldoCentro,
              historiMotivo,
              Number(id),
              req.usuario ? req.usuario.id_usuario : null,
            ];
            await connection.query(
              `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
               (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, id_registro_tesoreria, created_by, created_at)
               VALUES (?, 'devolucion', ?, ?, ?, ?, ?, ?, ${getLimaNowSQLClause()})`,
              historiParams,
            );
          }
        }
      }

      // Cuando hay múltiples categorías, usar "Multiple" como categoría principal
      // Cuando hay 1 categoría en el array, usar el nombre de esa categoría
      // Cuando no hay array, usar la categoría simple
      let categoriaPrincipal;
      if (usarMultiples) {
        categoriaPrincipal = "Multiple";
      } else if (Array.isArray(categorias) && categorias.length === 1) {
        categoriaPrincipal = categorias[0].categoria;
      } else {
        categoriaPrincipal = categoria;
      }

      const sql = `UPDATE TESORERIA SET
          fecha = COALESCE(?, fecha),
          placa = COALESCE(?, placa),
          nombre = COALESCE(?, nombre),
          cargo = COALESCE(?, cargo),
          categoria = COALESCE(?, categoria),
          detalle = COALESCE(?, detalle),
          reembolso = COALESCE(?, reembolso),
          distrito = COALESCE(?, distrito),
          id_centro = ?,
          turno = COALESCE(?, turno),
          encargado = COALESCE(?, encargado),
          monto = COALESCE(?, monto),
          es_multiple = ?,
          updated_by = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;

      const paramsForSql = [
        fecha,
        placa,
        nombre,
        cargo,
        categoriaPrincipal,
        detalle,
        reembolso,
        distrito,
        idCentroParam,
        turno,
        encargado,
        montoTotal,
        usarMultiples ? true : false,
        req.usuario ? req.usuario.id_usuario : null,
        id,
      ];

      console.log(
        "tesoreria.update - hasIdCentro=",
        hasIdCentro,
        "id_centro(raw)=",
        id_centro,
        "idCentroParam=",
        idCentroParam,
      );
      console.log(
        "tesoreria.update - SQL params =",
        JSON.stringify(paramsForSql),
      );

      await connection.query(sql, paramsForSql);

      // Si se actualizaron categorías múltiples, reemplazarlas
      if (usarMultiples) {
        await deleteCategorias(connection, id);
        await createCategorias(connection, id, categorias);
      }

      await connection.commit();
      
      // Audit
      try {
        await logAudit({
          req,
          evento: "UPDATE",
          entidad: "TESORERIA",
          entityId: Number(id),
          detalle: {
            change: {
              fecha,
              placa,
              nombre,
              cargo,
              categoria: categoriaPrincipal,
              detalle,
              reembolso,
              distrito,
              id_centro: idCentroParam,
              turno,
              encargado,
              monto: montoTotal,
              es_multiple: usarMultiples,
              categorias: usarMultiples ? categorias : undefined,
            },
            note: "Saldo ajustado si cambió el monto",
          },
        });
      } catch (e) {}
      
      res.json({
        success: true,
        message: "Registro de tesorería actualizado exitosamente",
      });
      
      // Intentar ejecutar rollover automáticamente (no bloquear si falla)
      try {
        await performRollover?.(req);
      } catch (rrErr) {
        console.error(
          "Error ejecutando rollover automático tras updateTesoreria:",
          rrErr,
        );
      }
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción actualizar tesorería:", txErr);
      res.status(500).json({
        success: false,
        message: "Error al actualizar registro de tesorería",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al actualizar registro de tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar registro de tesorería",
      error: error.message,
    });
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
         LIMIT 1`,
      );
      if (rows.length === 0) {
        return res.json({
          success: true,
          data: { saldo: 0 },
          message: "Saldo por defecto",
        });
      }
      return res.json({
        success: true,
        data: rows[0],
        message: "Saldo obtenido",
      });
    } catch (e) {
      const [rows2] = await db.query(
        "SELECT id, saldo, updated_by, updated_at, created_at FROM TESORERIA_SALDO LIMIT 1",
      );
      if (rows2.length === 0) {
        return res.json({
          success: true,
          data: { saldo: 0 },
          message: "Saldo por defecto",
        });
      }
      const r = rows2[0];
      r.updated_by_nombre = null;
      return res.json({ success: true, data: r, message: "Saldo obtenido" });
    }
  } catch (error) {
    console.error("Error obteniendo saldo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener saldo",
      error: error.message,
    });
  }
};

// Actualizar saldo (solo admin)
const updateSaldo = async (req, res) => {
  try {
    const { saldo, motivo } = req.body || {};
    if (typeof saldo === "undefined" || isNaN(parseFloat(saldo))) {
      return res
        .status(400)
        .json({ success: false, message: "Saldo inválido" });
    }
    if (parseFloat(saldo) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "El saldo no puede ser negativo" });
    }

    const [rows] = await db.query(
      "SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1",
    );
    // Si no existe fila, crearla (como antes)
    if (rows.length === 0) {
      if (typeof motivo === "undefined" || String(motivo).trim() === "") {
        return res.status(400).json({
          success: false,
          message:
            "Debe especificar un motivo para establecer el saldo inicial",
        });
      }
      const [ins] = await db.query(
        "INSERT INTO TESORERIA_SALDO (saldo, updated_by) VALUES (?, ?)",
        [saldo, req.usuario ? req.usuario.id_usuario : null],
      );
      try {
        await logAudit({
          req,
          evento: "ADJUST_SALDO",
          entidad: "TESORERIA_SALDO",
          entityId: ins.insertId,
          detalle: {
            motivo,
            before: { saldo: 0 },
            after: { saldo: parseFloat(saldo) },
            delta: parseFloat(saldo),
          },
        });
      } catch (e) {}
      return res.json({
        success: true,
        data: { id: ins.insertId, saldo },
        message: "Saldo creado",
      });
    }

    const id = rows[0].id;
    const beforeSaldo = parseFloat(rows[0].saldo || 0);
    const afterSaldo = parseFloat(saldo);
    const delta = afterSaldo - beforeSaldo;

    // En modo edición (PUT /saldo/actual) solo permitimos disminuir o igualar el saldo actual.
    if (delta > 0) {
      return res.status(400).json({
        success: false,
        message:
          'No está permitido aumentar el saldo con la acción de "Editar". Use la opción "Agregar" para incrementar el saldo.',
      });
    }

    if (delta === 0) {
      return res.json({
        success: true,
        data: { id, saldo: afterSaldo },
        message: "Saldo sin cambios",
      });
    }

    if (typeof motivo === "undefined" || String(motivo).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Debe especificar un motivo para ajustar el saldo",
      });
    }

    // delta < 0: devolver la diferencia al saldo (sumarlo)
    await db.query(
      `UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()} WHERE id = ?`,
      [afterSaldo, req.usuario ? req.usuario.id_usuario : null, id],
    );
    try {
      await logAudit({
        req,
        evento: "ADJUST_SALDO",
        entidad: "TESORERIA_SALDO",
        entityId: id,
        detalle: {
          motivo,
          before: { saldo: beforeSaldo },
          after: { saldo: afterSaldo },
          delta,
        },
      });
    } catch (e) {}
    res.json({
      success: true,
      data: { id, saldo: afterSaldo },
      message: "Saldo actualizado",
    });
  } catch (error) {
    console.error("Error actualizando saldo:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar saldo",
      error: error.message,
    });
  }
};

// Obtener historial del día: movimientos, ajustes y auditoría relacionada
const getSaldoHistorial = async (req, res) => {
  try {
    const fecha = req.query.fecha || getTodayLimaYMD();
    let movimientos = [];
    let ajustes = [];
    let audits = [];
    try {
      const [m] = await db.query(
        `SELECT t.id, t.fecha, t.monto, t.nombre, t.cargo, t.categoria, t.detalle, t.created_at, t.created_by, u.nombre_completo AS created_by_nombre
         FROM TESORERIA t
         LEFT JOIN USUARIO u ON t.created_by = u.id_usuario
         WHERE t.fecha = ?
         ORDER BY t.created_at ASC`,
        [fecha],
      );
      movimientos = m;
    } catch (e) {
      console.warn(
        "Warning: no se pudo leer TESORERIA para historial (tabla ausente?):",
        e && e.code,
      );
      movimientos = [];
    }

    try {
      const [a] = await db.query(
        `SELECT a.id, a.fecha, a.tipo, a.monto, a.motivo, a.created_at, a.created_by, u.nombre_completo AS created_by_nombre
         FROM TESORERIA_AJUSTE a
         LEFT JOIN USUARIO u ON a.created_by = u.id_usuario
         WHERE a.fecha = ?
         ORDER BY a.created_at ASC`,
        [fecha],
      );
      ajustes = a;
    } catch (e) {
      console.warn(
        "Warning: no se pudo leer TESORERIA_AJUSTE para historial (tabla ausente?):",
        e && e.code,
      );
      ajustes = [];
    }

    try {
      const [au] = await db.query(
        `SELECT id, fecha_evento, evento, entidad, entity_id, user_id, ip, detalle
         FROM TESORERIA_AUDIT
         WHERE DATE(CONVERT_TZ(fecha_evento, '+00:00', '-05:00')) = ?
           AND entidad IN ('TESORERIA','TESORERIA_SALDO')
         ORDER BY fecha_evento ASC`,
        [fecha],
      );
      audits = au;
    } catch (e) {
      console.warn(
        "Warning: no se pudo leer TESORERIA_AUDIT para historial (tabla ausente?):",
        e && e.code,
      );
      audits = [];
    }

    // Si el usuario no es admin, ocultar nombres y detail de auditoría
    const userRoles =
      req.userRoles ||
      (req.usuario && req.usuario.roles
        ? req.usuario.roles.map((r) => String(r).toUpperCase())
        : []);
    const isAdmin =
      Array.isArray(userRoles) && userRoles.includes("ADMINISTRADOR");
    if (!isAdmin) {
      movimientos.forEach((m) => {
        m.created_by_nombre = null;
        m.created_by = null;
      });
      ajustes.forEach((a) => {
        a.created_by_nombre = null;
        a.created_by = null;
      });
      audits.forEach((x) => {
        x.user_id = null;
        x.ip = null;
        x.detalle = null;
      });
    }

    res.json({ success: true, data: { fecha, movimientos, ajustes, audits } });
  } catch (error) {
    console.error("Error obteniendo historial de saldo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener historial de saldo",
      error: error.message,
    });
  }
};

// Eliminar (soft delete) un registro de tesorería y devolver el monto al saldo del centro de distribución
const deleteTesoreria = async (req, res) => {
  try {
    // Defensa en profundidad: sólo ADMINISTRADOR puede eliminar
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }
    const { id } = req.params;

    const [existing] = await db.query(
      "SELECT id, nombre, monto, categoria, deleted_at, id_centro FROM TESORERIA WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro de tesorería no encontrado",
      });
    }

    // Si ya está en papelera, no hacer nada
    if (existing[0].deleted_at) {
      return res.json({
        success: true,
        message: "El registro ya se encuentra en la papelera",
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const monto = parseFloat(existing[0].monto);
      const idCentro = existing[0].id_centro;

      // Si el registro tiene asociado un centro de distribución, devolver monto al centro
      if (idCentro) {
        const [saldoCentroRows] = await connection.query(
          "SELECT saldo FROM TESORERIA_SALDO_CENTRO WHERE id_centro = ? FOR UPDATE",
          [idCentro],
        );

        if (saldoCentroRows.length > 0) {
          const saldoActualCentro = parseFloat(saldoCentroRows[0].saldo || 0);
          const nuevoSaldoCentro = saldoActualCentro + monto;

          // Actualizar saldo del centro
          await connection.query(
            `UPDATE TESORERIA_SALDO_CENTRO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id_centro = ?`,
            [nuevoSaldoCentro, req.usuario ? req.usuario.id_usuario : null, idCentro],
          );

          // Registrar en historial del centro con tipo 'devolucion'
          try {
            await connection.query(
              `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
               (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, id_registro_tesoreria, created_by, created_at)
               VALUES (?, 'devolucion', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [
                idCentro,
                saldoActualCentro,
                monto,
                nuevoSaldoCentro,
                `Devolución por eliminación: ${existing[0].categoria} - ${existing[0].nombre}`,
                id,
                req.usuario ? req.usuario.id_usuario : null,
              ],
            );
          } catch (histErr) {
            console.warn(
              "No se pudo registrar en historial de centro al eliminar:",
              histErr.message,
            );
          }
        }
      }

      // Marcar como eliminado
      await connection.query(
        "UPDATE TESORERIA SET deleted_at = NOW(), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
      );

      // Audit dentro de la transacción
      try {
        await logAudit({
          req,
          evento: "DELETE",
          entidad: "TESORERIA",
          entityId: Number(id),
          detalle: { 
            before: existing[0],
            saldo_devuelto_al_centro: idCentro ? monto : null,
          },
        });
      } catch (auditErr) {
        console.warn("Advertencia: No se pudo registrar auditoría:", auditErr.message);
      }

      await connection.commit();
      return res.json({
        success: true,
        message: `Registro enviado a la papelera: ${existing[0].nombre} - ${existing[0].categoria} S/.${monto.toFixed(2)}. Saldo devuelto al centro.`,
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción eliminar tesorería:", txErr);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar registro de tesorería",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al eliminar registro de tesorería:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar registro de tesorería",
      error: error.message,
    });
  }
};

// Restaurar un registro desde la papelera (soft restore) y descontar nuevamente del saldo del centro
const restoreTesoreria = async (req, res) => {
  try {
    // Defensa en profundidad: sólo ADMINISTRADOR puede restaurar
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }
    const { id } = req.params;
    const [existing] = await db.query(
      "SELECT id, monto, deleted_at, id_centro FROM TESORERIA WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro de tesorería no encontrado",
      });
    }
    if (!existing[0].deleted_at) {
      return res.status(400).json({
        success: false,
        message: "El registro no está en la papelera",
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const monto = parseFloat(existing[0].monto);
      const idCentro = existing[0].id_centro;

      // Si el registro tiene asociado un centro, validar y descontar del saldo del centro
      if (idCentro) {
        const [saldoCentroRows] = await connection.query(
          "SELECT saldo FROM TESORERIA_SALDO_CENTRO WHERE id_centro = ? FOR UPDATE",
          [idCentro],
        );

        if (saldoCentroRows.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: "Centro de distribución no encontrado o sin saldo asignado",
          });
        }

        const saldoActualCentro = parseFloat(saldoCentroRows[0].saldo || 0);

        if (monto > saldoActualCentro) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Saldo insuficiente en el centro para restaurar el registro. Saldo disponible: S/ ${saldoActualCentro.toFixed(2)}, requerido: S/ ${monto.toFixed(2)}`,
          });
        }

        const nuevoSaldoCentro = saldoActualCentro - monto;

        // Actualizar saldo del centro
        await connection.query(
          `UPDATE TESORERIA_SALDO_CENTRO SET saldo = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id_centro = ?`,
          [nuevoSaldoCentro, req.usuario ? req.usuario.id_usuario : null, idCentro],
        );

        // Registrar en historial del centro con tipo 'gasto' (es como si estuviera activo nuevamente)
        try {
          await connection.query(
            `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
             (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, id_registro_tesoreria, created_by, created_at)
             VALUES (?, 'gasto', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              idCentro,
              saldoActualCentro,
              monto,
              nuevoSaldoCentro,
              `Restauración de registro desde papelera`,
              id,
              req.usuario ? req.usuario.id_usuario : null,
            ],
          );
        } catch (histErr) {
          console.warn(
            "No se pudo registrar en historial de centro al restaurar:",
            histErr.message,
          );
        }
      }

      // Limpiar la marca de eliminación
      await connection.query(
        "UPDATE TESORERIA SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
      );

      // Audit dentro de la transacción
      try {
        await logAudit({
          req,
          evento: "RESTORE",
          entidad: "TESORERIA",
          entityId: Number(id),
          detalle: { 
            restored: true,
            saldo_descontado_del_centro: idCentro ? monto : null,
          },
        });
      } catch (auditErr) {
        console.warn("Advertencia: No se pudo registrar auditoría:", auditErr.message);
        // No rollback aquí, solo warning
      }

      await connection.commit();
      return res.json({ 
        success: true, 
        message: `Registro restaurado exitosamente. Saldo de S/ ${monto.toFixed(2)} descontado del centro.` 
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción restaurar tesorería:", txErr);
      return res.status(500).json({
        success: false,
        message: "Error al restaurar registro de tesorería",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al restaurar registro de tesorería:", error);
    return res.status(500).json({
      success: false,
      message: "Error al restaurar registro de tesorería",
      error: error.message,
    });
  }
};

// Buscar registros de tesorería con filtros y scope
const searchTesoreria = async (req, res) => {
  try {
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
        params,
      );
      rows = r;
    } catch (errQuery) {
      if (
        String(errQuery.message).includes("Unknown column") ||
        String(errQuery.code).includes("ER_BAD_FIELD_ERROR")
      ) {
        const [r2] = await db.query(
          `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
           FROM TESORERIA t
           LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
           ${where}
           ORDER BY t.fecha DESC, t.id DESC`,
          params,
        );
        rows = r2;
        rows.forEach((r) => {
          r.created_by_nombre = null;
          r.updated_by_nombre = null;
        });
      } else {
        throw errQuery;
      }
    }

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: `${rows.length} registros de tesorería encontrados`,
    });
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
    // una comprobación extra si llamadas directas bypassearan middleware.
    const reqObj = _req || {};
    if (!reqObj.userRoles && reqObj.usuario && reqObj.usuario.roles) {
      reqObj.userRoles = reqObj.usuario.roles.map((r) =>
        String(r).toUpperCase(),
      );
    }
    if (!reqObj.userRoles || !reqObj.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Obtener todos los registros a purgar con su id_centro
      const [toPurge] = await connection.query(
        `SELECT id, monto, id_centro FROM TESORERIA
         WHERE deleted_at IS NOT NULL
           AND deleted_at < (NOW() - INTERVAL 7 DAY)`,
      );

      // 2. Para cada registro, si tiene id_centro, devolver el monto al saldo del centro
      for (const record of toPurge) {
        if (record.id_centro) {
          const monto = parseFloat(record.monto || 0);
          
          try {
            // Actualizar saldo del centro
            await connection.query(
              `UPDATE TESORERIA_SALDO_CENTRO 
               SET saldo = saldo + ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id_centro = ?`,
              [monto, reqObj.usuario ? reqObj.usuario.id_usuario : null, record.id_centro],
            );

            // Registrar en historial del centro
            try {
              await connection.query(
                `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
                 (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, id_registro_tesoreria, created_by, created_at)
                 SELECT 
                   id_centro,
                   'devolucion',
                   saldo - ?,
                   ?,
                   saldo,
                   'Purga automática: devolución por eliminación permanente de registro',
                   ?,
                   ?,
                   CURRENT_TIMESTAMP
                 FROM TESORERIA_SALDO_CENTRO
                 WHERE id_centro = ?`,
                [monto, monto, record.id, reqObj.usuario ? reqObj.usuario.id_usuario : null, record.id_centro],
              );
            } catch (histErr) {
              console.warn(
                `No se pudo registrar en historial al purgar registro ${record.id}:`,
                histErr.message,
              );
            }
          } catch (updateErr) {
            console.warn(
              `No se pudo actualizar saldo del centro ${record.id_centro} al purgar:`,
              updateErr.message,
            );
          }
        }
      }

      // 3. Eliminar permanentemente los registros
      const [result] = await connection.query(
        `DELETE FROM TESORERIA
         WHERE deleted_at IS NOT NULL
           AND deleted_at < (NOW() - INTERVAL 7 DAY)`,
      );

      const affected = result?.affectedRows ?? 0;

      // Auditar la purga dentro de la transacción
      try {
        await logAudit({
          req: reqObj,
          evento: "PURGE",
          entidad: "TESORERIA",
          entityId: null,
          detalle: { 
            registros_purgados: affected,
            registros_procesados: toPurge.length,
          },
        });
      } catch (auditErr) {
        console.warn("Advertencia: No se pudo registrar auditoría de purga:", auditErr.message);
        // No rollback aquí, solo warning
      }

      await connection.commit();

      return res.json({
        success: true,
        purged: affected,
        message: `Registros eliminados definitivamente: ${affected}. Saldos devueltos a los centros.`,
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción purgar tesorería:", txErr);
      return res.status(500).json({
        success: false,
        message: "Error al purgar registros de tesorería",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error al purgar tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error al purgar registros de tesorería",
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
      const [rows] = await connection.query(
        "SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE",
      );
      if (rows.length === 0) {
        // nada que snapshotear, crear fila con saldo 0
        await connection.query(
          "INSERT INTO TESORERIA_SALDO (saldo) VALUES (?)",
          [0],
        );
        await connection.commit();
        return res.json({
          success: true,
          message: "Rollover completado: saldo inicializado a 0",
        });
      }
      const saldoActual = parseFloat(rows[0].saldo || 0);
      const fechaHoy = getTodayLimaYMD();
      // Insertar snapshot en history
      await connection.query(
        "INSERT INTO TESORERIA_SALDO_HISTORY (fecha, saldo_final) VALUES (?, ?)",
        [fechaHoy, saldoActual],
      );
      // Política actual: mantener el sobrante para el día siguiente (no resetear el saldo)
      await connection.commit();
      try {
        await logAudit({
          req,
          evento: "ROLLOVER",
          entidad: "TESORERIA_SALDO",
          entityId: rows[0]?.id || null,
          detalle: { fecha: fechaHoy, saldo_final: saldoActual },
        });
      } catch (e) {}
      console.log(
        `✅ Rollover tesorería: snapshot ${saldoActual} guardado para ${fechaHoy}`,
      );
      return res.json({
        success: true,
        message: "Rollover completado",
        saldo_final: saldoActual,
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción rollover:", txErr);
      return res.status(500).json({
        success: false,
        message: "Error en rollover",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error en rolloverSaldo:", err);
    return res.status(500).json({
      success: false,
      message: "Error en rollover",
      error: err.message,
    });
  }
};

module.exports.rolloverSaldo = rolloverSaldo;

// Helper reutilizable: realiza el rollover (snapshot) de forma idempotente (upsert por fecha)
const performRollover = async (req) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE",
    );
    let saldoActual = 0;
    if (rows.length === 0) {
      const [ins] = await connection.query(
        "INSERT INTO TESORERIA_SALDO (saldo) VALUES (?)",
        [0],
      );
      saldoActual = 0;
    } else {
      saldoActual = parseFloat(rows[0].saldo || 0);
    }
    const fechaHoy = getTodayLimaYMD();
    // Usar upsert (ON DUPLICATE KEY UPDATE) — requiere índice único en la columna `fecha` de la tabla history
    await connection.query(
      `INSERT INTO TESORERIA_SALDO_HISTORY (fecha, saldo_final)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE saldo_final = VALUES(saldo_final), updated_at = CURRENT_TIMESTAMP`,
      [fechaHoy, saldoActual],
    );
    await connection.commit();
    try {
      await logAudit({
        req,
        evento: "ROLLOVER",
        entidad: "TESORERIA_SALDO",
        entityId: rows[0]?.id || null,
        detalle: { fecha: fechaHoy, saldo_final: saldoActual },
      });
    } catch (e) {}
    return {
      success: true,
      message: "Rollover completado (idempotente)",
      saldo_final: saldoActual,
    };
  } catch (err) {
    await connection.rollback();
    console.error("Error en performRollover:", err);
    throw err;
  } finally {
    connection.release();
  }
};

// Exponer helper para uso interno
module.exports.performRollover = performRollover;

// Export historial
module.exports.getSaldoHistorial = getSaldoHistorial;

// ============================================
// SALDOS POR CENTRO DE DISTRIBUCIÓN
// ============================================

// Obtener saldos de todos los centros de distribución
const getSaldosPorCentro = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        sc.id_centro,
        sc.saldo,
        c.codigo,
        c.nombre as nombre_centro,
        c.ciudad,
        sc.updated_at,
        sc.updated_by,
        u.nombre_completo as updated_by_nombre
       FROM TESORERIA_SALDO_CENTRO sc
       LEFT JOIN CENTRO_DISTRIBUCION c ON sc.id_centro = c.id_centro
       LEFT JOIN USUARIO u ON sc.updated_by = u.id_usuario
       ORDER BY c.nombre ASC`,
    );

    const data = (rows || []).map((r) => ({
      id_centro: r.id_centro,
      nombre_centro: r.nombre_centro || "Sin nombre",
      codigo: r.codigo || "",
      saldo: parseFloat(r.saldo || 0),
      ciudad: r.ciudad || "",
      updated_at: r.updated_at,
      updated_by_nombre: r.updated_by_nombre,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error obteniendo saldos por centro:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener saldos por centro",
      error: error.message,
    });
  }
};

// Establecer saldo específico de un centro
const setSaldoCentro = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }

    const id_centro = Number(req.params.id_centro);
    const { saldo, motivo } = req.body || {};

    if (isNaN(id_centro) || id_centro <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "ID de centro inválido" });
    }

    if (typeof saldo === "undefined" || isNaN(parseFloat(saldo))) {
      return res
        .status(400)
        .json({ success: false, message: "Saldo inválido" });
    }

    if (parseFloat(saldo) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "El saldo no puede ser negativo" });
    }

    if (!motivo || !String(motivo).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Motivo requerido" });
    }

    const nuevoSaldo = parseFloat(saldo);
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Verificar que el centro existe
      const [centroRows] = await connection.query(
        "SELECT id_centro, nombre FROM CENTRO_DISTRIBUCION WHERE id_centro = ?",
        [id_centro],
      );

      if (centroRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Centro de distribución no encontrado",
        });
      }

      // Obtener saldo actual
      const [saldoRows] = await connection.query(
        "SELECT saldo FROM TESORERIA_SALDO_CENTRO WHERE id_centro = ? FOR UPDATE",
        [id_centro],
      );

      let saldoAnterior = 0;
      if (saldoRows.length === 0) {
        // Crear registro de saldo si no existe
        await connection.query(
          `INSERT INTO TESORERIA_SALDO_CENTRO (id_centro, saldo, updated_by, updated_at)
           VALUES (?, ?, ?, ${getLimaNowSQLClause()})`,
          [id_centro, nuevoSaldo, req.usuario ? req.usuario.id_usuario : null],
        );
      } else {
        saldoAnterior = parseFloat(saldoRows[0].saldo || 0);
        // Actualizar saldo
        await connection.query(
          `UPDATE TESORERIA_SALDO_CENTRO
           SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()}
           WHERE id_centro = ?`,
          [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, id_centro],
        );
      }

      // Registrar en historial (si existe la tabla)
      try {
        await connection.query(
          `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
           (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, created_by, created_at)
           VALUES (?, 'establecer', ?, ?, ?, ?, ?, ${getLimaNowSQLClause()})`,
          [
            id_centro,
            saldoAnterior,
            nuevoSaldo,
            nuevoSaldo,
            String(motivo).trim(),
            req.usuario ? req.usuario.id_usuario : null,
          ],
        );
      } catch (histErr) {
        console.warn(
          "No se pudo registrar en historial (tabla puede no existir):",
          histErr.message,
        );
      }

      await connection.commit();

      try {
        await logAudit({
          req,
          evento: "SET_SALDO_CENTRO",
          entidad: "TESORERIA_SALDO_CENTRO",
          entityId: id_centro,
          detalle: {
            saldo_anterior: saldoAnterior,
            saldo_nuevo: nuevoSaldo,
            motivo,
          },
        });
      } catch (e) {}

      res.json({
        success: true,
        data: { id_centro, saldo: nuevoSaldo },
        message: "Saldo establecido correctamente",
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción setSaldoCentro:", txErr);
      res.status(500).json({
        success: false,
        message: "Error al establecer saldo",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error en setSaldoCentro:", error);
    res.status(500).json({
      success: false,
      message: "Error al establecer saldo",
      error: error.message,
    });
  }
};

// Incrementar saldo de un centro
const incrementarSaldoCentro = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }

    const id_centro = Number(req.params.id_centro);
    const { monto, motivo } = req.body || {};

    if (isNaN(id_centro) || id_centro <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "ID de centro inválido" });
    }

    if (typeof monto === "undefined" || isNaN(parseFloat(monto))) {
      return res
        .status(400)
        .json({ success: false, message: "Monto inválido" });
    }

    if (parseFloat(monto) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "El monto debe ser mayor a 0" });
    }

    if (!motivo || !String(motivo).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Motivo requerido" });
    }

    const montoIncremento = parseFloat(monto);
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Verificar que el centro existe
      const [centroRows] = await connection.query(
        "SELECT id_centro, nombre FROM CENTRO_DISTRIBUCION WHERE id_centro = ?",
        [id_centro],
      );

      if (centroRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Centro de distribución no encontrado",
        });
      }

      // Obtener saldo actual
      const [saldoRows] = await connection.query(
        "SELECT saldo FROM TESORERIA_SALDO_CENTRO WHERE id_centro = ? FOR UPDATE",
        [id_centro],
      );

      let saldoAnterior = 0;
      let nuevoSaldo = 0;

      if (saldoRows.length === 0) {
        // Crear registro de saldo si no existe
        nuevoSaldo = montoIncremento;
        await connection.query(
          `INSERT INTO TESORERIA_SALDO_CENTRO (id_centro, saldo, updated_by, updated_at)
           VALUES (?, ?, ?, ${getLimaNowSQLClause()})`,
          [id_centro, nuevoSaldo, req.usuario ? req.usuario.id_usuario : null],
        );
      } else {
        saldoAnterior = parseFloat(saldoRows[0].saldo || 0);
        nuevoSaldo = saldoAnterior + montoIncremento;
        // Actualizar saldo
        await connection.query(
          `UPDATE TESORERIA_SALDO_CENTRO
           SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()}
           WHERE id_centro = ?`,
          [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, id_centro],
        );
      }

      // Registrar en historial (si existe la tabla)
      try {
        await connection.query(
          `INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL
           (id_centro, tipo, saldo_anterior, monto, saldo_nuevo, motivo, created_by, created_at)
           VALUES (?, 'incrementar', ?, ?, ?, ?, ?, ${getLimaNowSQLClause()})`,
          [
            id_centro,
            saldoAnterior,
            montoIncremento,
            nuevoSaldo,
            String(motivo).trim(),
            req.usuario ? req.usuario.id_usuario : null,
          ],
        );
      } catch (histErr) {
        console.warn(
          "No se pudo registrar en historial (tabla puede no existir):",
          histErr.message,
        );
      }

      await connection.commit();

      try {
        await logAudit({
          req,
          evento: "INCREMENTAR_SALDO_CENTRO",
          entidad: "TESORERIA_SALDO_CENTRO",
          entityId: id_centro,
          detalle: {
            saldo_anterior: saldoAnterior,
            monto_agregado: montoIncremento,
            saldo_nuevo: nuevoSaldo,
            motivo,
          },
        });
      } catch (e) {}

      res.json({
        success: true,
        data: {
          id_centro,
          saldo_anterior: saldoAnterior,
          monto_agregado: montoIncremento,
          saldo: nuevoSaldo,
        },
        message: "Saldo incrementado correctamente",
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("Error en transacción incrementarSaldoCentro:", txErr);
      res.status(500).json({
        success: false,
        message: "Error al incrementar saldo",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error en incrementarSaldoCentro:", error);
    res.status(500).json({
      success: false,
      message: "Error al incrementar saldo",
      error: error.message,
    });
  }
};

// Exportar funciones de saldos por centro
module.exports.getSaldosPorCentro = getSaldosPorCentro;
module.exports.setSaldoCentro = setSaldoCentro;
module.exports.incrementarSaldoCentro = incrementarSaldoCentro;

// Obtener vehiculos para dropdown
const getDropdownVehiculos = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id_vehiculo as id, placa, marca, modelo FROM VEHICULO WHERE activo = 1 ORDER BY placa LIMIT 500",
    );
    // Normalizar a { id, placa, descripcion }
    const data = (rows || []).map((r) => ({
      id: r.id,
      placa: r.placa,
      descripcion:
        `${r.placa} ${r.marca ? `- ${r.marca}` : ""} ${r.modelo ? ` ${r.modelo}` : ""}`.trim(),
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error obteniendo vehiculos para dropdown:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener vehiculos",
      error: error.message,
    });
  }
};

const getDropdownRepartidores = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id_repartidor as id, codigo, nombre FROM REPARTIDOR WHERE activo = 1 ORDER BY nombre LIMIT 500",
    );
    const data = (rows || []).map((r) => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: `${r.codigo ? `${r.codigo} - ` : ""}${r.nombre}`,
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error obteniendo repartidores para dropdown:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener repartidores",
      error: error.message,
    });
  }
};

module.exports.getDropdownVehiculos = getDropdownVehiculos;
module.exports.getDropdownRepartidores = getDropdownRepartidores;

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
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }

    const { tipo, monto, motivo, fecha } = req.body || {};
    if (!["incremento", "decremento"].includes(String(tipo))) {
      return res.status(400).json({
        success: false,
        message: "Tipo inválido (use incremento/decremento)",
      });
    }
    const amount = parseFloat(monto);
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Monto inválido" });
    }
    if (!motivo || !String(motivo).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Motivo requerido" });
    }

    await ensureAjusteTables();

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [saldoRows] = await connection.query(
        "SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE",
      );
      let saldoId, saldoActual;
      if (saldoRows.length === 0) {
        const [ins] = await connection.query(
          "INSERT INTO TESORERIA_SALDO (saldo) VALUES (0)",
        );
        saldoId = ins.insertId;
        saldoActual = 0;
      } else {
        saldoId = saldoRows[0].id;
        saldoActual = parseFloat(saldoRows[0].saldo || 0);
      }
      const signo = tipo === "incremento" ? 1 : -1;
      const nuevoSaldo = saldoActual + signo * amount;
      if (nuevoSaldo < 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Saldo insuficiente para aplicar el ajuste",
        });
      }

      const f = fecha && String(fecha).trim() ? fecha : getTodayLimaYMD();
      const [aj] = await connection.query(
        "INSERT INTO TESORERIA_AJUSTE (fecha, tipo, monto, motivo, created_by) VALUES (?, ?, ?, ?, ?)",
        [
          f,
          tipo,
          amount,
          String(motivo).trim(),
          req.usuario ? req.usuario.id_usuario : null,
        ],
      );
      await connection.query(
        `UPDATE TESORERIA_SALDO SET saldo = ?, updated_by = ?, updated_at = ${getLimaNowSQLClause()} WHERE id = ?`,
        [nuevoSaldo, req.usuario ? req.usuario.id_usuario : null, saldoId],
      );
      await connection.commit();

      try {
        await logAudit({
          req,
          evento: "AJUSTE",
          entidad: "TESORERIA_SALDO",
          entityId: saldoId,
          detalle: {
            ajuste_id: aj.insertId,
            fecha: f,
            tipo,
            monto: amount,
            motivo,
            saldo_before: saldoActual,
            saldo_after: nuevoSaldo,
          },
        });
      } catch (e) {}
      res.status(201).json({
        success: true,
        data: { id: aj.insertId, saldo: nuevoSaldo },
        message: "Ajuste aplicado",
      });
    } catch (txErr) {
      await connection.rollback();
      console.error("❌ Error en ajuste:", txErr);
      res.status(500).json({
        success: false,
        message: "Error al aplicar ajuste",
        error: txErr.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error creando ajuste:", error);
    res.status(500).json({
      success: false,
      message: "Error creando ajuste",
      error: error.message,
    });
  }
};

const listAjustes = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }
    await ensureAjusteTables();
    const { fecha_inicio, fecha_fin } = req.query || {};
    let where = "WHERE 1=1";
    const params = [];
    if (fecha_inicio) {
      where += " AND fecha >= ?";
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      where += " AND fecha <= ?";
      params.push(fecha_fin);
    }
    const [rows] = await db.query(
      `SELECT a.*, u.nombre_completo AS created_by_nombre
       FROM TESORERIA_AJUSTE a
       LEFT JOIN USUARIO u ON a.created_by = u.id_usuario
       ${where}
       ORDER BY a.fecha DESC, a.id DESC
       LIMIT 500`,
      params,
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error("❌ Error listando ajustes:", error);
    res.status(500).json({
      success: false,
      message: "Error listando ajustes",
      error: error.message,
    });
  }
};

const resumenDia = async (req, res) => {
  try {
    const fecha =
      (req.query?.fecha && String(req.query.fecha).trim()) || getTodayLimaYMD();
    await ensureAjusteTables();
    // Opening: saldo_final del día anterior (si existe)
    const [openRows] = await db.query(
      "SELECT saldo_final FROM TESORERIA_SALDO_HISTORY WHERE fecha = DATE_SUB(?, INTERVAL 1 DAY) LIMIT 1",
      [fecha],
    );
    const opening = openRows.length
      ? parseFloat(openRows[0].saldo_final || 0)
      : null;
    const [gastoRows] = await db.query(
      "SELECT COALESCE(SUM(monto),0) AS total FROM TESORERIA WHERE deleted_at IS NULL AND fecha = ?",
      [fecha],
    );
    const totalGastos = parseFloat(gastoRows[0].total || 0);
    const [ajInc] = await db.query(
      "SELECT COALESCE(SUM(monto),0) AS total FROM TESORERIA_AJUSTE WHERE tipo='incremento' AND fecha = ?",
      [fecha],
    );
    const [ajDec] = await db.query(
      "SELECT COALESCE(SUM(monto),0) AS total FROM TESORERIA_AJUSTE WHERE tipo='decremento' AND fecha = ?",
      [fecha],
    );
    const totalInc = parseFloat(ajInc[0].total || 0);
    const totalDec = parseFloat(ajDec[0].total || 0);
    const closingCalc = (opening ?? 0) + totalInc - totalDec - totalGastos;
    const [saldoNow] = await db.query(
      "SELECT saldo FROM TESORERIA_SALDO LIMIT 1",
    );
    const saldoActual = saldoNow.length
      ? parseFloat(saldoNow[0].saldo || 0)
      : 0;
    res.json({
      success: true,
      data: {
        fecha,
        opening,
        total_ajustes_incremento: totalInc,
        total_ajustes_decremento: totalDec,
        total_gastos: totalGastos,
        closing_calculado: closingCalc,
        saldo_actual: saldoActual,
      },
    });
  } catch (error) {
    console.error("❌ Error en resumen diario:", error);
    res.status(500).json({
      success: false,
      message: "Error en resumen diario",
      error: error.message,
    });
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
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }

    const { entidad, entity_id, desde, hasta, evento } = req.query;
    let where = "WHERE 1=1";
    const params = [];
    if (entidad) {
      where += " AND entidad = ?";
      params.push(entidad);
    }
    if (entity_id) {
      where += " AND entity_id = ?";
      params.push(Number(entity_id));
    }
    if (evento) {
      where += " AND evento = ?";
      params.push(evento);
    }
    if (desde) {
      where += " AND fecha_evento >= ?";
      params.push(desde);
    }
    if (hasta) {
      where += " AND fecha_evento <= ?";
      params.push(hasta);
    }

    const [rows] = await db.query(
      `SELECT a.id, a.fecha_evento, a.evento, a.entidad, a.entity_id, a.user_id, u.nombre_completo AS user_nombre, a.ip, a.detalle
       FROM TESORERIA_AUDIT a
       LEFT JOIN USUARIO u ON a.user_id = u.id_usuario
       ${where}
       ORDER BY a.fecha_evento DESC, a.id DESC
       LIMIT 500`,
      params,
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error("❌ Error obteniendo auditoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener auditoría",
      error: error.message,
    });
  }
};

const getAuditByTesoreriaId = async (req, res) => {
  try {
    if (!req.userRoles && req.usuario && req.usuario.roles) {
      req.userRoles = req.usuario.roles.map((r) => String(r).toUpperCase());
    }
    if (!req.userRoles || !req.userRoles.includes("ADMINISTRADOR")) {
      return res.status(403).json({
        success: false,
        message: "Acción no permitida: se requiere rol ADMINISTRADOR",
      });
    }
    const id = Number(req.params.id);
    const [rows] = await db.query(
      `SELECT a.id, a.fecha_evento, a.evento, a.entidad, a.entity_id, a.user_id, u.nombre_completo AS user_nombre, a.ip, a.detalle
       FROM TESORERIA_AUDIT a
       LEFT JOIN USUARIO u ON a.user_id = u.id_usuario
       WHERE a.entidad = 'TESORERIA' AND a.entity_id = ?
       ORDER BY a.fecha_evento DESC, a.id DESC`,
      [id],
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error("❌ Error obteniendo auditoría por id:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener auditoría",
      error: error.message,
    });
  }
};

module.exports.getAudit = getAudit;
module.exports.getAuditByTesoreriaId = getAuditByTesoreriaId;

// =====================
// Exportar registros a XLSX
// =====================
const exportTesoreria = async (req, res) => {
  try {
    console.log("📊 Iniciando exportación de tesorería...");

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
        params,
      );
      rows = r;
    } catch (errQuery) {
      if (
        String(errQuery.message).includes("Unknown column") ||
        String(errQuery.code).includes("ER_BAD_FIELD_ERROR")
      ) {
        console.warn(
          "⚠️ Consulta de exportación con joins de auditoría falló, intentando consulta de respaldo",
        );
        const [r2] = await db.query(
          `SELECT t.id, t.fecha, t.placa, t.nombre, t.cargo, t.categoria, t.detalle, t.reembolso, t.distrito, t.id_centro, c.codigo as centro_codigo, c.nombre as centro_nombre, t.turno, t.encargado, t.monto, t.created_at, t.updated_at
           FROM TESORERIA t
           LEFT JOIN CENTRO_DISTRIBUCION c ON t.id_centro = c.id_centro
           ${where}
           ORDER BY t.fecha DESC, t.id DESC`,
          params,
        );
        rows = r2;
        rows.forEach((r) => {
          r.created_by_nombre = null;
          r.updated_by_nombre = null;
        });
      } else {
        throw errQuery;
      }
    }

    console.log(`✅ Se encontraron ${rows.length} registros para exportar`);

    // Ocultar nombres si no es admin
    const userRoles = req.userRoles || [];
    const isAdmin =
      Array.isArray(userRoles) && userRoles.includes("ADMINISTRADOR");
    if (!isAdmin) {
      rows.forEach((r) => {
        r.created_by_nombre = null;
        r.updated_by_nombre = null;
      });
    }

    // Preparar datos para exportación
    const exportData = rows.map((row) => ({
      "Fecha": row.fecha || "",
      "Placa": row.placa || "",
      "Nombre": row.nombre || "",
      "Cargo": row.cargo || "",
      "Categoría": row.categoria || "",
      "Detalle": row.detalle || "",
      "Reembolso": row.reembolso || "",
      "Distrito": row.distrito || "",
      "Centro Distribución": row.centro_nombre || "",
      "Turno": row.turno !== null && row.turno !== undefined ? row.turno : "",
      "Encargado": row.encargado || "",
      "Monto": row.monto || 0,
      ...(isAdmin && { "Creado Por": row.created_by_nombre || "" }),
      ...(isAdmin && { "Actualizado Por": row.updated_by_nombre || "" }),
      ...(isAdmin && { "Fecha Creación": row.created_at || "" }),
    }));

    // Usar xlsx para generar el archivo
    const XLSX = require("xlsx");
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tesorería");

    // Generar buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Configurar headers para descarga
    const timestamp = new Date().toISOString().split("T")[0];
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tesoreria_${timestamp}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Enviar archivo
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error al exportar tesorería:", error);
    res.status(500).json({
      success: false,
      message: "Error al exportar registros de tesorería",
      error: error.message,
    });
  }
};

module.exports.exportTesoreria = exportTesoreria;
