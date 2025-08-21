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

// Cumplimiento de Ventana Horaria por Visita
const getCumplimientoVHVisitas = async (req, res) => {
  try {
    const { fecha, fechaInicio, fechaFin, placa, cliente } = req.query;
    console.log(
      `🕒 Cumplimiento VH Visitas - fecha: ${fecha || '-'} rango: ${fechaInicio || '-'} a ${fechaFin || '-'} placa: ${placa || '-'} cliente: ${cliente || '-'}`,
    );

    let query = `
      SELECT
        DATE_FORMAT(v.fecha, '%Y-%m-%d') AS Fecha,
        ve.placa AS Placa,
        c.codigo AS Codigo_Cliente,
        c.nombre AS Cliente,
        vis.ventana_ini AS OpenDT,
        vis.ventana_fin AS CloseDT,
        vis.hora_llegada AS ArriveDT,
        vis.hora_salida AS LeaveDT,
        -- IDR minutos (0 si dentro, negativo si temprano, positivo si tarde)
        CASE
          WHEN vis.ventana_ini IS NULL OR vis.ventana_fin IS NULL OR vis.hora_llegada IS NULL THEN NULL
          WHEN vis.hora_llegada < vis.ventana_ini THEN -TIMESTAMPDIFF(MINUTE, vis.hora_llegada, vis.ventana_ini)
          WHEN vis.hora_llegada > vis.ventana_fin THEN TIMESTAMPDIFF(MINUTE, vis.ventana_fin, vis.hora_llegada)
          ELSE 0
        END AS IDR_Min,
        CASE
          WHEN vis.ventana_ini IS NULL OR vis.ventana_fin IS NULL OR vis.hora_llegada IS NULL THEN NULL
          WHEN vis.hora_llegada < vis.ventana_ini OR vis.hora_llegada > vis.ventana_fin THEN 1
          ELSE 0
        END AS Fuera_VH
      FROM VISITA vis
      JOIN VIAJE v ON v.id_viaje = vis.id_viaje
      JOIN VEHICULO ve ON ve.id_vehiculo = v.id_vehiculo
      JOIN CLIENTE c ON c.id_cliente = vis.id_cliente
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
    if (cliente) {
      // filtrar por código de cliente o parte del nombre
      where.push('(c.codigo = ? OR c.nombre LIKE ?)');
      params.push(cliente, `%${cliente}%`);
    }
    if (where.length) query += ' WHERE ' + where.join(' AND ');

    query += ' ORDER BY v.fecha DESC, ve.placa ASC, c.codigo ASC';

    const [rows] = await db.query(query, params);

    // Formatear fechas de cabecera y devolver
    const processed = rows.map((r) => ({
      ...r,
      Fecha: formatDateForResponse(r.Fecha),
    }));

    res.json({ success: true, data: processed, count: processed.length });
  } catch (error) {
    console.error('❌ Error cumplimiento VH visitas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cumplimiento de ventana horaria por visita', error: error.message });
  }
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
    if (!vehRows.length) {
      return res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }
    const vehiculo = vehRows[0];

    // Documentos con estado y días para vencer
    const [docs] = await db.query(
      `SELECT 
        vd.tipo,
        vd.numero,
        vd.emision,
        vd.vencimiento,
        vd.proveedor,
        vd.archivo_url,
        DATEDIFF(vd.vencimiento, CURRENT_DATE) AS Dias_para_vencer,
        CASE 
          WHEN vd.vencimiento IS NULL THEN 'SIN_FECHA'
          WHEN vd.vencimiento < CURRENT_DATE THEN 'VENCIDO'
          WHEN DATEDIFF(vd.vencimiento, CURRENT_DATE) <= ? THEN 'POR_VENCER'
          ELSE 'VIGENTE'
        END AS Estado
      FROM VEHICULO_DOCUMENTO vd
      WHERE vd.id_vehiculo = ?
      ORDER BY vd.tipo`,
      [Number(umbralDias), vehiculo.id_vehiculo]
    );

    // Último mantenimiento y cálculos
    const [mant] = await db.query(
      `SELECT 
        m.fecha AS Ult_Mant_Fecha,
        m.odometro_km AS Ult_Mant_Odo
      FROM MANTENIMIENTO m
      WHERE m.id_vehiculo = ?
      ORDER BY m.fecha DESC
      LIMIT 1`,
      [vehiculo.id_vehiculo]
    );

    const [cfg] = await db.query(
      `SELECT mantenimiento_km_intervalo AS Intervalo_KM, mantenimiento_dias_intervalo AS Intervalo_Dias
       FROM VEHICULO_CONFIG WHERE id_vehiculo = ?`,
      [vehiculo.id_vehiculo]
    );

    const [odo] = await db.query(
      `SELECT MAX(v.odometro_fin) AS Ult_Odo_Registrado FROM VIAJE v WHERE v.id_vehiculo = ?`,
      [vehiculo.id_vehiculo]
    );

    const maint = {
      Ult_Mant_Fecha: mant.length ? mant[0].Ult_Mant_Fecha : null,
      Ult_Mant_Odo: mant.length ? mant[0].Ult_Mant_Odo : null,
      Ult_Odo_Registrado: odo[0].Ult_Odo_Registrado || null,
      Intervalo_KM: cfg.length ? cfg[0].Intervalo_KM : null,
      Intervalo_Dias: cfg.length ? cfg[0].Intervalo_Dias : null,
    };

    // Derivados de mantenimiento
    const diasDesdeUlt = maint.Ult_Mant_Fecha ? Math.floor((new Date().setHours(0,0,0,0) - new Date(maint.Ult_Mant_Fecha).setHours(0,0,0,0)) / (1000*60*60*24)) : null;
    const kmDesdeUlt = (maint.Ult_Odo_Registrado != null && maint.Ult_Mant_Odo != null) ? (maint.Ult_Odo_Registrado - maint.Ult_Mant_Odo) : null;
    const kmParaProx = (maint.Intervalo_KM != null && kmDesdeUlt != null) ? (maint.Intervalo_KM - kmDesdeUlt) : null;
    const diasParaProx = (maint.Intervalo_Dias != null && diasDesdeUlt != null) ? (maint.Intervalo_Dias - diasDesdeUlt) : null;

    const mantenimiento = {
      ...maint,
      Dias_desde_ult_mant: diasDesdeUlt,
      Km_desde_ult_mant: kmDesdeUlt,
      Km_para_prox_mant: kmParaProx,
      Dias_para_prox_mant: diasParaProx,
      Overdue_KM: kmParaProx != null ? kmParaProx < 0 : null,
      Overdue_Dias: diasParaProx != null ? diasParaProx < 0 : null,
    };

    res.json({ success: true, data: { vehiculo, documentos: docs, mantenimiento, umbralDias: Number(umbralDias) } });
  } catch (error) {
    console.error('❌ Error [v2] cumplimiento detalle:', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalle de cumplimiento', error: error.message });
  }
};

// Resumen de Rutas por Viaje (detalle por cada viaje)
const getResumenRutasPorViaje = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, fecha, placa, repartidor } = req.query;
    console.log(
      `🧭 Resumen de Rutas por Viaje - fecha: ${fecha || '-'} rango: ${fechaInicio || '-'} a ${fechaFin || '-'} placa: ${placa || '-'} repartidor: ${repartidor || '-'}`,
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
        COALESCE(COUNT(DISTINCT vis.id_cliente), 0) AS Nro_clientes,
        GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR '; ') AS Clientes,
        COALESCE(SUM(vis.pedidos), 0) AS Nro_pedidos,
        COALESCE(SUM(vis.entrega_cf), 0) AS Entrega_CF,
        COALESCE(SUM(vis.recojo_cf), 0) AS Recojo_CF,
        COALESCE(SUM(vis.peso_kg), 0) AS Peso_Kg,
        ve.capacidad_kg AS Capac_Kg,
        CASE WHEN ve.capacidad_kg IS NOT NULL AND ve.capacidad_kg > 0 THEN ROUND((COALESCE(SUM(vis.peso_kg),0) / ve.capacidad_kg) * 100, 1) ELSE NULL END AS Porc_Capacidad_Kg,
        COALESCE(SUM(vis.peso_kg), 0) AS Uso_Kg,
        ve.capacidad_cajas AS Capac_Cajas,
        CASE WHEN ve.capacidad_cajas IS NOT NULL AND ve.capacidad_cajas > 0 THEN ROUND((COALESCE(SUM(vis.entrega_cf),0) / ve.capacidad_cajas) * 100, 1) ELSE NULL END AS Porc_Capacidad_Cajas,
        COALESCE(SUM(vis.entrega_cf), 0) AS Uso_Cajas,
        COALESCE(v.distancia_km, 0) AS Distancia_recorrida,
        v.salida_cd AS Salida_del_CD,
        v.llegada_cd AS Llegada_al_CD,
        CASE WHEN v.salida_cd IS NOT NULL AND v.llegada_cd IS NOT NULL THEN TIMEDIFF(v.llegada_cd, v.salida_cd) ELSE NULL END AS Tiempo_de_Viaje,
        v.tiempo_manejo_min AS Tiempo_Manejo_Min,
        v.tiempo_servicio_min AS Tiempo_Servicio_Min,
        v.recarga_min AS Recarga_Min,
        v.refrigerio_min AS Refrigerio_Min,
        v.tipo_viaje AS Tipo_Viaje
      FROM VIAJE v
      JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
      JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN VISITA vis ON vis.id_viaje = v.id_viaje
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
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
        v.tiempo_manejo_min,
        v.tiempo_servicio_min,
        v.recarga_min,
        v.refrigerio_min,
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
    console.log(
      `🚛[v2] Performance vehículos - rango: ${fechaInicio || 'inicio'} a ${fechaFin || 'fin'} placa: ${placa || 'todas'}`,
    );

    let query = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Placa,
        Vehiculo,
        Nro_viajes,
        Km,
        Litros,
        Km_por_Litro,
        Costo_por_Km,
        Pedidos,
        PesoKg,
        Utilizacion_Prom,
        Min_Manejo,
        Min_Servicio,
        Min_Espera,
        Paradas_No_Plan,
        Incidencias,
        Costo_Incidencias
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
    const { fechaInicio, fechaFin, repartidor } = req.query; // repartidor = texto "CODIGO - NOMBRE" opcional
    console.log(
      `👤[v2] Performance repartidores - rango: ${fechaInicio || 'inicio'} a ${fechaFin || 'fin'} filtro: ${repartidor || 'todos'}`,
    );

    let query = `
      SELECT
        DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha,
        Repartidor,
        Nro_viajes,
        Km,
        Pedidos,
        Pedidos_Entregados,
        Tasa_Entrega,
        Visitas_Puntuales,
        Visitas,
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
    res.status(500).json({ success: false, message: 'Error al obtener cumplimiento de vehículo', error: error.message });
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
  // v2
  getPerformanceVehiculosV2,
  getPerformanceRepartidoresV2,
  getCumplimientoVehiculo,
  getCumplimientoVehiculoDetalle,
  getCumplimientoVHVisitas,
  // detalle por viaje
  getResumenRutasPorViaje,
};
