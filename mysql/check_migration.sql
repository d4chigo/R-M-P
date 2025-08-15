-- ==============================
-- SCRIPT DE VERIFICACIÓN - RMP
-- Archivo: check_migration.sql
-- Descripción: Verifica el estado actual de la base de datos y qué migraciones necesita
-- ==============================

-- Verificar conexión y base de datos actual
SELECT
    'Verificación de Base de Datos RMP' AS titulo,
    DATABASE() AS base_datos_actual,
    NOW() AS fecha_verificacion;

-- ==============================
-- VERIFICACIÓN DE TABLAS PRINCIPALES
-- ==============================
SELECT
    'VERIFICACIÓN DE TABLAS' AS seccion,
    'Verificando existencia de tablas principales...' AS descripcion;

SELECT
    TABLE_NAME as tabla,
    CASE
        WHEN TABLE_NAME IN (
            'USUARIO', 'ROL', 'USUARIO_ROL', 'ZONA', 'VEHICULO',
            'REPARTIDOR', 'CLIENTE', 'VIAJE', 'VISITA', 'AUDITORIA'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN (
    'USUARIO', 'ROL', 'USUARIO_ROL', 'ZONA', 'VEHICULO',
    'REPARTIDOR', 'CLIENTE', 'VIAJE', 'VISITA', 'AUDITORIA'
)
ORDER BY TABLE_NAME;

-- ==============================
-- VERIFICACIÓN ESPECÍFICA: CAMPO estado_disponibilidad
-- ==============================
SELECT
    'VERIFICACIÓN CAMPO estado_disponibilidad' AS seccion,
    'Verificando si existe el campo estado_disponibilidad en REPARTIDOR...' AS descripcion;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'REPARTIDOR'
            AND COLUMN_NAME = 'estado_disponibilidad'
        ) THEN '✅ CAMPO estado_disponibilidad EXISTE - Base de datos actualizada'
        ELSE '⚠️  CAMPO estado_disponibilidad NO EXISTE - Necesita migración'
    END AS estado_migracion;

-- Mostrar estructura actual de REPARTIDOR
SELECT
    'ESTRUCTURA ACTUAL DE REPARTIDOR' AS seccion,
    'Campos disponibles en la tabla REPARTIDOR:' AS descripcion;

SELECT
    COLUMN_NAME as campo,
    DATA_TYPE as tipo,
    IS_NULLABLE as permite_null,
    COLUMN_DEFAULT as valor_default,
    COLUMN_COMMENT as comentario
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'REPARTIDOR'
ORDER BY ORDINAL_POSITION;

-- ==============================
-- VERIFICACIÓN DE DATOS
-- ==============================
SELECT
    'VERIFICACIÓN DE DATOS' AS seccion,
    'Conteo de registros en tablas principales...' AS descripcion;

SELECT
    'USUARIO' as tabla,
    COUNT(*) as total_registros
FROM USUARIO
UNION ALL
SELECT
    'REPARTIDOR' as tabla,
    COUNT(*) as total_registros
FROM REPARTIDOR
UNION ALL
SELECT
    'VEHICULO' as tabla,
    COUNT(*) as total_registros
FROM VEHICULO
UNION ALL
SELECT
    'VIAJE' as tabla,
    COUNT(*) as total_registros
FROM VIAJE;

-- ==============================
-- VERIFICACIÓN DE VISTA
-- ==============================
SELECT
    'VERIFICACIÓN DE VISTA' AS seccion,
    'Verificando vista v_resumen_rutas...' AS descripcion;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.VIEWS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'v_resumen_rutas'
        ) THEN '✅ VISTA v_resumen_rutas EXISTE'
        ELSE '❌ VISTA v_resumen_rutas NO EXISTE'
    END AS estado_vista;

-- ==============================
-- RECOMENDACIONES
-- ==============================
SELECT
    'RECOMENDACIONES' AS seccion,
    CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'REPARTIDOR'
            AND COLUMN_NAME = 'estado_disponibilidad'
        ) THEN 'EJECUTAR: mysql/migrations/001_add_estado_disponibilidad_repartidor.sql'
        ELSE 'Base de datos actualizada - No se requieren migraciones'
    END AS accion_requerida;

-- ==============================
-- ESTADO FINAL
-- ==============================
SELECT
    'RESUMEN FINAL' AS titulo,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'REPARTIDOR'
            AND COLUMN_NAME = 'estado_disponibilidad'
        ) THEN '🟢 SISTEMA ACTUALIZADO'
        ELSE '🟡 REQUIERE MIGRACIÓN'
    END AS estado_sistema,
    DATABASE() AS base_datos,
    NOW() AS verificacion_completada;
