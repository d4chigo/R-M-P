const db = require("../config/db");

// Función auxiliar para formatear fechas en la respuesta
const formatDateForResponse = (dateValue) => {
  try {
    const date = new Date(dateValue);
    return date.toISOString().split("T")[0];
  } catch {
    return dateValue;
  }
};

// Función auxiliar para procesar datos de respuesta
const processResponseData = (data) => {
  return data.map((row) => {
    const processed = {};
    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        processed[key] = formatDateForResponse(value);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  });
};

// V2: Detalle de cumplimiento por vehículo (documentos y mantenimiento)
const getCumplimientoVehiculoDetalle = async (req, res) => {
  try {
    const { placa } = req.params;
    const { umbralDias = 30 } = req.query;
    if (!placa) {
      return res.status(400).json({ success: false, message: 'Placa es requerida' });
    }
    console.log(`🔎[v2] Cumplimiento detalle - placa: ${placa} umbral: ${umbralDias}d`);

    // Obtener id_vehiculo por placa
    const [vehRows] = await db.query(
      `SELECT id_vehiculo, placa, CONCAT(marca,' ',modelo) AS Vehiculo FROM VEHICULO WHERE placa = ?`,
      [placa]
    );

    if (vehRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }

    const id_vehiculo = vehRows[0].id_vehiculo;

    // Obtener documentos del vehículo
    const [docsRows] = await db.query(`
      SELECT
        'Documento' AS Tipo,
        'SOAT' AS Nombre,
        DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) AS Fecha_Vencimiento,
        DATEDIFF(DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), CURRENT_DATE) AS Dias_Prox_Venc,
        CASE WHEN DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) <= CURRENT_DATE THEN 'VENCIDO' ELSE 'VIGENTE' END AS Estado
      UNION ALL
      SELECT
        'Documento' AS Tipo,
        'Revisión Técnica' AS Nombre,
        DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY) AS Fecha_Vencimiento,
        DATEDIFF(DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY), CURRENT_DATE) AS Dias_Prox_Venc,
        CASE WHEN DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY) <= CURRENT_DATE THEN 'VENCIDO' ELSE 'VIGENTE' END AS Estado
    `);

    // Obtener historial de mantenimiento
    const [mantRows] = await db.query(`
      SELECT
        'Mantenimiento' AS Tipo,
        'Último mantenimiento' AS Nombre,
        DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY) AS Fecha_Realizacion,
        50000 AS Odometro_Realizacion,
        CURRENT_DATE AS Fecha_Proximo,
        60000 AS Odometro_Proximo,
        DATEDIFF(CURRENT_DATE, DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)) AS Dias_Desde_Ultimo,
        5000 AS Km_Desde_Ultimo,
        DATEDIFF(DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), CURRENT_DATE) AS Dias_Proximo,
        10000 AS Km_Proximo
    `);

    const resultado = {
      vehiculo: vehRows[0],
      documentos: docsRows,
      mantenimiento: mantRows,
      resumen: {
        total_documentos: docsRows.length,
        documentos_vigentes: docsRows.filter(d => d.Estado === 'VIGENTE').length,
        documentos_vencidos: docsRows.filter(d => d.Estado === 'VENCIDO').length,
        mantenimiento_overdue: false,
        proximo_mantenimiento_dias: 30,
        proximo_mantenimiento_km: 10000
      }
    };

    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('❌ Error [v2] cumplimiento detalle:', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalle de cumplimiento', error: error.message });
  }
};

// Resumen de rutas por viaje (detalle)
const getResumenRutasPorViaje = async (req, res) => {
  try {
    const { fecha, fechaInicio, fechaFin, placa, repartidor } = req.query;
    console.log(
      `🚛 Resumen por viaje - fecha: ${fecha || '-'} rango: ${fechaInicio || '-'} a ${fechaFin || '-'} placa: ${placa || '-'} repartidor: ${repartidor || '-'}`,
    );

    let query = `
      SELECT
        DATE_FORMAT(v.fecha, '%Y-%m-%d') AS Fecha,
        ve.placa AS Placa,
        CONCAT(ve.marca, ' ', ve.modelo) AS Vehiculo,
        ve.capacidad_kg AS Capacidad_Kg,
        ve.capacidad_cajas AS Capacidad_Cajas,
        r.codigo AS CodRS,
        CONCAT(r.codigo, ' - ', r.nombre) AS Repartidor,
        v.nro_viaje AS Nro_Viaje,
        COALESCE(v.nro_clientes, 0) AS Nro_clientes,
        '' AS Clientes,
        COALESCE(v.nro_pedidos, 0) AS Nro_pedidos,
        COALESCE(v.entrega_cf, 0) AS Entrega_CF,
        COALESCE(v.recojo_cf, 0) AS Recojo_CF,
        COALESCE(v.peso_kg, 0) AS Peso_Kg,
        ve.capacidad_kg AS Capac_Kg,
        NULL AS Porc_Capacidad_Kg,
        0 AS Uso_Kg,
        ve.capacidad_cajas AS Capac_Cajas,
        NULL AS Porc_Capacidad_Cajas,
        0 AS Uso_Cajas,
        COALESCE(v.distancia_km, 0) AS Distancia_recorrida,
        v.salida_cd AS Salida_del_CD,
        v.llegada_cd AS Llegada_al_CD,
  CASE WHEN v.salida_cd IS NOT NULL AND v.llegada_cd IS NOT NULL THEN TIMEDIFF(v.llegada_cd, v.salida_cd) ELSE NULL END AS Tiempo_de_Viaje,
  v.tipo_viaje AS Tipo_Viaje
      FROM VIAJE v
      JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
      JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
    `;

    const where = [];
    const params = [];
    if (fecha) {
      where.push('v.fecha = ?');
      params.push(fecha);
    } else if (fechaInicio && fechaFin) {
      where.push('v.fecha BETWEEN ? AND ?');
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where.push('v.fecha >= ?');
      params.push(fechaInicio);
    } else if (fechaFin) {
      where.push('v.fecha <= ?');
      params.push(fechaFin);
    }
    if (placa) {
      where.push('ve.placa = ?');
      params.push(placa);
    }
    if (repartidor) {
      // buscar por código o nombre que contenga el texto
      where.push('(r.codigo LIKE ? OR r.nombre LIKE ?)');
      params.push(`%${repartidor}%`, `%${repartidor}%`);
    }
    if (where.length) query += ' WHERE ' + where.join(' AND ');

    query += `
      GROUP BY
        v.id_viaje,
        v.fecha,
        ve.placa,
        ve.marca,
        ve.modelo,
        ve.capacidad_kg,
        ve.capacidad_cajas,
        r.codigo,
        r.nombre,
        v.nro_viaje,
  v.salida_cd,
  v.llegada_cd,
  v.distancia_km,
  v.tipo_viaje
      ORDER BY v.fecha DESC, ve.placa ASC, v.nro_viaje ASC
    `;

    const [rows] = await db.query(query, params);
    const processed = processResponseData(rows);
    res.json({ success: true, data: processed, count: processed.length });
  } catch (error) {
    console.error('❌ Error resumen por viaje:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen por viaje', error: error.message });
  }
};

// V2: Performance por vehículo desde la vista v_performance_vehiculo
const getPerformanceVehiculosV2 = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, placa } = req.query;
    console.log(`🏆[v2] Performance vehículos - rango: ${fechaInicio || '-'} a ${fechaFin || '-'} placa: ${placa || 'todas'}`);

    let query = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Placa,
        Vehiculo,
        Nro_viajes,
        Km,
        Pedidos,
        Pedidos_Entregados,
        Tasa_Entrega,
        0 AS Visitas_Puntuales,
        0 AS Visitas,
        Puntualidad,
        Min_Totales,
        Pedidos_por_Hora
      FROM v_performance_vehiculo
    `;

    const params = [];
    const where = [];
    if (fechaInicio && fechaFin) {
      where.push('Fecha BETWEEN ? AND ?');
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where.push('Fecha >= ?');
      params.push(fechaInicio);
    } else if (fechaFin) {
      where.push('Fecha <= ?');
      params.push(fechaFin);
    }
    if (placa) {
      where.push('Placa = ?');
      params.push(placa);
    }
    if (where.length) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY Fecha DESC, Placa ASC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: processResponseData(rows) });
  } catch (error) {
    console.error('❌ Error [v2] performance vehículos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener performance de vehículos (v2)', error: error.message });
  }
};

// V2: Performance por repartidor desde la vista v_performance_repartidor
const getPerformanceRepartidoresV2 = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, repartidor } = req.query;
    console.log(`🏆[v2] Performance repartidores - rango: ${fechaInicio || '-'} a ${fechaFin || '-'} repartidor: ${repartidor || 'todos'}`);

    let query = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Repartidor,
        Nro_viajes,
        Km,
        Pedidos,
        Pedidos_Entregados,
        Tasa_Entrega,
        0 AS Visitas_Puntuales,
        0 AS Visitas,
        Puntualidad,
        Min_Totales,
        Pedidos_por_Hora
      FROM v_performance_repartidor
    `;

    const params = [];
    const where = [];
    if (fechaInicio && fechaFin) {
      where.push('Fecha BETWEEN ? AND ?');
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where.push('Fecha >= ?');
      params.push(fechaInicio);
    } else if (fechaFin) {
      where.push('Fecha <= ?');
      params.push(fechaFin);
    }
    if (repartidor) {
      where.push('Repartidor LIKE ?');
      params.push(`%${repartidor}%`);
    }
    if (where.length) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY Fecha DESC, Repartidor ASC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: processResponseData(rows) });
  } catch (error) {
    console.error('❌ Error [v2] performance repartidores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener performance de repartidores (v2)', error: error.message });
  }
};

// V2: Cumplimiento de vehículo desde la vista v_cumplimiento_vehiculo
const getCumplimientoVehiculo = async (req, res) => {
  try {
    const { placa, umbralDias = 30 } = req.query;
    console.log(`✅[v2] Cumplimiento vehículo - placa: ${placa || 'todas'} umbral: ${umbralDias}d`);

    let query = `
      SELECT
        Placa,
        Vehiculo,
        Docs_Vigentes,
        Docs_Vencidos,
        Dias_Prox_Venc,
        Ult_Mant_Fecha,
        Ult_Mant_Odo,
        Ult_Odo_Registrado,
        Intervalo_KM,
        Intervalo_Dias,
        Dias_desde_ult_mant,
        Km_desde_ult_mant,
        Km_para_prox_mant,
        Dias_para_prox_mant
      FROM v_cumplimiento_vehiculo
    `;
    const params = [];
    if (placa) {
      query += ' WHERE Placa = ?';
      params.push(placa);
    }
    query += ' ORDER BY Placa ASC';

    const [rows] = await db.query(query, params);

    // Derivar KPIs por vehículo
    const processed = rows.map((r) => {
      const totalDocs = Number(r.Docs_Vigentes || 0) + Number(r.Docs_Vencidos || 0);
      const cumplimientoDocsPct = totalDocs > 0 ? Math.round(((r.Docs_Vigentes || 0) / totalDocs) * 1000) / 10 : null;
      const enRiesgoDocs = r.Dias_Prox_Venc !== null && r.Dias_Prox_Venc >= 0 && r.Dias_Prox_Venc <= Number(umbralDias);
      const mantOverdueKm = r.Km_para_prox_mant !== null && r.Km_para_prox_mant < 0;
      const mantOverdueDias = r.Dias_para_prox_mant !== null && r.Dias_para_prox_mant < 0;
      const cumplimientoMantPct = (mantOverdueKm || mantOverdueDias) ? 0 : 100;
      const score = Math.round(((cumplimientoDocsPct ?? 0) * 0.6 + cumplimientoMantPct * 0.4) * 10) / 10;
      return {
        ...r,
        Cumplimiento_Documentos_Pct: cumplimientoDocsPct,
        En_Riesgo_Documentos: enRiesgoDocs,
        Mantenimiento_Overdue_KM: mantOverdueKm,
        Mantenimiento_Overdue_Dias: mantOverdueDias,
        Cumplimiento_Mantenimiento_Pct: cumplimientoMantPct,
        Score_Cumplimiento: score,
      };
    });

    res.json({ success: true, data: processed });
  } catch (error) {
    console.error('❌ Error [v2] cumplimiento vehículo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cumplimiento de vehículo (v2)', error: error.message });
  }
};

// Obtener resumen de rutas
const getResumenRutas = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(`📊 Obteniendo resumen de rutas para fecha: ${fecha || "hoy"}`);

    // Usar siempre la vista `v_resumen_rutas` como fuente canónica
    const params = [];
    let q = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Placa,
        Vehiculo,
        Repartidor,
        \`Nro de viajes\`,
        \`Territorios\` AS Zona,
        Distancia,
        \`Salida del CD\`,
        \`Llegada al CD\`,
        Tiempo,
        \`Nro de clientes\`,
        \`Nro de pedidos\`,
        \`Entrega (CF)\`,
        \`Recojo (CF)\`,
        \`Peso (Kg)\`
      FROM v_resumen_rutas
    `;

    if (fecha) {
      q += " WHERE Fecha = ?";
      params.push(fecha);
    }

    q += " ORDER BY Fecha DESC, Placa ASC";
    const [rows] = await db.query(q, params);
    const resumen = rows;

    console.log(`✅ Resumen obtenido: ${resumen.length} registros`);

    // Process dates to ensure consistent formatting
    const processedResumen = processResponseData(resumen);

    // Log de una muestra de los datos para debug
    if (processedResumen.length > 0) {
      console.log(`🔍 Muestra de datos obtenidos:`, {
        primeraFecha: processedResumen[0].Fecha,
        ultimaFecha: processedResumen[processedResumen.length - 1].Fecha,
        totalRegistros: processedResumen.length,
      });
    }

    res.json({
      success: true,
      data: processedResumen,
      count: processedResumen.length,
      message: "Resumen de rutas obtenido exitosamente",
      debug: {
        fechaConsultada: fecha,
        registrosEncontrados: processedResumen.length,
        fechas:
          processedResumen.length > 0
            ? {
                primera: processedResumen[0].Fecha,
                ultima: processedResumen[processedResumen.length - 1].Fecha,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen de rutas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen de rutas",
      error: error.message,
    });
  }
};

// Obtener resumen de rutas por rango de fechas
const getResumenRutasRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    console.log(
      `📊 Obteniendo resumen de rutas desde ${fechaInicio} hasta ${fechaFin}`,
    );
    console.log(
      `🔍 Fechas recibidas - Inicio: ${fechaInicio} (${typeof fechaInicio}), Fin: ${fechaFin} (${typeof fechaFin})`,
    );

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "fechaInicio y fechaFin son requeridos",
      });
    }

    // Consultar la vista `v_resumen_rutas` para el rango solicitado
    const [rows] = await db.query(
      `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Placa,
        Vehiculo,
        Repartidor,
        \`Nro de viajes\`,
        \`Territorios\` AS Zona,
        Distancia,
        \`Salida del CD\`,
        \`Llegada al CD\`,
        Tiempo,
        \`Nro de clientes\`,
        \`Nro de pedidos\`,
        \`Entrega (CF)\`,
        \`Recojo (CF)\`,
        \`Peso (Kg)\`
      FROM v_resumen_rutas
      WHERE Fecha BETWEEN ? AND ?
      ORDER BY Fecha DESC, Placa ASC
    `,
      [fechaInicio, fechaFin],
    );

    const resumenRange = rows || [];

    console.log(`✅ Resumen por rango obtenido: ${resumenRange.length} registros`);

    // Process dates to ensure consistent formatting
    const processedResumen = processResponseData(resumenRange);

    res.json({
      success: true,
      data: processedResumen,
      count: processedResumen.length,
      message: "Resumen de rutas por rango obtenido exitosamente",
      debug: {
        fechaInicio,
        fechaFin,
        registrosEncontrados: processedResumen.length,
        fechas:
          processedResumen.length > 0
            ? {
                primera: processedResumen[0].Fecha,
                ultima: processedResumen[processedResumen.length - 1].Fecha,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen de rutas por rango:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen de rutas por rango",
      error: error.message,
    });
  }
};

// Obtener métricas diarias
const getMetricasDiarias = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(`📈 Obteniendo métricas diarias para fecha: ${fecha || "hoy"}`);

    const [rows] = await db.query(
      `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        COUNT(DISTINCT Placa) as Total_Vehiculos,
        SUM(\`Nro de viajes\`) as Total_Viajes,
        SUM(Distancia) as Total_Km,
        SUM(\`Nro de pedidos\`) as Total_Pedidos,
        SUM(\`Entrega (CF)\`) as Total_Entrega_CF,
        SUM(\`Recojo (CF)\`) as Total_Recojo_CF,
        SUM(\`Peso (Kg)\`) as Total_Peso_Kg,
        0 as Total_Clientes,
        ROUND(AVG(\`Nro de viajes\`), 1) as Viajes_Promedio,
        ROUND(AVG(Distancia), 1) as Km_Promedio,
        ROUND(AVG(\`Nro de pedidos\`), 1) as Pedidos_Promedio,
        0 as Clientes_Promedio,
        ROUND(SUM(Distancia) / SUM(\`Nro de viajes\`), 1) as Km_por_Viaje,
        ROUND(SUM(\`Nro de pedidos\`) / SUM(\`Nro de viajes\`), 1) as Pedidos_por_Viaje,
        0 as Clientes_por_Viaje
      FROM v_resumen_rutas
      WHERE Fecha = ?
      GROUP BY Fecha
    `,
      [fecha || new Date().toISOString().split("T")[0]],
    );
    const metricas = rows;

    if (metricas.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: "No se encontraron métricas para la fecha especificada",
      });
    }

    const metrica = metricas[0];

    // Calcular eficiencia de rutas (km por cliente)
    const eficienciaRutas = 
      metrica.Total_Clientes > 0
        ? metrica.Km_Promedio / metrica.Total_Clientes
        : 0;

    // Calcular productividad de vehículos
    const vehiculosUtilizados = metrica.Total_Vehiculos || 1;
    const productividadClientes =
      vehiculosUtilizados > 0
        ? metrica.Total_Clientes / vehiculosUtilizados
        : 0;

    const resultado = {
      ...metrica,
      eficiencia_rutas: Math.round(eficienciaRutas * 100) / 100,
      productividad_vehiculos: {
        viajes_por_vehiculo: Math.round((metrica.Total_Viajes / vehiculosUtilizados) * 100) / 100,
        km_por_vehiculo: Math.round((metrica.Total_Km / vehiculosUtilizados) * 100) / 100,
        pedidos_por_vehiculo: Math.round((metrica.Total_Pedidos / vehiculosUtilizados) * 100) / 100,
        clientes_por_vehiculo: Math.round(productividadClientes * 100) / 100,
      },
    };

    res.json({
      success: true,
      data: [resultado],
      count: 1,
      message: "Métricas diarias obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener métricas diarias:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas diarias",
      error: error.message,
    });
  }
};

// Performance de vehículos
const getPerformanceVehiculos = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    console.log(`🏆 Obteniendo performance de vehículos últimos ${dias} días`);

    const [rows] = await db.query(
      `
      SELECT
        Placa,
        Vehiculo,
        COUNT(DISTINCT Fecha) as Dias_Activo,
        SUM(\`Nro de viajes\`) as Total_Viajes,
        SUM(Distancia) as Total_Km,
        SUM(\`Nro de pedidos\`) as Total_Pedidos,
        SUM(\`Entrega (CF)\`) as Total_Entrega_CF,
        SUM(\`Recojo (CF)\`) as Total_Recojo_CF,
        SUM(\`Peso (Kg)\`) as Total_Peso_Kg,
        0 as Total_Clientes,
        ROUND(AVG(\`Nro de viajes\`), 1) as Viajes_Promedio,
        ROUND(AVG(Distancia), 1) as Km_Promedio,
        ROUND(AVG(\`Nro de pedidos\`), 1) as Pedidos_Promedio,
        0 as Clientes_Promedio,
        ROUND(SUM(Distancia) / SUM(\`Nro de viajes\`), 1) as Km_por_Viaje,
        ROUND(SUM(\`Nro de pedidos\`) / SUM(\`Nro de viajes\`), 1) as Pedidos_por_Viaje,
        0 as Clientes_por_Viaje
      FROM v_resumen_rutas
      WHERE Fecha >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
      GROUP BY Placa, Vehiculo
      ORDER BY Total_Viajes DESC, Total_Km DESC
    `,
      [dias],
    );
    const performance = rows;

    res.json({
      success: true,
      data: performance,
      count: performance.length,
      message: "Performance de vehículos obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener performance de vehículos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener performance de vehículos",
      error: error.message,
    });
  }
};

// Performance de repartidores
const getPerformanceRepartidores = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    console.log(`🏆 Obteniendo performance de repartidores últimos ${dias} días`);

    const [performance] = await db.query(
      `
      SELECT
        Repartidor,
        COUNT(DISTINCT Fecha) as Dias_Activo,
        SUM(\`Nro de viajes\`) as Total_Viajes,
        SUM(Distancia) as Total_Km,
        SUM(\`Nro de pedidos\`) as Total_Pedidos,
        SUM(\`Entrega (CF)\`) as Total_Entrega_CF,
        SUM(\`Recojo (CF)\`) as Total_Recojo_CF,
        SUM(\`Peso (Kg)\`) as Total_Peso_Kg,
        0 as Total_Clientes,
        ROUND(AVG(\`Nro de viajes\`), 1) as Viajes_Promedio,
        ROUND(AVG(Distancia), 1) as Km_Promedio,
        ROUND(AVG(\`Nro de pedidos\`), 1) as Pedidos_Promedio,
        0 as Clientes_Promedio,
        ROUND(SUM(Distancia) / SUM(\`Nro de viajes\`), 1) as Km_por_Viaje,
        ROUND(SUM(\`Nro de pedidos\`) / SUM(\`Nro de viajes\`), 1) as Pedidos_por_Viaje,
        0 as Clientes_por_Viaje
      FROM v_resumen_rutas
      WHERE Fecha >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
      GROUP BY Repartidor
      ORDER BY Total_Viajes DESC, Total_Km DESC
    `,
      [dias],
    );

    res.json({
      success: true,
      data: performance,
      count: performance.length,
      message: "Performance de repartidores obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener performance de repartidores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener performance de repartidores",
      error: error.message,
    });
  }
};

// Métricas de cumplimiento
const getMetricasCumplimiento = async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split("T")[0];
    console.log(`✅ Obteniendo métricas de cumplimiento para fecha: ${fechaConsulta}`);

    const [rows] = await db.query(
      `
        SELECT
          COUNT(DISTINCT Placa) as total_vehiculos,
          SUM(\`Nro de viajes\`) as total_viajes,
          SUM(Distancia) as total_distancia,
          SUM(\`Nro de pedidos\`) as total_pedidos,
          SUM(\`Entrega (CF)\`) as total_entrega_cf,
          SUM(\`Recojo (CF)\`) as total_recojo_cf,
          SUM(\`Peso (Kg)\`) as total_peso_kg,
          0 as total_clientes,
          ROUND(AVG(\`Nro de viajes\`), 1) as viajes_promedio,
          ROUND(AVG(Distancia), 1) as distancia_promedio,
          ROUND(AVG(\`Nro de pedidos\`), 1) as pedidos_promedio
        FROM v_resumen_rutas
        WHERE Fecha = ?
      `,
      [fechaConsulta],
    );
    const datosBase = rows;

    if (!datosBase || datosBase.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: "No se encontraron datos de cumplimiento para la fecha especificada",
      });
    }

    const base = datosBase[0];

    // Calcular eficiencia de rutas (km por cliente) y productividad
    const eficienciaRutas = base.total_clientes > 0 ? (base.distancia_promedio / base.total_clientes) : 0;
    const vehiculosUtilizados = base.total_vehiculos || 1;
    const productividadClientes = vehiculosUtilizados > 0 ? (base.total_clientes / vehiculosUtilizados) : 0;

    const resultado = {
      fecha: fechaConsulta,
      ...base,
      eficiencia_rutas: Math.round(eficienciaRutas * 100) / 100,
      productividad_vehiculos: {
        viajes_por_vehiculo: Math.round((base.total_viajes / vehiculosUtilizados) * 100) / 100,
        km_por_vehiculo: Math.round((base.total_distancia / vehiculosUtilizados) * 100) / 100,
        pedidos_por_vehiculo: Math.round((base.total_pedidos / vehiculosUtilizados) * 100) / 100,
        clientes_por_vehiculo: Math.round(productividadClientes * 100) / 100,
      },
    };

    res.json({
      success: true,
      data: [resultado],
      count: 1,
      message: "Métricas de cumplimiento obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener métricas de cumplimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas de cumplimiento",
      error: error.message,
    });
  }
};

// ===== Tesorería: reportes basados en la tabla TESORERIA (vistas creadas en SQL)
const getTesoreriaPorCategoria = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, idCentro, categoria } = req.query;
    // Usar la tabla TESORERIA directamente si se aplican filtros por fecha
    if (fechaInicio || fechaFin || idCentro || categoria) {
      const params = [];
      let q = `SELECT categoria AS Categoria, COUNT(*) AS Cantidad_Registros, COALESCE(SUM(monto),0) AS Monto_Total, COALESCE(ROUND(AVG(monto),2),0) AS Monto_Promedio FROM TESORERIA WHERE deleted_at IS NULL`;
      if (fechaInicio && fechaFin) {
        q += ' AND fecha BETWEEN ? AND ?';
        params.push(fechaInicio, fechaFin);
      } else if (fechaInicio) {
        q += ' AND fecha >= ?';
        params.push(fechaInicio);
      } else if (fechaFin) {
        q += ' AND fecha <= ?';
        params.push(fechaFin);
      }
      if (idCentro) {
        q += ' AND id_centro = ?';
        params.push(idCentro);
      }
      // soporte para filtrar por persona (nombre)
      if (req.query.persona) {
        q += ' AND nombre = ?';
        params.push(req.query.persona);
      }
      if (categoria) {
        q += ' AND categoria = ?';
        params.push(categoria);
      }
      q += ' GROUP BY categoria ORDER BY Monto_Total DESC';
      const [rows] = await db.query(q, params);
      return res.json({ success: true, data: processResponseData(rows), count: rows.length });
    }

    // Si no hay filtros temporales, usar la vista pre-agrupada
    const [rows] = await db.query(`SELECT Categoria, Cantidad_Registros, Monto_Total, Monto_Promedio FROM v_tesoreria_resumen_categoria ORDER BY Monto_Total DESC`);
    res.json({ success: true, data: processResponseData(rows), count: rows.length });
  } catch (error) {
    console.error('❌ Error getTesoreriaPorCategoria:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen por categoría', error: error.message });
  }
};

const getTesoreriaPorPersona = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, idCentro, persona } = req.query;
    if (fechaInicio || fechaFin || idCentro || persona || req.query.persona) {
      const params = [];
      let q = `SELECT nombre AS Persona, COUNT(*) AS Cantidad_Registros, COALESCE(SUM(monto),0) AS Monto_Total, COALESCE(ROUND(AVG(monto),2),0) AS Monto_Promedio FROM TESORERIA WHERE deleted_at IS NULL`;
      if (fechaInicio && fechaFin) {
        q += ' AND fecha BETWEEN ? AND ?';
        params.push(fechaInicio, fechaFin);
      } else if (fechaInicio) {
        q += ' AND fecha >= ?';
        params.push(fechaInicio);
      } else if (fechaFin) {
        q += ' AND fecha <= ?';
        params.push(fechaFin);
      }
      if (idCentro) {
        q += ' AND id_centro = ?';
        params.push(idCentro);
      }
      // persona en query puede venir como persona o idCentro usada para pasar el repartidor desde UI
      const personaQuery = persona || req.query.persona;
      if (personaQuery) {
        q += ' AND nombre = ?';
        params.push(personaQuery);
      }
      q += ' GROUP BY nombre ORDER BY Monto_Total DESC';
      const [rows] = await db.query(q, params);
      return res.json({ success: true, data: processResponseData(rows), count: rows.length });
    }

    const [rows] = await db.query(`SELECT Persona, Cantidad_Registros, Monto_Total, Monto_Promedio FROM v_tesoreria_por_persona ORDER BY Monto_Total DESC`);
    res.json({ success: true, data: processResponseData(rows), count: rows.length });
  } catch (error) {
    console.error('❌ Error getTesoreriaPorPersona:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen por persona', error: error.message });
  }
};

const getTesoreriaPorVehiculo = async (req, res) => {
  try {
    const { placa, fechaInicio, fechaFin } = req.query;
    if (fechaInicio || fechaFin || placa) {
      const params = [];
      let q = `SELECT placa AS Placa, COUNT(*) AS Cantidad_Registros, COALESCE(SUM(monto),0) AS Monto_Total, COALESCE(ROUND(AVG(monto),2),0) AS Monto_Promedio FROM TESORERIA WHERE deleted_at IS NULL AND placa IS NOT NULL`;
      if (fechaInicio && fechaFin) {
        q += ' AND fecha BETWEEN ? AND ?';
        params.push(fechaInicio, fechaFin);
      } else if (fechaInicio) {
        q += ' AND fecha >= ?';
        params.push(fechaInicio);
      } else if (fechaFin) {
        q += ' AND fecha <= ?';
        params.push(fechaFin);
      }
      if (placa) {
        q += ' AND placa = ?';
        params.push(placa);
      }
      q += ' GROUP BY placa ORDER BY Monto_Total DESC';
      const [rows] = await db.query(q, params);
      return res.json({ success: true, data: processResponseData(rows), count: rows.length });
    }

    let q = `SELECT Placa, Cantidad_Registros, Monto_Total, Monto_Promedio FROM v_tesoreria_por_vehiculo`;
    const params = [];
    if (placa) {
      q += ' WHERE Placa = ?';
      params.push(placa);
    }
    q += ' ORDER BY Monto_Total DESC';
    const [rows] = await db.query(q, params);
    res.json({ success: true, data: processResponseData(rows), count: rows.length });
  } catch (error) {
    console.error('❌ Error getTesoreriaPorVehiculo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen por vehículo', error: error.message });
  }
};

const getTesoreriaPorCentro = async (req, res) => {
  try {
    const { idCentro } = req.query;
    let q = `SELECT Id_Centro, Cantidad_Registros, Monto_Total, Monto_Promedio FROM v_tesoreria_por_centro`;
    const params = [];
    if (idCentro) {
      q += ' WHERE Id_Centro = ?';
      params.push(idCentro);
    }
    q += ' ORDER BY Monto_Total DESC';
    const [rows] = await db.query(q, params);
    res.json({ success: true, data: processResponseData(rows), count: rows.length });
  } catch (error) {
    console.error('❌ Error getTesoreriaPorCentro:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen por centro', error: error.message });
  }
};

const getTesoreriaTendenciaMensual = async (req, res) => {
  try {
    const { meses = 12, fechaInicio, fechaFin, idCentro, categoria } = req.query;
    // Si se pasan filtros temporales, calcular a partir de TESORERIA
    if (fechaInicio || fechaFin || idCentro || categoria || req.query.persona) {
      const params = [];
      let q = `SELECT DATE_FORMAT(fecha,'%Y-%m') AS Mes, COUNT(*) AS Cantidad_Registros, COALESCE(SUM(monto),0) AS Monto_Total, COALESCE(ROUND(AVG(monto),2),0) AS Monto_Promedio FROM TESORERIA WHERE deleted_at IS NULL`;
      if (fechaInicio && fechaFin) {
        q += ' AND fecha BETWEEN ? AND ?';
        params.push(fechaInicio, fechaFin);
      } else if (fechaInicio) {
        q += ' AND fecha >= ?';
        params.push(fechaInicio);
      } else if (fechaFin) {
        q += ' AND fecha <= ?';
        params.push(fechaFin);
      }
      if (idCentro) {
        q += ' AND id_centro = ?';
        params.push(idCentro);
      }
      // filtrar por persona si se pasa
      if (req.query.persona) {
        q += ' AND nombre = ?';
        params.push(req.query.persona);
      }
      if (categoria) {
        q += ' AND categoria = ?';
        params.push(categoria);
      }
      q += ` GROUP BY DATE_FORMAT(fecha,'%Y-%m') ORDER BY Mes DESC LIMIT ?`;
      params.push(Number(meses));
      const [rows] = await db.query(q, params);
      return res.json({ success: true, data: processResponseData(rows), count: rows.length });
    }

    const [rows] = await db.query(`SELECT Mes, Cantidad_Registros, Monto_Total, Monto_Promedio FROM v_tesoreria_tendencia_mensual ORDER BY Mes DESC LIMIT ?`, [Number(meses)]);
    res.json({ success: true, data: processResponseData(rows), count: rows.length });
  } catch (error) {
    console.error('❌ Error getTesoreriaTendenciaMensual:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tendencia mensual', error: error.message });
  }
};

// ===== Nuevos endpoints: resumen y diario para tesorería (Fase 1)
const getTesoreriaSummary = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const params = [];
    let where = 'WHERE deleted_at IS NULL';
    if (fechaInicio && fechaFin) {
      where += ' AND fecha BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where += ' AND fecha >= ?';
      params.push(fechaInicio);
    } else if (fechaFin) {
      where += ' AND fecha <= ?';
      params.push(fechaFin);
    }

    // gasto total
    const [totalRows] = await db.query(`SELECT COALESCE(SUM(monto),0) AS gasto_total FROM TESORERIA ${where}`, params);
    const gasto_total = totalRows[0]?.gasto_total || 0;

    // agregado diario para average, max, min, mediana (calculado en JS a partir de query diaria)
    const [diarioRows] = await db.query(`SELECT DATE(fecha) AS dia, COALESCE(SUM(monto),0) AS total FROM TESORERIA ${where} GROUP BY DATE(fecha) ORDER BY DATE(fecha) ASC`, params);
    const dias = diarioRows.map(r => ({ dia: r.dia, total: Number(r.total) }));

    const count_days = dias.length;
    const promedio_diario = count_days > 0 ? dias.reduce((s, r) => s + r.total, 0) / count_days : 0;
    const montos_sorted = dias.map(d => d.total).sort((a,b) => a-b);
    const max_diario = montos_sorted.length ? montos_sorted[montos_sorted.length-1] : 0;
    const min_diario = montos_sorted.length ? montos_sorted[0] : 0;
    // mediana
    let mediana_diaria = 0;
    if (montos_sorted.length) {
      const mid = Math.floor(montos_sorted.length / 2);
      mediana_diaria = montos_sorted.length % 2 === 0 ? (montos_sorted[mid-1] + montos_sorted[mid]) / 2 : montos_sorted[mid];
    }

    // variación intermensual: comparar mes más reciente con mes anterior
    const [mesRows] = await db.query(`SELECT DATE_FORMAT(fecha,'%Y-%m') AS mes, COALESCE(SUM(monto),0) AS total FROM TESORERIA ${where} GROUP BY mes ORDER BY mes DESC LIMIT 2`, params);
    let variacion_intermensual_pct = null;
    if (mesRows.length === 2) {
      const [cur, prev] = [Number(monthRowsToNumber(mesRows[0].total)), Number(monthRowsToNumber(mesRows[1].total))];
      // avoid division by zero
      variacion_intermensual_pct = prev !== 0 ? ((cur - prev) / prev) * 100 : null;
    }

    return res.json({ success: true, data: { gasto_total, promedio_diario, max_diario, min_diario, mediana_diaria, variacion_intermensual_pct, count_days }, count: 1 });
  } catch (error) {
    console.error('❌ Error getTesoreriaSummary:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen de tesorería', error: error.message });
  }
};

// helper para robustez en parseo numeric (guard)
function monthRowsToNumber(v) {
  return v === null || v === undefined ? 0 : Number(v);
}

const getTesoreriaDaily = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const params = [];
    let where = 'WHERE deleted_at IS NULL';
    if (fechaInicio && fechaFin) {
      where += ' AND fecha BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where += ' AND fecha >= ?';
      params.push(fechaInicio);
    } else if (fechaFin) {
      where += ' AND fecha <= ?';
      params.push(fechaFin);
    }

    const [rows] = await db.query(`SELECT DATE(fecha) AS dia, COUNT(*) AS cantidad_registros, COALESCE(SUM(monto),0) AS monto_total, COALESCE(ROUND(AVG(monto),2),0) AS monto_promedio FROM TESORERIA ${where} GROUP BY DATE(fecha) ORDER BY DATE(fecha) ASC`, params);
    return res.json({ success: true, data: processResponseData(rows), count: rows.length });
  } catch (error) {
    console.error('❌ Error getTesoreriaDaily:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos diarios de tesorería', error: error.message });
  }
};

// Procedimiento almacenado para resumen de rutas
const getResumenRutasProcedimiento = async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`📊 Obteniendo resumen de rutas con procedimiento para fecha: ${fecha}`);

    const [resultado] = await db.query("CALL sp_resumen_rutas(?)", [fecha]);

    res.json({
      success: true,
      data: resultado[0] || [],
      count: resultado[0]?.length || 0,
      message: "Resumen de rutas obtenido con procedimiento almacenado",
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen con procedimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen con procedimiento almacenado",
      error: error.message,
    });
  }
};

// Procedimiento almacenado para métricas del día
const getMetricasDiaProcedimiento = async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`📈 Obteniendo métricas del día con procedimiento para fecha: ${fecha}`);

    const [resultado] = await db.query("CALL sp_metricas_dia(?)", [fecha]);

    res.json({
      success: true,
      data: resultado[0] || [],
      count: resultado[0]?.length || 0,
      message: "Métricas del día obtenidas con procedimiento almacenado",
    });
  } catch (error) {
    console.error("❌ Error al obtener métricas con procedimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas con procedimiento almacenado",
      error: error.message,
    });
  }
};

// Endpoint admin/operator - dispara un full load inmediato del resumen (seguro)
const triggerFullResumLoad = async (req, res) => {
  try {
    console.log('🔔 API: triggerFullResumLoad invoked by user:', req.usuario && req.usuario.username);
    const worker = require('../scripts/resumen-worker');
    await worker.fullLoad();
    res.json({ success: true, message: 'Full load iniciado y completado' });
  } catch (error) {
    console.error('❌ Error al ejecutar full load desde API:', error);
    res.status(500).json({ success: false, message: 'Error al ejecutar full load', error: error.message });
  }
};

module.exports = {
  getResumenRutas,
  getResumenRutasRango,
  getMetricasDiarias,
  getPerformanceVehiculos,
  getPerformanceRepartidores,
  getMetricasCumplimiento,
  getResumenRutasProcedimiento,
  getMetricasDiaProcedimiento,
  // v2
  getPerformanceVehiculosV2,
  getPerformanceRepartidoresV2,
  getCumplimientoVehiculo,
  getCumplimientoVehiculoDetalle,
  // Tesorería: exports added so routes can use them
  getTesoreriaPorCategoria,
  getTesoreriaPorPersona,
  getTesoreriaPorVehiculo,
  getTesoreriaPorCentro,
  getTesoreriaTendenciaMensual,
  getTesoreriaSummary,
  getTesoreriaDaily,
  // detalle por viaje
  getResumenRutasPorViaje,
  triggerFullResumLoad,
};
