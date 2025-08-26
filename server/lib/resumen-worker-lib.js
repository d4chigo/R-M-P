const pool = require('../config/db');

async function fullLoad(logger = console) {
  logger.log('🔁 Ejecutando full load (lib) para resumen_rutas...');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if resumen_rutas table exists. If not, skip the full load.
    const [tbl] = await conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'resumen_rutas'");
    if (!tbl || tbl.length === 0) {
      logger.log('⚠️ Tabla resumen_rutas no existe. Full load omitido.');
      await conn.commit();
      return { skipped: true };
    }

    await conn.query('DELETE FROM resumen_rutas');

    const [rows] = await conn.query(`
      SELECT
        v.fecha AS fecha,
        ve.placa AS placa,
        CONCAT(ve.marca, ' ', ve.modelo) AS vehiculo,
        CONCAT(r.codigo, ' - ', r.nombre) AS repartidor,
        COUNT(DISTINCT v.id_viaje) AS nro_viajes,
        COALESCE(SUM(v.territorios_visitados),0) AS territorios,
        COALESCE(SUM(v.distancia_km),0) AS distancia_km,
        MIN(v.salida_cd) AS salida_cd,
        MAX(v.llegada_cd) AS llegada_cd,
        CASE
          WHEN MIN(v.salida_cd) IS NOT NULL AND MAX(v.llegada_cd) IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, MIN(v.salida_cd), MAX(v.llegada_cd))
          ELSE NULL
        END AS tiempo_min,
        COALESCE(SUM(v.nro_clientes),0) AS nro_clientes,
        COALESCE(SUM(v.nro_pedidos),0) AS nro_pedidos,
        COALESCE(SUM(v.entrega_cf),0) AS entrega_cf,
        COALESCE(SUM(v.recojo_cf),0) AS recojo_cf,
        COALESCE(SUM(v.peso_kg),0) AS peso_kg
      FROM VIAJE v
      JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
      JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      GROUP BY v.fecha, ve.id_vehiculo, ve.placa, ve.marca, ve.modelo, r.id_repartidor, r.codigo, r.nombre
    `);

    const insertSql = `INSERT INTO resumen_rutas
      (fecha, placa, vehiculo, repartidor, nro_viajes, territorios, distancia_km, salida_cd, llegada_cd, tiempo_min, nro_clientes, nro_pedidos, entrega_cf, recojo_cf, peso_kg)
      VALUES ?`;

    const values = rows.map(r => [
      r.fecha,
      r.placa || r.Placa,
      r.vehiculo || r.Vehiculo,
      r.repartidor || r.Repartidor,
      r.nro_viajes || r['Nro de viajes'],
      r.territorios || r.Territorios,
      r.distancia_km || r.Distancia,
      r.salida_cd || r['Salida del CD'],
      r.llegada_cd || r['Llegada al CD'],
      r.tiempo_min || r.Tiempo,
      r.nro_clientes || r['Nro de clientes'],
      r.nro_pedidos || r['Nro de pedidos'],
      r.entrega_cf || r['Entrega (CF)'],
      r.recojo_cf || r['Recojo (CF)'],
      r.peso_kg || r['Peso (Kg)']
    ]);

    if (values.length) {
      await conn.query(insertSql, [values]);
    }

    await conn.commit();
    logger.log('✅ Full load (lib) completado. Filas insertadas:', values.length);
    return { inserted: values.length };
  } catch (err) {
    await conn.rollback();
    logger.error('❌ Error en fullLoad (lib):', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

async function deltaLoad(logger = console) {
  logger.log('🔁 Ejecutando delta load (lib) para resumen_rutas...');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS resumen_state (
        id INT PRIMARY KEY DEFAULT 1,
        last_run TIMESTAMP NULL
      )
    `);

    const [stateRows] = await conn.query(`SELECT last_run FROM resumen_state WHERE id = 1`);
    let lastRun = null;
    if (stateRows.length && stateRows[0].last_run) lastRun = stateRows[0].last_run;

    const params = [];
    let where = '';
    if (lastRun) {
      where = 'WHERE v.updated_at > ?';
      params.push(lastRun);
    }

    const [tbl] = await conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'resumen_rutas'");
    if (!tbl || tbl.length === 0) {
      logger.log('⚠️ Tabla resumen_rutas no existe. Delta load omitido.');
      await conn.commit();
      return { skipped: true };
    }

    const [rows] = await conn.query(`
      SELECT
        v.fecha AS fecha,
        ve.placa AS placa,
        CONCAT(ve.marca, ' ', ve.modelo) AS vehiculo,
        CONCAT(r.codigo, ' - ', r.nombre) AS repartidor,
        COUNT(DISTINCT v.id_viaje) AS nro_viajes,
        COALESCE(SUM(v.territorios_visitados),0) AS territorios,
        COALESCE(SUM(v.distancia_km),0) AS distancia_km,
        MIN(v.salida_cd) AS salida_cd,
        MAX(v.llegada_cd) AS llegada_cd,
        CASE
          WHEN MIN(v.salida_cd) IS NOT NULL AND MAX(v.llegada_cd) IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, MIN(v.salida_cd), MAX(v.llegada_cd))
          ELSE NULL
        END AS tiempo_min,
        COALESCE(SUM(v.nro_clientes),0) AS nro_clientes,
        COALESCE(SUM(v.nro_pedidos),0) AS nro_pedidos,
        COALESCE(SUM(v.entrega_cf),0) AS entrega_cf,
        COALESCE(SUM(v.recojo_cf),0) AS recojo_cf,
        COALESCE(SUM(v.peso_kg),0) AS peso_kg
      FROM VIAJE v
      JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
      JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      ${where}
      GROUP BY v.fecha, ve.id_vehiculo, ve.placa, ve.marca, ve.modelo, r.id_repartidor, r.codigo, r.nombre
    `, params);

    for (const r of rows) {
      const upsertSql = `
        INSERT INTO resumen_rutas (fecha, placa, vehiculo, repartidor, nro_viajes, territorios, distancia_km, salida_cd, llegada_cd, tiempo_min, nro_clientes, nro_pedidos, entrega_cf, recojo_cf, peso_kg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          vehiculo = VALUES(vehiculo),
          repartidor = VALUES(repartidor),
          nro_viajes = VALUES(nro_viajes),
          territorios = VALUES(territorios),
          distancia_km = VALUES(distancia_km),
          salida_cd = VALUES(salida_cd),
          llegada_cd = VALUES(llegada_cd),
          tiempo_min = VALUES(tiempo_min),
          nro_clientes = VALUES(nro_clientes),
          nro_pedidos = VALUES(nro_pedidos),
          entrega_cf = VALUES(entrega_cf),
          recojo_cf = VALUES(recojo_cf),
          peso_kg = VALUES(peso_kg),
          updated_at = CURRENT_TIMESTAMP
      `;

      const paramsUpsert = [
        r.fecha,
        r.placa,
        r.vehiculo,
        r.repartidor,
        r.nro_viajes,
        r.territorios,
        r.distancia_km,
        r.salida_cd,
        r.llegada_cd,
        r.tiempo_min,
        r.nro_clientes,
        r.nro_pedidos,
        r.entrega_cf,
        r.recojo_cf,
        r.peso_kg
      ];

      await conn.query(upsertSql, paramsUpsert);
    }

    await conn.query(`INSERT INTO resumen_state (id, last_run) VALUES (1, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE last_run = CURRENT_TIMESTAMP`);
    await conn.commit();
    logger.log('✅ Delta load (lib) completado. Filas procesadas:', rows.length);
    return { processed: rows.length };
  } catch (err) {
    await conn.rollback();
    logger.error('❌ Error en deltaLoad (lib):', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { fullLoad, deltaLoad };
