const db = require("../config/db");

// Obtener resumen de rutas por fecha
const getResumenRutas = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log(
      `📊 Obteniendo resumen de rutas para fecha: ${fecha || "todas"}`,
    );

    let query = `
      SELECT
        Fecha,
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

    res.json({
      success: true,
      data: resumen,
      count: resumen.length,
      message: "Resumen de rutas obtenido exitosamente",
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

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "fechaInicio y fechaFin son requeridos",
      });
    }

    const [resumen] = await db.query(
      `
      SELECT
        Fecha,
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

    res.json({
      success: true,
      data: resumen,
      count: resumen.length,
      message: "Resumen de rutas obtenido exitosamente",
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

    let query = `
      SELECT
        Fecha,
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

    res.json({
      success: true,
      data: metricas,
      count: metricas.length,
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

    res.json({
      success: true,
      data: resultado[0],
      count: resultado[0].length,
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

    res.json({
      success: true,
      data: resultado[0][0], // Solo un registro
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
