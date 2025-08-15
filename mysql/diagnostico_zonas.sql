-- ==============================
-- DIAGNÓSTICO DE ZONAS EN VIAJES
-- ==============================
-- Este script ayuda a identificar por qué algunos viajes muestran Zona = 0
-- en el resumen de rutas

-- 1. VERIFICAR VIAJES CON ZONA = 0
SELECT
    'Viajes con Zona = 0' AS diagnostico,
    v.id_viaje,
    v.fecha,
    ve.placa,
    CONCAT(r.codigo, ' - ', r.nombre) AS repartidor,
    COUNT(vis.id_visita) AS total_visitas,
    COUNT(DISTINCT c.id_zona) AS zonas_distintas,
    GROUP_CONCAT(DISTINCT c.id_zona) AS zonas_ids,
    GROUP_CONCAT(DISTINCT z.descripcion) AS zonas_nombres
FROM VIAJE v
JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
LEFT JOIN VISITA vis ON v.id_viaje = vis.id_viaje
LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
LEFT JOIN ZONA z ON c.id_zona = z.id_zona
GROUP BY v.id_viaje, v.fecha, ve.placa, r.codigo, r.nombre
HAVING COUNT(DISTINCT c.id_zona) = 0
ORDER BY v.fecha DESC
LIMIT 10;

-- 2. DETALLAR VISITAS DE UN VIAJE ESPECÍFICO (cambiar el ID según necesites)
SELECT
    'Detalle de visitas para viaje específico' AS diagnostico,
    v.id_viaje,
    v.fecha,
    ve.placa,
    vis.id_visita,
    vis.id_cliente,
    c.codigo AS codigo_cliente,
    c.nombre AS nombre_cliente,
    c.id_zona,
    z.descripcion AS zona_descripcion,
    CASE
        WHEN vis.id_visita IS NULL THEN 'NO HAY VISITAS'
        WHEN vis.id_cliente IS NULL THEN 'VISITA SIN CLIENTE'
        WHEN c.id_cliente IS NULL THEN 'CLIENTE NO EXISTE'
        WHEN c.id_zona IS NULL THEN 'CLIENTE SIN ZONA'
        WHEN z.id_zona IS NULL THEN 'ZONA NO EXISTE'
        ELSE 'OK'
    END AS estado
FROM VIAJE v
JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
LEFT JOIN VISITA vis ON v.id_viaje = vis.id_viaje
LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
LEFT JOIN ZONA z ON c.id_zona = z.id_zona
WHERE v.fecha = '2024-01-18'  -- Cambiar por la fecha que necesites revisar
  AND ve.placa = 'CHI-789'    -- Cambiar por la placa que necesites revisar
ORDER BY vis.id_visita;

-- 3. RESUMEN GENERAL DE PROBLEMAS
SELECT
    'Resumen de problemas' AS diagnostico,
    SUM(CASE WHEN total_visitas = 0 THEN 1 ELSE 0 END) AS viajes_sin_visitas,
    SUM(CASE WHEN total_visitas > 0 AND zonas_distintas = 0 THEN 1 ELSE 0 END) AS viajes_con_visitas_sin_zona,
    SUM(CASE WHEN zonas_distintas > 0 THEN 1 ELSE 0 END) AS viajes_con_zonas,
    COUNT(*) AS total_viajes
FROM (
    SELECT
        v.id_viaje,
        COUNT(vis.id_visita) AS total_visitas,
        COUNT(DISTINCT c.id_zona) AS zonas_distintas
    FROM VIAJE v
    LEFT JOIN VISITA vis ON v.id_viaje = vis.id_viaje
    LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
    GROUP BY v.id_viaje
) AS subquery;

-- 4. VERIFICAR INTEGRIDAD DE DATOS
SELECT
    'Verificación de integridad' AS diagnostico,
    'Visitas sin cliente' AS problema,
    COUNT(*) AS cantidad
FROM VISITA vis
LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
WHERE c.id_cliente IS NULL

UNION ALL

SELECT
    'Verificación de integridad' AS diagnostico,
    'Clientes sin zona' AS problema,
    COUNT(*) AS cantidad
FROM CLIENTE c
WHERE c.id_zona IS NULL

UNION ALL

SELECT
    'Verificación de integridad' AS diagnostico,
    'Zonas huérfanas' AS problema,
    COUNT(*) AS cantidad
FROM ZONA z
LEFT JOIN CLIENTE c ON z.id_zona = c.id_zona
WHERE c.id_zona IS NULL;

-- 5. PROPUESTA DE CONSULTA MEJORADA PARA LA VISTA
-- Esta consulta maneja mejor los casos donde no hay visitas
SELECT
    'Vista mejorada sugerida' AS diagnostico,
    v.fecha AS Fecha,
    ve.placa AS Placa,
    CONCAT(ve.marca, ' ', ve.modelo) AS Vehiculo,
    CONCAT(r.codigo, ' - ', r.nombre) AS Repartidor,
    COUNT(DISTINCT v.id_viaje) AS `Nro de viajes`,
    CASE
        WHEN COUNT(vis.id_visita) = 0 THEN NULL  -- Si no hay visitas, mostrar NULL en lugar de 0
        ELSE COUNT(DISTINCT c.id_zona)
    END AS Territorio,
    COALESCE(SUM(v.distancia_km), 0) AS Distancia,
    MIN(v.salida_cd) AS `Salida del CD`,
    MAX(v.llegada_cd) AS `Llegada al CD`,
    CASE
        WHEN MIN(v.salida_cd) IS NOT NULL AND MAX(v.llegada_cd) IS NOT NULL
        THEN TIMEDIFF(MAX(v.llegada_cd), MIN(v.salida_cd))
        ELSE NULL
    END AS Tiempo,
    COUNT(DISTINCT vis.id_cliente) AS `Nro de clientes`,
    COALESCE(SUM(vis.pedidos), 0) AS `Nro de pedidos`,
    COALESCE(SUM(vis.entrega_cf), 0) AS `Entrega (CF)`,
    COALESCE(SUM(vis.recojo_cf), 0) AS `Recojo (CF)`,
    COALESCE(SUM(vis.peso_kg), 0) AS `Peso (Kg)`
FROM VIAJE v
JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
LEFT JOIN VISITA vis ON v.id_viaje = vis.id_viaje
LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
LEFT JOIN ZONA z ON c.id_zona = z.id_zona
GROUP BY
    v.fecha,
    ve.id_vehiculo,
    r.id_repartidor
ORDER BY v.fecha DESC, ve.placa
LIMIT 5;
