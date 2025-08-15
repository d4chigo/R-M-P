-- ==============================
-- MIGRACIÓN: Agregar estado de disponibilidad a REPARTIDOR
-- Archivo: 001_add_estado_disponibilidad_repartidor.sql
-- Fecha: 2024-01-20
-- Descripción: Agrega el campo estado_disponibilidad a la tabla REPARTIDOR
-- ==============================

-- Verificar si la columna ya existe antes de agregarla
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'REPARTIDOR'
    AND COLUMN_NAME = 'estado_disponibilidad'
);

-- Solo agregar la columna si no existe
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE REPARTIDOR ADD COLUMN estado_disponibilidad ENUM(''DISPONIBLE'', ''OCUPADO'', ''EN_DESCANSO'', ''NO_DISPONIBLE'') DEFAULT ''DISPONIBLE'' AFTER telefono',
    'SELECT ''La columna estado_disponibilidad ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar repartidores existentes según su estado activo
UPDATE REPARTIDOR
SET estado_disponibilidad = CASE
    WHEN activo = TRUE THEN 'DISPONIBLE'
    ELSE 'NO_DISPONIBLE'
END
WHERE estado_disponibilidad IS NULL OR estado_disponibilidad = '';

-- Verificar los cambios
SELECT
    'Migración completada' AS status,
    COUNT(*) AS total_repartidores,
    SUM(CASE WHEN estado_disponibilidad = 'DISPONIBLE' THEN 1 ELSE 0 END) AS disponibles,
    SUM(CASE WHEN estado_disponibilidad = 'NO_DISPONIBLE' THEN 1 ELSE 0 END) AS no_disponibles
FROM REPARTIDOR;

-- Recrear la vista para incluir el nuevo campo
DROP VIEW IF EXISTS v_resumen_rutas;

CREATE VIEW v_resumen_rutas AS
SELECT
    v.fecha AS Fecha,
    ve.placa AS Placa,
    CONCAT(ve.marca, ' ', ve.modelo) AS Vehiculo,
    CONCAT(r.codigo, ' - ', r.nombre) AS Repartidor,
    r.estado_disponibilidad AS `Estado Repartidor`,
    COUNT(DISTINCT v.id_viaje) AS `Nro de viajes`,
    COUNT(DISTINCT c.id_zona) AS Zona,
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
GROUP BY
    v.fecha,
    ve.id_vehiculo,
    ve.placa,
    ve.marca,
    ve.modelo,
    r.id_repartidor,
    r.codigo,
    r.nombre,
    r.estado_disponibilidad
ORDER BY v.fecha DESC, ve.placa;

-- Log de la migración
INSERT INTO AUDITORIA (tabla, id_registro, accion, datos_nuevos, realizado_por, fecha)
SELECT
    'REPARTIDOR' as tabla,
    0 as id_registro,
    'MIGRATION' as accion,
    JSON_OBJECT(
        'migration', '001_add_estado_disponibilidad_repartidor',
        'description', 'Agregado campo estado_disponibilidad a tabla REPARTIDOR',
        'timestamp', NOW()
    ) as datos_nuevos,
    1 as realizado_por,
    NOW() as fecha;

SELECT 'Migración 001_add_estado_disponibilidad_repartidor completada exitosamente' AS resultado;
