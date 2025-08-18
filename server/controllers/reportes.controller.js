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
      if (item.Fecha) {
        item.Fecha = formatDateForResponse(item.Fecha);
      }
      return item;
    });
  }

  if (data && typeof data === "object" && data.Fecha) {
    data.Fecha = formatDateForResponse(data.Fecha);
  }

  return data;
};

// Obtener resumen de rutas por fecha
const getResumenRutas = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(
      `📊 Obteniendo resumen de rutas para fecha: ${fecha || "todas"}`,
    );
    console.log(`🔍 Fecha recibida (tipo: ${typeof fecha}):`, fecha);

    let query = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Placa,
        Vehiculo,
        Repartidor,
        \`Nro de viajes\`,
        Zona,
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

    const params = [];

    if (fecha) {
      query += " WHERE Fecha = ?";
      params.push(fecha);
    }

    query += " ORDER BY Fecha DESC, Placa ASC";

    const [resumen] = await db.query(query, params);

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

    const [resumen] = await db.query(
      `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Placa,
        Vehiculo,
        Repartidor,
        \`Nro de viajes\`,
        Zona,
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

    console.log(`✅ Resumen obtenido: ${resumen.length} registros`);

    // Process dates to ensure consistent formatting
    const processedResumen = processResponseData(resumen);

    // Log de una muestra de los datos para debug
    if (processedResumen.length > 0) {
      console.log(`🔍 Rango - Muestra de datos obtenidos:`, {
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
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
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
      message: "Error al obtener resumen de rutas",
      error: error.message,
    });
  }
};

// Obtener métricas agregadas por día
const getMetricasDiarias = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(
      `📈 Obteniendo métricas diarias para: ${fecha || "todas las fechas"}`,
    );
    console.log(`🔍 Fecha para métricas (tipo: ${typeof fecha}):`, fecha);

    let query = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        COUNT(*) as Total_Vehiculos,
        SUM(\`Nro de viajes\`) as Total_Viajes,
        ROUND(AVG(Distancia), 2) as Distancia_Promedio,
        SUM(\`Nro de clientes\`) as Total_Clientes,
        SUM(\`Nro de pedidos\`) as Total_Pedidos,
        ROUND(SUM(\`Entrega (CF)\`), 2) as Total_Entrega_CF,
        ROUND(SUM(\`Recojo (CF)\`), 2) as Total_Recojo_CF,
        ROUND(SUM(\`Peso (Kg)\`), 2) as Total_Peso_Kg,
        ROUND(AVG(TIME_TO_SEC(Tiempo)) / 60, 0) as Tiempo_Promedio_Min
      FROM v_resumen_rutas
    `;

    const params = [];

    if (fecha) {
      query += " WHERE Fecha = ?";
      params.push(fecha);
    }

    query += " GROUP BY Fecha ORDER BY Fecha DESC";

    const [metricas] = await db.query(query, params);

    console.log(`✅ Métricas obtenidas: ${metricas.length} días`);

    // Process dates to ensure consistent formatting
    const processedMetricas = processResponseData(metricas);

    // Log de métricas para debug
    if (processedMetricas.length > 0) {
      console.log(`🔍 Métricas obtenidas:`, {
        fechas: processedMetricas.map((m) => m.Fecha),
        totalDias: processedMetricas.length,
      });
    }

    res.json({
      success: true,
      data: processedMetricas,
      count: processedMetricas.length,
      message: "Métricas diarias obtenidas exitosamente",
      debug: {
        fechaConsultada: fecha,
        diasEncontrados: processedMetricas.length,
      },
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

// Obtener performance por vehículo
const getPerformanceVehiculos = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    console.log(
      `🚛 Obteniendo performance de vehículos (últimos ${dias} días)`,
    );

    const [performance] = await db.query(
      `
      SELECT
        Placa,
        Vehiculo,
        COUNT(DISTINCT Fecha) as Dias_Trabajados,
        ROUND(AVG(\`Nro de viajes\`), 1) as Promedio_Viajes_Dia,
        ROUND(AVG(Distancia), 2) as Distancia_Promedio,
        ROUND(AVG(\`Nro de clientes\`), 1) as Clientes_Promedio,
        ROUND(SUM(\`Peso (Kg)\`), 2) as Total_Peso_Transportado,
        ROUND(SUM(\`Entrega (CF)\`), 2) as Total_Entrega_CF,
        ROUND(SUM(\`Recojo (CF)\`), 2) as Total_Recojo_CF
      FROM v_resumen_rutas
      WHERE Fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY Placa, Vehiculo
      ORDER BY Total_Peso_Transportado DESC
    `,
      [dias],
    );

    console.log(`✅ Performance obtenida: ${performance.length} vehículos`);

    res.json({
      success: true,
      data: performance,
      count: performance.length,
      message: "Performance de vehículos obtenida exitosamente",
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

// Obtener performance por repartidor
const getPerformanceRepartidores = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    console.log(
      `👤 Obteniendo performance de repartidores (últimos ${dias} días)`,
    );

    const [performance] = await db.query(
      `
      SELECT
        Repartidor,
        COUNT(DISTINCT Fecha) as Dias_Trabajados,
        COUNT(DISTINCT Placa) as Vehiculos_Utilizados,
        ROUND(AVG(Distancia), 2) as Distancia_Promedio,
        ROUND(AVG(\`Nro de clientes\`), 1) as Clientes_Promedio,
        ROUND(SUM(\`Entrega (CF)\`), 2) as Total_Entrega_CF,
        ROUND(SUM(\`Recojo (CF)\`), 2) as Total_Recojo_CF,
        ROUND(SUM(\`Peso (Kg)\`), 2) as Total_Peso_Transportado
      FROM v_resumen_rutas
      WHERE Fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY Repartidor
      ORDER BY Total_Entrega_CF DESC
    `,
      [dias],
    );

    console.log(`✅ Performance obtenida: ${performance.length} repartidores`);

    res.json({
      success: true,
      data: performance,
      count: performance.length,
      message: "Performance de repartidores obtenida exitosamente",
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

// Obtener métricas de cumplimiento
const getMetricasCumplimiento = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(
      `📊 Calculando métricas de cumplimiento para: ${fecha || "hoy"}`,
    );

    const fechaConsulta = fecha || new Date().toISOString().split("T")[0];
    console.log(
      `🔍 Fecha para cumplimiento - Original: ${fecha}, Consulta: ${fechaConsulta}`,
    );

    // Obtener datos base para calcular métricas
    const [datosBase] = await db.query(
      `
      SELECT
        COUNT(*) as total_vehiculos,
        SUM(\`Nro de viajes\`) as total_viajes,
        AVG(Distancia) as distancia_promedio,
        SUM(\`Nro de clientes\`) as total_clientes,
        SUM(\`Nro de pedidos\`) as total_pedidos,
        SUM(\`Entrega (CF)\`) as total_entrega_cf,
        SUM(\`Recojo (CF)\`) as total_recojo_cf,
        SUM(\`Peso (Kg)\`) as total_peso_kg
      FROM v_resumen_rutas
      WHERE Fecha = ?
    `,
      [fechaConsulta],
    );

    // Calcular utilización de flota (vehículos activos vs total de vehículos activos)
    const [totalVehiculos] = await db.query(
      "SELECT COUNT(*) as total FROM VEHICULO WHERE activo = TRUE",
    );
    const vehiculosUtilizados = datosBase[0].total_vehiculos;
    const utilizacionFlota =
      totalVehiculos[0].total > 0
        ? (vehiculosUtilizados / totalVehiculos[0].total) * 100
        : 0;

    // Calcular eficiencia de rutas (km por cliente)
    const eficienciaRuta =
      datosBase[0].total_clientes > 0
        ? datosBase[0].distancia_promedio / datosBase[0].total_clientes
        : 0;

    // Calcular cumplimiento temporal (viajes con horarios completos)
    const [viajesCompletos] = await db.query(
      `
      SELECT COUNT(*) as viajes_completos
      FROM v_resumen_rutas
      WHERE Fecha = ?
        AND \`Salida del CD\` IS NOT NULL
        AND \`Llegada al CD\` IS NOT NULL
    `,
      [fechaConsulta],
    );
    const cumplimientoTemporal =
      datosBase[0].total_viajes > 0
        ? (viajesCompletos[0].viajes_completos / datosBase[0].total_viajes) *
          100
        : 0;

    // Calcular productividad por vehículo
    const productividadCF =
      vehiculosUtilizados > 0
        ? datosBase[0].total_entrega_cf / vehiculosUtilizados
        : 0;

    const productividadClientes =
      vehiculosUtilizados > 0
        ? datosBase[0].total_clientes / vehiculosUtilizados
        : 0;

    const productividadPeso =
      vehiculosUtilizados > 0
        ? datosBase[0].total_peso_kg / vehiculosUtilizados
        : 0;

    const metricas = {
      fecha: fechaConsulta,
      cumplimiento_temporal: {
        meta: 90,
        real: Math.round(cumplimientoTemporal * 100) / 100,
        porcentaje: Math.round((cumplimientoTemporal / 90) * 100 * 100) / 100,
      },
      utilizacion_flota: {
        meta: 75,
        real: Math.round(utilizacionFlota * 100) / 100,
        porcentaje: Math.round((utilizacionFlota / 75) * 100 * 100) / 100,
      },
      eficiencia_ruta: {
        meta: 10,
        real: Math.round(eficienciaRuta * 100) / 100,
        porcentaje:
          eficienciaRuta > 0
            ? Math.round((10 / eficienciaRuta) * 100 * 100) / 100
            : 0,
      },
      productividad: {
        cf_por_vehiculo: Math.round(productividadCF * 100) / 100,
        clientes_por_vehiculo: Math.round(productividadClientes * 100) / 100,
        peso_por_vehiculo: Math.round(productividadPeso * 100) / 100,
        meta_cf: 40,
        porcentaje_cf: Math.round((productividadCF / 40) * 100 * 100) / 100,
      },
      resumen: {
        ...datosBase[0],
        vehiculos_utilizados: vehiculosUtilizados,
        total_vehiculos_activos: totalVehiculos[0].total,
        viajes_completos: viajesCompletos[0].viajes_completos,
      },
    };

    console.log(`✅ Métricas de cumplimiento calculadas`);

    res.json({
      success: true,
      data: metricas,
      message: "Métricas de cumplimiento calculadas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al calcular métricas de cumplimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al calcular métricas de cumplimiento",
      error: error.message,
    });
  }
};

// Llamar procedimiento almacenado para resumen por fecha
const getResumenRutasProcedimiento = async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(
      `📋 Ejecutando procedimiento sp_resumen_rutas_fecha para: ${fecha}`,
    );

    const [resultado] = await db.query("CALL sp_resumen_rutas_fecha(?)", [
      fecha,
    ]);

    console.log(`✅ Procedimiento ejecutado: ${resultado[0].length} registros`);

    // Process dates to ensure consistent formatting
    const processedData = processResponseData(resultado[0]);

    res.json({
      success: true,
      data: processedData,
      count: processedData.length,
      message: "Resumen obtenido mediante procedimiento almacenado",
    });
  } catch (error) {
    console.error("❌ Error al ejecutar procedimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al ejecutar procedimiento almacenado",
      error: error.message,
    });
  }
};

// Llamar procedimiento almacenado para métricas del día
const getMetricasDiaProcedimiento = async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`📈 Ejecutando procedimiento sp_metricas_dia para: ${fecha}`);

    const [resultado] = await db.query("CALL sp_metricas_dia(?)", [fecha]);

    console.log(`✅ Procedimiento ejecutado exitosamente`);

    // Process dates to ensure consistent formatting
    const processedData = processResponseData(resultado[0][0]);

    res.json({
      success: true,
      data: processedData, // Solo un registro
      message: "Métricas obtenidas mediante procedimiento almacenado",
    });
  } catch (error) {
    console.error("❌ Error al ejecutar procedimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al ejecutar procedimiento almacenado",
      error: error.message,
    });
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
};
