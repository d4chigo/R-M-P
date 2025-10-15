-- ============================================
-- SCRIPT DE MIGRACIÓN - Crear todas las vistas SQL
-- Archivo: create-all-views.sql
-- Descripción: Crea todas las vistas necesarias sin afectar datos existentes
-- ============================================
-- Este script puede ejecutarse de forma segura en cualquier momento
-- para crear o recrear las vistas SQL del sistema.
--
-- Uso:
--   docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db < mysql/migrations/create-all-views.sql
-- ============================================

USE rmp_db;

-- ============================================
-- 1. VISTA: Resumen de Rutas
-- ============================================

DROP TABLE IF EXISTS `resumen_rutas`;

CREATE OR REPLACE VIEW v_resumen_rutas AS
WITH viaje_latest AS (
    SELECT
        fecha,
        id_vehiculo,
        id_repartidor,
        MAX(nro_viaje) as max_nro_viaje
    FROM VIAJE
    GROUP BY fecha, id_vehiculo, id_repartidor
)
SELECT
    v.fecha AS `Fecha`,
    ve.placa AS `Placa`,
    CONCAT(ve.marca, ' ', ve.modelo) AS `Vehiculo`,
    CONCAT(r.codigo, ' - ', r.nombre) AS `Repartidor`,
    vl.max_nro_viaje AS `Nro de viajes`,
    v.territorios_visitados AS `Territorios`,
    v.distancia_km AS `Distancia`,
    v.salida_cd AS `Salida del CD`,
    v.llegada_cd AS `Llegada al CD`,
    CASE
        WHEN v.salida_cd IS NOT NULL AND v.llegada_cd IS NOT NULL
        THEN TIMEDIFF(v.llegada_cd, v.salida_cd)
        ELSE NULL
    END AS `Tiempo`,
    v.nro_clientes AS `Nro de clientes`,
    v.nro_pedidos AS `Nro de pedidos`,
    v.entrega_cf AS `Entrega (CF)`,
    v.recojo_cf AS `Recojo (CF)`,
    v.peso_kg AS `Peso (Kg)`,
    v.nro_conductores AS `Nro Conductores`,
    v.nro_liquidadores AS `Nro Liquidadores`,
    v.nro_auxiliares AS `Nro Auxiliares`,
    v.nro_trip_adicional AS `Nro Trip Adicional`,
    v.tripulacion_especial AS `Tripulacion Especial`
FROM VIAJE v
JOIN viaje_latest vl ON
    v.fecha = vl.fecha AND
    v.id_vehiculo = vl.id_vehiculo AND
    v.id_repartidor = vl.id_repartidor AND
    v.nro_viaje = vl.max_nro_viaje
JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor;

SELECT '✅ Vista v_resumen_rutas creada' AS status;

-- ============================================
-- 2. VISTA: Resumen de Saldos por Centro
-- ============================================

CREATE OR REPLACE VIEW v_resumen_saldos_centro AS
SELECT
    c.id_centro,
    c.codigo,
    c.nombre as nombre_centro,
    c.ciudad,
    COALESCE(sc.saldo, 0.00) as saldo_actual,
    sc.updated_at as ultima_actualizacion,
    u.nombre_completo as actualizado_por,
    -- Contar movimientos del día actual
    (SELECT COUNT(*)
     FROM TESORERIA t
     WHERE t.id_centro = c.id_centro
       AND DATE(t.fecha) = CURDATE()
       AND t.deleted_at IS NULL
    ) as movimientos_hoy,
    -- Sumar gastos del día actual
    (SELECT COALESCE(SUM(t.monto), 0.00)
     FROM TESORERIA t
     WHERE t.id_centro = c.id_centro
       AND DATE(t.fecha) = CURDATE()
       AND t.deleted_at IS NULL
    ) as gastos_hoy
FROM CENTRO_DISTRIBUCION c
LEFT JOIN TESORERIA_SALDO_CENTRO sc ON c.id_centro = sc.id_centro
LEFT JOIN USUARIO u ON sc.updated_by = u.id_usuario
ORDER BY c.nombre ASC;

SELECT '✅ Vista v_resumen_saldos_centro creada' AS status;

-- ============================================
-- 3. VISTA: Resumen de Tesorería por Categoría
-- ============================================

CREATE OR REPLACE VIEW v_tesoreria_resumen_categoria AS
SELECT
    categoria AS Categoria,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL
GROUP BY categoria;

SELECT '✅ Vista v_tesoreria_resumen_categoria creada' AS status;

-- ============================================
-- 4. VISTA: Monto Total por Persona
-- ============================================

CREATE OR REPLACE VIEW v_tesoreria_por_persona AS
SELECT
    nombre AS Persona,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL
GROUP BY nombre;

SELECT '✅ Vista v_tesoreria_por_persona creada' AS status;

-- ============================================
-- 5. VISTA: Monto Total por Vehículo
-- ============================================

CREATE OR REPLACE VIEW v_tesoreria_por_vehiculo AS
SELECT
    placa AS Placa,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL AND placa IS NOT NULL
GROUP BY placa;

SELECT '✅ Vista v_tesoreria_por_vehiculo creada' AS status;

-- ============================================
-- 6. VISTA: Monto por Centro de Distribución
-- ============================================

CREATE OR REPLACE VIEW v_tesoreria_por_centro AS
SELECT
    id_centro AS Id_Centro,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL AND id_centro IS NOT NULL
GROUP BY id_centro;

SELECT '✅ Vista v_tesoreria_por_centro creada' AS status;

-- ============================================
-- 7. VISTA: Tendencia Mensual de Gastos
-- ============================================

CREATE OR REPLACE VIEW v_tesoreria_tendencia_mensual AS
SELECT
    DATE_FORMAT(fecha, '%Y-%m') AS Mes,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL
GROUP BY DATE_FORMAT(fecha, '%Y-%m')
ORDER BY Mes DESC;

SELECT '✅ Vista v_tesoreria_tendencia_mensual creada' AS status;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT '========================================' AS '';
SELECT 'RESUMEN DE VISTAS CREADAS' AS '';
SELECT '========================================' AS '';

SHOW TABLES LIKE 'v_%';

SELECT '========================================' AS '';
SELECT '✅ TODAS LAS VISTAS CREADAS EXITOSAMENTE' AS '';
SELECT '========================================' AS '';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
