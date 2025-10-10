-- Migración: agregar soporte de saldo por centro
-- 1) Añadir columna id_centro a TESORERIA_SALDO
-- 2) Añadir columna id_centro a TESORERIA_SALDO_HISTORY
-- El script está escrito para ser idempotente: verifica existencia antes de crear columnas o índices.

-- Nota: Si tu versión de MySQL no soporta algunas funciones usadas aquí, adapta manualmente
-- o ejecuta los ALTER TABLE sólo si la columna no existe.

SET @schema_name = DATABASE();

-- 1) Añadir columna id_centro a TESORERIA_SALDO si no existe
SET @cnt = (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'TESORERIA_SALDO' AND COLUMN_NAME = 'id_centro'
);
SET @sql = IF(@cnt = 0, 'ALTER TABLE TESORERIA_SALDO ADD COLUMN id_centro INT NULL AFTER saldo', 'SELECT "col_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) Crear índice único por id_centro en TESORERIA_SALDO si no existe
SET @exists = (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'TESORERIA_SALDO' AND INDEX_NAME = 'ux_tesoreria_saldo_id_centro'
);
SET @sql = IF(@exists = 0, 'ALTER TABLE TESORERIA_SALDO ADD UNIQUE INDEX ux_tesoreria_saldo_id_centro (id_centro)', 'SELECT "index_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) Añadir columna id_centro a TESORERIA_SALDO_HISTORY si no existe
SET @cnt2 = (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'TESORERIA_SALDO_HISTORY' AND COLUMN_NAME = 'id_centro'
);
SET @sql = IF(@cnt2 = 0, 'ALTER TABLE TESORERIA_SALDO_HISTORY ADD COLUMN id_centro INT NULL AFTER fecha', 'SELECT "col_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Crear índice para consultas por fecha+id_centro en TESORERIA_SALDO_HISTORY si no existe
SET @exists2 = (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'TESORERIA_SALDO_HISTORY' AND INDEX_NAME = 'idx_tesoreria_saldo_history_fecha_centro'
);
SET @sql = IF(@exists2 = 0, 'ALTER TABLE TESORERIA_SALDO_HISTORY ADD INDEX idx_tesoreria_saldo_history_fecha_centro (fecha, id_centro)', 'SELECT "index_exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mensaje de fin
SELECT 'OK - migration 02-add-centro-to-tesoreria-saldo.sql executed' AS message;