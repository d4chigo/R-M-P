const db = require("../config/db");

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
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
        v.tipo_viaje,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
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
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
        v.tipo_viaje,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
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
      salida_cd,
      llegada_cd,
      distancia_km,
      tiempo_manejo_min,
      tiempo_servicio_min,
      recarga_min,
      refrigerio_min,
      tipo_viaje,
    } = req.body;

    const created_by = req.usuario?.id_usuario || null;

    console.log("➕ Creando nuevo viaje:", {
      fecha,
      id_vehiculo,
      id_repartidor,
      nro_viaje,
    });

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
      return res.status(400).json({
        success: false,
        message: "El vehículo especificado no existe",
      });
    }

    // Verificar que el repartidor existe
    const [repartidor] = await db.query(
      "SELECT id_repartidor FROM REPARTIDOR WHERE id_repartidor = ?",
      [id_repartidor],
    );

    if (repartidor.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El repartidor especificado no existe",
      });
    }

    // Verificar que no exista ya un viaje con el mismo número para el mismo vehículo y fecha
    const [existingViaje] = await db.query(
      "SELECT id_viaje FROM VIAJE WHERE fecha = ? AND id_vehiculo = ? AND nro_viaje = ?",
      [fecha, id_vehiculo, nro_viaje],
    );

    if (existingViaje.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Ya existe un viaje con ese número para el mismo vehículo y fecha",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO VIAJE (
        fecha, id_vehiculo, id_repartidor, nro_viaje, salida_cd, llegada_cd,
        distancia_km, tiempo_manejo_min, tiempo_servicio_min, recarga_min,
        refrigerio_min, tipo_viaje, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        fecha,
        id_vehiculo,
        id_repartidor,
        nro_viaje,
        salida_cd || null,
        llegada_cd || null,
        distancia_km || null,
        tiempo_manejo_min || null,
        tiempo_servicio_min || null,
        recarga_min || null,
        refrigerio_min || null,
        tipo_viaje || null,
        created_by,
      ],
    );

    console.log(`✅ Viaje creado con ID: ${result.insertId}`);

    // Obtener el viaje creado con información relacionada
    const [newViaje] = await db.query(
      `
      SELECT
        v.id_viaje,
        DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha,
        v.id_vehiculo,
        v.id_repartidor,
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
        v.tipo_viaje,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
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
      [result.insertId],
    );

    // Process dates to ensure consistent formatting
    const processedViaje = processResponseData(newViaje[0]);

    res.status(201).json({
      success: true,
      data: processedViaje,
      message: "Viaje creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear viaje",
      error: error.message,
    });
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
      nro_viaje,
      salida_cd,
      llegada_cd,
      distancia_km,
      tiempo_manejo_min,
      tiempo_servicio_min,
      recarga_min,
      refrigerio_min,
      tipo_viaje,
    } = req.body;

    const updated_by = req.usuario?.id_usuario || null;

    console.log(`✏️ Actualizando viaje ID: ${id}`);

    // Verificar que el viaje existe
    const [existing] = await db.query(
      "SELECT id_viaje FROM VIAJE WHERE id_viaje = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado",
      });
    }

    // Verificar que el vehículo existe (si se proporciona)
    if (id_vehiculo) {
      const [vehiculo] = await db.query(
        "SELECT id_vehiculo FROM VEHICULO WHERE id_vehiculo = ?",
        [id_vehiculo],
      );

      if (vehiculo.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El vehículo especificado no existe",
        });
      }
    }

    // Verificar que el repartidor existe (si se proporciona)
    if (id_repartidor) {
      const [repartidor] = await db.query(
        "SELECT id_repartidor FROM REPARTIDOR WHERE id_repartidor = ?",
        [id_repartidor],
      );

      if (repartidor.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El repartidor especificado no existe",
        });
      }
    }

    // Verificar unicidad de número de viaje (si se está cambiando)
    if (fecha && id_vehiculo && nro_viaje) {
      const [existingViaje] = await db.query(
        "SELECT id_viaje FROM VIAJE WHERE fecha = ? AND id_vehiculo = ? AND nro_viaje = ? AND id_viaje != ?",
        [fecha, id_vehiculo, nro_viaje, id],
      );

      if (existingViaje.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Ya existe otro viaje con ese número para el mismo vehículo y fecha",
        });
      }
    }

    await db.query(
      `
      UPDATE VIAJE
      SET
        fecha = COALESCE(?, fecha),
        id_vehiculo = COALESCE(?, id_vehiculo),
        id_repartidor = COALESCE(?, id_repartidor),
        nro_viaje = COALESCE(?, nro_viaje),
        salida_cd = ?,
        llegada_cd = ?,
        distancia_km = ?,
        tiempo_manejo_min = ?,
        tiempo_servicio_min = ?,
        recarga_min = ?,
        refrigerio_min = ?,
        tipo_viaje = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_viaje = ?
    `,
      [
        fecha,
        id_vehiculo,
        id_repartidor,
        nro_viaje,
        salida_cd,
        llegada_cd,
        distancia_km,
        tiempo_manejo_min,
        tiempo_servicio_min,
        recarga_min,
        refrigerio_min,
        tipo_viaje,
        updated_by,
        id,
      ],
    );

    console.log(`✅ Viaje ${id} actualizado exitosamente`);

    // Obtener el viaje actualizado
    const [updatedViaje] = await db.query(
      `
      SELECT
        v.id_viaje,
        DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha,
        v.id_vehiculo,
        v.id_repartidor,
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
        v.tipo_viaje,
        v.created_by,
        v.updated_by,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
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

    // Process dates to ensure consistent formatting
    const processedViaje = processResponseData(updatedViaje[0]);

    res.json({
      success: true,
      data: processedViaje,
      message: "Viaje actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar viaje",
      error: error.message,
    });
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

    // Verificar si tiene visitas asociadas con información detallada
    const [visitas] = await db.query(
      `
      SELECT
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ', ') as clientes_nombres
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      WHERE vis.id_viaje = ?
    `,
      [id],
    );

    if (visitas[0].count > 0) {
      const clientesInfo = visitas[0].clientes_nombres || "clientes sin nombre";

      console.log(
        `⚠️ No se puede eliminar viaje ${id}: tiene ${visitas[0].count} visitas asociadas`,
      );

      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el viaje porque tiene ${visitas[0].count} visitas asociadas`,
        error:
          `Este viaje del ${new Date(viaje.fecha).toLocaleDateString("es-PE")} ` +
          `(Vehículo: ${viaje.vehiculo_placa}, Repartidor: ${viaje.repartidor_nombre}) ` +
          `tiene ${visitas[0].count} visita${visitas[0].count > 1 ? "s" : ""} asociada${visitas[0].count > 1 ? "s" : ""} ` +
          `a los siguientes clientes: ${clientesInfo}. ` +
          `Para eliminar este viaje, primero debe eliminar todas las visitas relacionadas ` +
          `o transferirlas a otro viaje.`,
        details: {
          viaje_id: viaje.id_viaje,
          fecha: viaje.fecha,
          vehiculo: `${viaje.vehiculo_placa} - ${viaje.vehiculo_marca} ${viaje.vehiculo_modelo}`,
          repartidor: `${viaje.repartidor_codigo} - ${viaje.repartidor_nombre}`,
          visitas_count: visitas[0].count,
          clientes_afectados: clientesInfo,
          solucion:
            "Elimine primero las visitas asociadas o transfiéralas a otro viaje",
        },
      });
    }

    // Si no hay visitas, proceder con la eliminación
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
        timestamp: new Date().toISOString(),
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
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
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
        v.nro_viaje,
        v.salida_cd,
        v.llegada_cd,
        v.distancia_km,
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
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

// Obtener viajes con estadísticas de visitas
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
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
        v.tipo_viaje,
        vh.placa as vehiculo_placa,
        vh.marca as vehiculo_marca,
        vh.modelo as vehiculo_modelo,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        COALESCE(stats.total_visitas, 0) as total_visitas,
        COALESCE(stats.total_pedidos, 0) as total_pedidos,
        COALESCE(stats.total_entrega_cf, 0) as total_entrega_cf,
        COALESCE(stats.total_recojo_cf, 0) as total_recojo_cf,
        COALESCE(stats.total_peso_kg, 0) as total_peso_kg,
        v.created_at,
        v.updated_at
      FROM VIAJE v
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN (
        SELECT
          id_viaje,
          COUNT(*) as total_visitas,
          SUM(pedidos) as total_pedidos,
          SUM(entrega_cf) as total_entrega_cf,
          SUM(recojo_cf) as total_recojo_cf,
          SUM(peso_kg) as total_peso_kg
        FROM VISITA
        GROUP BY id_viaje
      ) stats ON v.id_viaje = stats.id_viaje
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
