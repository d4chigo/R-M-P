const db = require("../config/db");

// Obtener todas las visitas
const getVisitas = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de visitas...");

    const [visitas] = await db.query(`
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        vis.created_by,
        vis.updated_by,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN USUARIO uc ON vis.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON vis.updated_by = uu.id_usuario
      ORDER BY v.fecha DESC, v.nro_viaje ASC, vis.id_visita ASC
    `);

    console.log(`✅ Se encontraron ${visitas.length} visitas`);

    res.json({
      success: true,
      data: visitas,
      count: visitas.length,
      message: "Visitas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener visitas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener visitas",
      error: error.message,
    });
  }
};

// Obtener una visita por ID
const getVisitaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando visita con ID: ${id}`);

    const [visita] = await db.query(
      `
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        vis.created_by,
        vis.updated_by,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN USUARIO uc ON vis.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON vis.updated_by = uu.id_usuario
      WHERE vis.id_visita = ?
    `,
      [id],
    );

    if (visita.length === 0) {
      console.log(`⚠️ Visita con ID ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: "Visita no encontrada",
      });
    }

    console.log(
      `✅ Visita encontrada: ${visita[0].cliente_nombre} - ${visita[0].viaje_fecha}`,
    );

    res.json({
      success: true,
      data: visita[0],
      message: "Visita obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener visita:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener visita",
      error: error.message,
    });
  }
};

// Crear una nueva visita
const createVisita = async (req, res) => {
  try {
    const {
      id_viaje,
      id_cliente,
      pedidos,
      entrega_cf,
      recojo_cf,
      peso_kg,
      distancia_km,
    } = req.body;

    console.log("➕ Creando nueva visita:", {
      id_viaje,
      id_cliente,
      pedidos,
    });

    // Validaciones básicas
    if (!id_viaje || !id_cliente) {
      return res.status(400).json({
        success: false,
        message: "Viaje y cliente son requeridos",
      });
    }

    // Verificar que el viaje existe
    const [viaje] = await db.query(
      "SELECT id_viaje FROM VIAJE WHERE id_viaje = ?",
      [id_viaje],
    );

    if (viaje.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El viaje especificado no existe",
      });
    }

    // Verificar que el cliente existe
    const [cliente] = await db.query(
      "SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?",
      [id_cliente],
    );

    if (cliente.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El cliente especificado no existe",
      });
    }

    // Verificar que no exista ya una visita para el mismo viaje y cliente
    const [existingVisita] = await db.query(
      "SELECT id_visita FROM VISITA WHERE id_viaje = ? AND id_cliente = ?",
      [id_viaje, id_cliente],
    );

    if (existingVisita.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una visita para este viaje y cliente",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO VISITA (
        id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id_viaje,
        id_cliente,
        pedidos || 0,
        entrega_cf || 0,
        recojo_cf || 0,
        peso_kg || 0,
        distancia_km || 0,
        created_by,
      ],
    );

    console.log(`✅ Visita creada con ID: ${result.insertId}`);

    // Obtener la visita creada con información relacionada
    const [newVisita] = await db.query(
      `
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        vis.created_by,
        vis.updated_by,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN USUARIO uc ON vis.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON vis.updated_by = uu.id_usuario
      WHERE vis.id_visita = ?
    `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newVisita[0],
      message: "Visita creada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear visita:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear visita",
      error: error.message,
    });
  }
};

// Actualizar una visita
const updateVisita = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_viaje,
      id_cliente,
      pedidos,
      entrega_cf,
      recojo_cf,
      peso_kg,
      distancia_km,
    } = req.body;

    const updated_by = req.usuario?.id_usuario || null;

    console.log(`✏️ Actualizando visita ID: ${id}`);

    // Verificar que la visita existe
    const [existing] = await db.query(
      "SELECT id_visita FROM VISITA WHERE id_visita = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Visita no encontrada",
      });
    }

    // Verificar que el viaje existe (si se proporciona)
    if (id_viaje) {
      const [viaje] = await db.query(
        "SELECT id_viaje FROM VIAJE WHERE id_viaje = ?",
        [id_viaje],
      );

      if (viaje.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El viaje especificado no existe",
        });
      }
    }

    // Verificar que el cliente existe (si se proporciona)
    if (id_cliente) {
      const [cliente] = await db.query(
        "SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?",
        [id_cliente],
      );

      if (cliente.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El cliente especificado no existe",
        });
      }
    }

    // Verificar unicidad de viaje-cliente (si se están cambiando)
    if (id_viaje && id_cliente) {
      const [existingVisita] = await db.query(
        "SELECT id_visita FROM VISITA WHERE id_viaje = ? AND id_cliente = ? AND id_visita != ?",
        [id_viaje, id_cliente, id],
      );

      if (existingVisita.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otra visita para este viaje y cliente",
        });
      }
    }

    await db.query(
      `
      UPDATE VISITA
      SET
        id_viaje = COALESCE(?, id_viaje),
        id_cliente = COALESCE(?, id_cliente),
        pedidos = COALESCE(?, pedidos),
        entrega_cf = COALESCE(?, entrega_cf),
        recojo_cf = COALESCE(?, recojo_cf),
        peso_kg = COALESCE(?, peso_kg),
        distancia_km = COALESCE(?, distancia_km)
      WHERE id_visita = ?
    `,
      [
        id_viaje,
        id_cliente,
        pedidos,
        entrega_cf,
        recojo_cf,
        peso_kg,
        distancia_km,
        id,
      ],
    );

    console.log(`✅ Visita ${id} actualizada exitosamente`);

    // Obtener la visita actualizada
    const [updatedVisita] = await db.query(
      `
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        vis.created_by,
        vis.updated_by,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN USUARIO uc ON vis.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON vis.updated_by = uu.id_usuario
      WHERE vis.id_visita = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedVisita[0],
      message: "Visita actualizada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar visita:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar visita",
      error: error.message,
    });
  }
};

// Eliminar una visita
const deleteVisita = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando visita ID: ${id}`);

    // Verificar que la visita existe
    const [existing] = await db.query(
      `
      SELECT vis.id_visita, c.nombre as cliente_nombre, v.fecha as viaje_fecha
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      WHERE vis.id_visita = ?
    `,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Visita no encontrada",
      });
    }

    await db.query("DELETE FROM VISITA WHERE id_visita = ?", [id]);

    console.log(
      `✅ Visita ${existing[0].cliente_nombre} - ${existing[0].viaje_fecha} eliminada exitosamente`,
    );

    res.json({
      success: true,
      message: `Visita ${existing[0].cliente_nombre} - ${existing[0].viaje_fecha} eliminada exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al eliminar visita:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar visita",
      error: error.message,
    });
  }
};

// Buscar visitas
const searchVisitas = async (req, res) => {
  try {
    const { q, fecha_inicio, fecha_fin, id_viaje, id_cliente } = req.query;
    console.log(`🔍 Buscando visitas con parámetros:`, {
      q,
      fecha_inicio,
      fecha_fin,
      id_viaje,
      id_cliente,
    });

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        c.codigo LIKE ? OR
        c.nombre LIKE ? OR
        vh.placa LIKE ? OR
        r.nombre LIKE ?
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

    if (id_viaje) {
      whereClause += " AND vis.id_viaje = ?";
      params.push(id_viaje);
    }

    if (id_cliente) {
      whereClause += " AND vis.id_cliente = ?";
      params.push(id_cliente);
    }

    const [visitas] = await db.query(
      `
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      ${whereClause}
      ORDER BY v.fecha DESC, v.nro_viaje ASC, vis.id_visita ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${visitas.length} resultados`);

    res.json({
      success: true,
      data: visitas,
      count: visitas.length,
      message: `${visitas.length} visitas encontradas`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de visitas:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de visitas",
      error: error.message,
    });
  }
};

// Obtener visitas por viaje
const getVisitasByViaje = async (req, res) => {
  try {
    const { id_viaje } = req.params;
    console.log(`🚛 Obteniendo visitas para viaje ID: ${id_viaje}`);

    const [visitas] = await db.query(
      `
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        c.direccion as cliente_direccion,
        z.nombre as zona_nombre,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE vis.id_viaje = ?
      ORDER BY vis.id_visita ASC
    `,
      [id_viaje],
    );

    console.log(
      `✅ Se encontraron ${visitas.length} visitas para el viaje ${id_viaje}`,
    );

    res.json({
      success: true,
      data: visitas,
      count: visitas.length,
      message: `${visitas.length} visitas encontradas para el viaje`,
    });
  } catch (error) {
    console.error("❌ Error al obtener visitas por viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener visitas por viaje",
      error: error.message,
    });
  }
};

// Obtener visitas por cliente
const getVisitasByCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    console.log(`👤 Obteniendo visitas para cliente ID: ${id_cliente}`);

    const [visitas] = await db.query(
      `
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      WHERE vis.id_cliente = ?
      ORDER BY v.fecha DESC, v.nro_viaje ASC
    `,
      [id_cliente],
    );

    console.log(
      `✅ Se encontraron ${visitas.length} visitas para el cliente ${id_cliente}`,
    );

    res.json({
      success: true,
      data: visitas,
      count: visitas.length,
      message: `${visitas.length} visitas encontradas para el cliente`,
    });
  } catch (error) {
    console.error("❌ Error al obtener visitas por cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener visitas por cliente",
      error: error.message,
    });
  }
};

// Obtener estadísticas de visitas
const getEstadisticasVisitas = async (req, res) => {
  try {
    console.log("📊 Calculando estadísticas de visitas...");

    const [estadisticas] = await db.query(`
      SELECT
        COUNT(*) as total_visitas,
        SUM(pedidos) as total_pedidos,
        SUM(entrega_cf) as total_entrega_cf,
        SUM(recojo_cf) as total_recojo_cf,
        SUM(peso_kg) as total_peso_kg,
        SUM(distancia_km) as total_distancia_km,
        AVG(pedidos) as promedio_pedidos_por_visita,
        AVG(entrega_cf) as promedio_entrega_cf_por_visita,
        AVG(peso_kg) as promedio_peso_kg_por_visita,
        COUNT(DISTINCT id_viaje) as total_viajes_con_visitas,
        COUNT(DISTINCT id_cliente) as total_clientes_visitados
      FROM VISITA
    `);

    console.log("✅ Estadísticas calculadas exitosamente");

    res.json({
      success: true,
      data: estadisticas[0],
      message: "Estadísticas de visitas calculadas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al calcular estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al calcular estadísticas de visitas",
      error: error.message,
    });
  }
};

module.exports = {
  getVisitas,
  getVisitaById,
  createVisita,
  updateVisita,
  deleteVisita,
  searchVisitas,
  getVisitasByViaje,
  getVisitasByCliente,
  getEstadisticasVisitas,
  // Aliases para compatibilidad
  getAll: getVisitas,
  getById: getVisitaById,
  create: createVisita,
  update: updateVisita,
  delete: deleteVisita,
};
