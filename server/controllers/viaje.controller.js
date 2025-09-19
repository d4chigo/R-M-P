const db = require("../config/db");
const { todayPeruYMD, toPeruYMD, nowPeruTimestamp } = require("../lib/date-utils");

// Utility function to format dates consistently
const formatDateForResponse = (dateValue) => {
  if (!dateValue) return null;

  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue;
  }

  // If it's a Date object, format it to YYYY-MM-DD
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split("T")[0];
  }

  // Try to parse and format
  try {
    const date = new Date(dateValue);
    return date.toISOString().split("T")[0];
  } catch {
    return dateValue;
  }
};

// Process response data to ensure consistent date formatting
const processResponseData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (item.fecha) {
        item.fecha = formatDateForResponse(item.fecha);
      }
      return item;
    });
  }

  if (data && typeof data === "object" && data.fecha) {
    data.fecha = formatDateForResponse(data.fecha);
  }

  return data;
};

// Obtener todos los viajes
const getViajes = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de viajes...");

    const [viajes] = await db.query(`
  SELECT
    v.id_viaje,
    DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha,
    v.id_vehiculo,
    v.id_repartidor,
    v.id_centro,
    v.nro_viaje,
  v.salida_cd,
  v.llegada_cd,
  v.distancia_km,
  v.tipo_viaje,
        v.nro_clientes,
        v.nro_pedidos,
        v.entrega_cf,
        v.recojo_cf,
        v.peso_kg,
  v.nro_conductores,
        v.nro_liquidadores,
        v.nro_auxiliares,
        v.nro_trip_adicional,
        v.tripulacion_especial,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
  vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
  c.codigo as centro_codigo,
  c.nombre as centro_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
  v.territorios_visitados,
  v.created_at,
  v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN CENTRO_DISTRIBUCION c ON v.id_centro = c.id_centro
      LEFT JOIN USUARIO uc ON v.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON v.updated_by = uu.id_usuario
      ORDER BY v.fecha DESC, v.nro_viaje ASC
    `);

    console.log(`✅ Se encontraron ${viajes.length} viajes`);

    // Process dates to ensure consistent formatting
    const processedViajes = processResponseData(viajes);

    res.json({
      success: true,
      data: processedViajes,
      count: processedViajes.length,
      message: "Viajes obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener viajes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes",
      error: error.message,
    });
  }
};

// Obtener un viaje por ID
const getViajeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando viaje con ID: ${id}`);

    const [viaje] = await db.query(
      `
  SELECT
        v.id_viaje,
        DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha,
        v.id_vehiculo,
        v.id_repartidor,
    v.id_centro,
        v.nro_viaje,
  v.salida_cd,
  v.llegada_cd,
  v.distancia_km,
  v.tipo_viaje,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
  c.codigo as centro_codigo,
  c.nombre as centro_nombre,
        uu.nombre_completo as updated_by_name,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN USUARIO uc ON v.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON v.updated_by = uu.id_usuario
      WHERE v.id_viaje = ?
    `,
      [id],
    );

    if (viaje.length === 0) {
      console.log(`⚠️ Viaje con ID ${id} no encontrado`);
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    console.log(
      `✅ Viaje encontrado: ${viaje[0].fecha} - ${viaje[0].vehiculo_placa}`,
    );

    // Process dates to ensure consistent formatting
    const processedViaje = processResponseData(viaje[0]);

    res.json({
      success: true,
      data: processedViaje,
      message: "Viaje obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viaje",
      error: error.message,
    });
  }
};

// Crear un nuevo viaje
const createViaje = async (req, res) => {
  try {
    const {
      fecha,
      id_vehiculo,
      id_repartidor,
      nro_viaje,
      territorios_visitados,
      salida_cd,
      llegada_cd,
  id_centro,
      distancia_km,
      tipo_viaje,
      nro_clientes,
      nro_pedidos,
      entrega_cf,
      recojo_cf,
      peso_kg,
      nro_conductores,
      nro_liquidadores,
      nro_auxiliares,
      nro_trip_adicional,
      tripulacion_especial,
    } = req.body;

    const created_by = req.usuario?.id_usuario || null;

    // Validaciones básicas
    if (!fecha || !id_vehiculo || !id_repartidor || !nro_viaje) {
      return res.status(400).json({
        success: false,
        message: "Fecha, vehículo, repartidor y número de viaje son requeridos",
      });
    }

    // Verificar que el vehículo existe
    const [vehiculo] = await db.query(
      "SELECT id_vehiculo FROM VEHICULO WHERE id_vehiculo = ?",
      [id_vehiculo],
    );
    if (vehiculo.length === 0) {
      return res.status(400).json({ success: false, message: "El vehículo especificado no existe" });
    }

    // Verificar que el repartidor existe
    const [repartidor] = await db.query(
      "SELECT id_repartidor FROM REPARTIDOR WHERE id_repartidor = ?",
      [id_repartidor],
    );
    if (repartidor.length === 0) {
      return res.status(400).json({ success: false, message: "El repartidor especificado no existe" });
    }

    // Si se envía id_centro, validar que exista
    if (id_centro) {
      const [cent] = await db.query('SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?', [id_centro]);
      if (cent.length === 0) return res.status(400).json({ success: false, message: 'El centro de distribución especificado no existe' });
    }

    // Unicidad de nro_viaje por fecha y vehículo
    const [existingViaje] = await db.query(
      "SELECT id_viaje FROM VIAJE WHERE fecha = ? AND id_vehiculo = ? AND nro_viaje = ?",
      [fecha, id_vehiculo, nro_viaje],
    );
    if (existingViaje.length > 0) {
      return res.status(400).json({ success: false, message: "Ya existe un viaje con ese número para el mismo vehículo y fecha" });
    }

    const [result] = await db.query(
      `INSERT INTO VIAJE (
        fecha, id_vehiculo, id_repartidor, id_centro, nro_viaje, territorios_visitados,
        salida_cd, llegada_cd, distancia_km, tipo_viaje,
        nro_clientes, nro_pedidos, entrega_cf, recojo_cf, peso_kg,
        nro_conductores, nro_liquidadores, nro_auxiliares, nro_trip_adicional, tripulacion_especial,
        created_by
      ) VALUES (${new Array(21).fill('?').join(', ')})`,
      [
        fecha,
        id_vehiculo,
        id_repartidor,
        id_centro || null,
        nro_viaje,
        territorios_visitados || 0,
        salida_cd || null,
        llegada_cd || null,
        distancia_km || null,
        tipo_viaje || null,
        nro_clientes || 0,
        nro_pedidos || 0,
        entrega_cf || 0,
        recojo_cf || 0,
        peso_kg || 0,
        nro_conductores || 1,
        nro_liquidadores || 0,
        nro_auxiliares || 0,
        nro_trip_adicional || 0,
        tripulacion_especial || null,
        created_by,
      ],
    );

    const [newViaje] = await db.query(
      `SELECT
        v.id_viaje,
        DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha,
        v.id_vehiculo,
        v.id_repartidor,
        v.id_centro,
        v.nro_viaje,
        v.territorios_visitados,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tipo_viaje,
        v.nro_clientes,
        v.nro_pedidos,
        v.entrega_cf,
        v.recojo_cf,
        v.peso_kg,
        v.nro_conductores,
        v.nro_liquidadores,
        v.nro_auxiliares,
        v.nro_trip_adicional,
        v.tripulacion_especial,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        c.codigo as centro_codigo,
        c.nombre as centro_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN CENTRO_DISTRIBUCION c ON v.id_centro = c.id_centro
      LEFT JOIN USUARIO uc ON v.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON v.updated_by = uu.id_usuario
      WHERE v.id_viaje = ?`,
      [result.insertId],
    );

    res.status(201).json({ success: true, data: processResponseData(newViaje[0]), message: 'Viaje creado exitosamente' });
  } catch (error) {
    console.error('❌ Error al crear viaje:', error);
    res.status(500).json({ success: false, message: 'Error al crear viaje', error: error.message });
  }
    
};

// Actualizar un viaje
const updateViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha,
      id_vehiculo,
      id_repartidor,
      id_centro,
      nro_viaje,
      territorios_visitados,
      salida_cd,
      llegada_cd,
      distancia_km,
      tipo_viaje,
      nro_clientes,
      nro_pedidos,
      entrega_cf,
      recojo_cf,
      peso_kg,
      nro_conductores,
      nro_liquidadores,
      nro_auxiliares,
      nro_trip_adicional,
      tripulacion_especial,
    } = req.body;

    const updated_by = req.usuario?.id_usuario || null;

  // Verificar existencia
  const [exists] = await db.query('SELECT id_viaje FROM VIAJE WHERE id_viaje = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ success: false, message: 'Viaje no encontrado' });

    // Validar FK si se envían
    if (id_vehiculo) {
      const [veh] = await db.query('SELECT id_vehiculo FROM VEHICULO WHERE id_vehiculo = ?', [id_vehiculo]);
      if (veh.length === 0) return res.status(400).json({ success: false, message: 'El vehículo especificado no existe' });
    }
    if (id_repartidor) {
      const [rep] = await db.query('SELECT id_repartidor FROM REPARTIDOR WHERE id_repartidor = ?', [id_repartidor]);
      if (rep.length === 0) return res.status(400).json({ success: false, message: 'El repartidor especificado no existe' });
    }
    if (id_centro) {
      const [cent] = await db.query('SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?', [id_centro]);
      if (cent.length === 0) return res.status(400).json({ success: false, message: 'El centro de distribución especificado no existe' });
    }

    // Unicidad
    if (fecha && id_vehiculo && nro_viaje) {
      const [dup] = await db.query('SELECT id_viaje FROM VIAJE WHERE fecha = ? AND id_vehiculo = ? AND nro_viaje = ? AND id_viaje != ?', [fecha, id_vehiculo, nro_viaje, id]);
      if (dup.length > 0) return res.status(400).json({ success: false, message: 'Ya existe otro viaje con ese número para el mismo vehículo y fecha' });
    }

    await db.query(
      `UPDATE VIAJE SET
        fecha = COALESCE(?, fecha),
        id_centro = COALESCE(?, id_centro),
        id_vehiculo = COALESCE(?, id_vehiculo),
        id_repartidor = COALESCE(?, id_repartidor),
        nro_viaje = COALESCE(?, nro_viaje),
        territorios_visitados = COALESCE(?, territorios_visitados),
        salida_cd = ?,
        llegada_cd = ?,
        distancia_km = ?,
        tipo_viaje = ?,
        nro_clientes = COALESCE(?, nro_clientes),
        nro_pedidos = COALESCE(?, nro_pedidos),
        entrega_cf = COALESCE(?, entrega_cf),
        recojo_cf = COALESCE(?, recojo_cf),
        peso_kg = COALESCE(?, peso_kg),
        nro_conductores = COALESCE(?, nro_conductores),
        nro_liquidadores = COALESCE(?, nro_liquidadores),
        nro_auxiliares = COALESCE(?, nro_auxiliares),
        nro_trip_adicional = COALESCE(?, nro_trip_adicional),
        tripulacion_especial = COALESCE(?, tripulacion_especial),
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_viaje = ?`,
      [
        fecha,
        id_centro,
        id_vehiculo,
        id_repartidor,
        nro_viaje,
        territorios_visitados,
        salida_cd || null,
        llegada_cd || null,
        distancia_km || null,
        tipo_viaje || null,
        nro_clientes,
        nro_pedidos,
        entrega_cf,
        recojo_cf,
        peso_kg,
        nro_conductores,
        nro_liquidadores,
        nro_auxiliares,
        nro_trip_adicional,
        tripulacion_especial,
        updated_by,
        id,
      ],
    );

    const [updatedViaje] = await db.query(
      `SELECT
        v.id_viaje,
        DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha,
        v.id_vehiculo,
        v.id_repartidor,
        v.id_centro,
        v.nro_viaje,
        v.territorios_visitados,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tipo_viaje,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        c.codigo as centro_codigo,
        c.nombre as centro_nombre,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN CENTRO_DISTRIBUCION c ON v.id_centro = c.id_centro
      LEFT JOIN USUARIO uc ON v.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON v.updated_by = uu.id_usuario
      WHERE v.id_viaje = ?`,
      [id],
    );

    res.json({ success: true, data: processResponseData(updatedViaje[0]), message: 'Viaje actualizado exitosamente' });
  } catch (error) {
    console.error('❌ Error al actualizar viaje:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar viaje', error: error.message });
  }
};

// Eliminar un viaje
const deleteViaje = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando viaje ID: ${id}`);

    // Verificar que el viaje existe con información completa
    const [existing] = await db.query(
      `
      SELECT
        v.id_viaje,
        v.fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      WHERE v.id_viaje = ?
    `,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
        error: "El viaje especificado no existe en la base de datos",
      });
    }

    const viaje = existing[0];


    await db.query("DELETE FROM VIAJE WHERE id_viaje = ?", [id]);

    const successMessage =
      `Viaje ${new Date(viaje.fecha).toLocaleDateString("es-PE")} - ` +
      `${viaje.vehiculo_placa} - Viaje ${viaje.nro_viaje} eliminado exitosamente`;

    console.log(`✅ ${successMessage}`);

    res.json({
      success: true,
      message: successMessage,
      data: {
        id_viaje_eliminado: viaje.id_viaje,
        fecha: viaje.fecha,
        vehiculo: viaje.vehiculo_placa,
        repartidor: viaje.repartidor_nombre,
        nro_viaje: viaje.nro_viaje,
      },
    });
  } catch (error) {
    console.error("❌ Error al eliminar viaje:", error);

    // Verificar si es un error de constraint de foreign key
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar el viaje porque está siendo referenciado por otros registros",
        error:
          "Este viaje tiene dependencias en otras tablas del sistema. " +
          "Verifique que no tenga visitas, reportes u otros registros asociados antes de eliminarlo.",
        details: {
          error_code: error.code,
          error_type: "FOREIGN_KEY_CONSTRAINT",
          solucion:
            "Revise y elimine primero todos los registros que dependan de este viaje",
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar viaje",
      error: error.message,
      details: {
        error_code: error.code || "UNKNOWN",
        timestamp: nowPeruTimestamp(),
      },
    });
  }
};

// Buscar viajes
const searchViajes = async (req, res) => {
  try {
    const { q, fecha_inicio, fecha_fin } = req.query;
    console.log(`🔍 Buscando viajes con parámetros:`, {
      q,
      fecha_inicio,
      fecha_fin,
    });

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        vh.placa LIKE ? OR
        r.nombre LIKE ? OR
        r.codigo LIKE ? OR
        v.tipo_viaje LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (fecha_inicio) {
      whereClause += " AND v.fecha >= ?";
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      whereClause += " AND v.fecha <= ?";
      params.push(fecha_fin);
    }

    const [viajes] = await db.query(
      `
  SELECT
        v.id_viaje,
        v.fecha,
        v.id_vehiculo,
        v.id_repartidor,
    v.id_centro,
        v.nro_viaje,
    v.salida_cd,
    v.llegada_cd,
  v.distancia_km,
  v.tipo_viaje,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      ${whereClause}
      ORDER BY v.fecha DESC, v.nro_viaje ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${viajes.length} resultados`);

    res.json({
      success: true,
      data: viajes,
      count: viajes.length,
      message: `${viajes.length} viajes encontrados`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de viajes:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de viajes",
      error: error.message,
    });
  }
};

// Obtener viajes por fecha
const getViajesByFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`📅 Obteniendo viajes para fecha: ${fecha}`);

    const [viajes] = await db.query(
      `
  SELECT
        v.id_viaje,
        v.fecha,
        v.id_vehiculo,
        v.id_repartidor,
    v.id_centro,
        v.nro_viaje,
    v.salida_cd,
    v.llegada_cd,
  v.distancia_km,
  v.tipo_viaje,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      WHERE v.fecha = ?
      ORDER BY v.nro_viaje ASC
    `,
      [fecha],
    );

    console.log(
      `✅ Se encontraron ${viajes.length} viajes para la fecha ${fecha}`,
    );

    res.json({
      success: true,
      data: viajes,
      count: viajes.length,
      message: `${viajes.length} viajes encontrados para la fecha ${fecha}`,
    });
  } catch (error) {
    console.error("❌ Error al obtener viajes por fecha:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes por fecha",
      error: error.message,
    });
  }
};

// Obtener viajes con estadísticas
const getViajesConEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo viajes con estadísticas...");

    const [viajes] = await db.query(`
      SELECT
        v.id_viaje,
        v.fecha,
        v.id_vehiculo,
        v.id_repartidor,
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
  0 AS recarga_min,
  0 AS refrigerio_min,
        v.tipo_viaje,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        0 as total_visitas,
        0 as total_pedidos,
        0 as total_entrega_cf,
        0 as total_recojo_cf,
        0 as total_peso_kg,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      ORDER BY v.fecha DESC, v.nro_viaje ASC
    `);

    console.log(`✅ Se encontraron ${viajes.length} viajes con estadísticas`);

    res.json({
      success: true,
      data: viajes,
      count: viajes.length,
      message: "Viajes con estadísticas obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener viajes con estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viajes con estadísticas",
      error: error.message,
    });
  }
};

module.exports = {
  getViajes,
  getViajeById,
  createViaje,
  updateViaje,
  deleteViaje,
  searchViajes,
  getViajesByFecha,
  getViajesConEstadisticas,
  // Aliases para compatibilidad
  getAll: getViajes,
  getById: getViajeById,
  create: createViaje,
  update: updateViaje,
  delete: deleteViaje,
};
