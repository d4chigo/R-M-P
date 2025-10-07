-- Migration: 001_add_id_centro_to_ajuste.sql
-- Propósito: Añadir columna id_centro, índice y FK a TESORERIA_AJUSTE de forma segura.
-- Ejecutar en MySQL (local o contenedor). Requiere privilegios ALTER, CREATE, REFERENCES.

-- Nota: este script usa consultas a INFORMATION_SCHEMA y sentencias preparadas
-- para aplicar cambios solo si no existen. Compatible con MySQL 5.7+ y 8.x.

SET @db = DATABASE();
-- 1) Añadir columna id_centro si no existe
SELECT COUNT(*) INTO @has_col
FROM information_schema.columns
WHERE
    table_schema = @db
    AND table_name = 'TESORERIA_AJUSTE'
    AND column_name = 'id_centro';

SET
    @sql = IF(
        @has_col = 0,
        'ALTER TABLE TESORERIA_AJUSTE ADD COLUMN id_centro INT NULL;',
        'SELECT "COLUMN_EXISTS" AS info;'
    );

PREPARE stmt FROM @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- 2) Añadir índice en id_centro si no existe
SELECT COUNT(*) INTO @has_index
FROM information_schema.statistics
WHERE
    table_schema = @db
    AND table_name = 'TESORERIA_AJUSTE'
    AND index_name = 'idx_ajuste_id_centro';

SET
    @sql = IF(
        @has_index = 0,
        'CREATE INDEX idx_ajuste_id_centro ON TESORERIA_AJUSTE (id_centro);',
        'SELECT "INDEX_EXISTS" AS info;'
    );

PREPARE stmt FROM @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- 3) Añadir constraint FK si no existe
SELECT COUNT(*) INTO @has_fk
FROM information_schema.TABLE_CONSTRAINTS tc
WHERE
    tc.CONSTRAINT_SCHEMA = @db
    AND tc.TABLE_NAME = 'TESORERIA_AJUSTE'
    AND tc.CONSTRAINT_NAME = 'fk_ajuste_centro'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY';

SET
    @sql = IF(
        @has_fk = 0,
        'ALTER TABLE TESORERIA_AJUSTE ADD CONSTRAINT fk_ajuste_centro FOREIGN KEY (id_centro) REFERENCES CENTRO_DISTRIBUCION(id_centro) ON DELETE SET NULL;',
        'SELECT "FK_EXISTS" AS info;'
    );

PREPARE stmt FROM @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- Fin de migración
SELECT 'Migration finished' AS status;