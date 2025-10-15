-- ============================================
-- Migración: Sistema de Saldos por Centro de Distribución
-- ============================================
-- Este script crea las tablas necesarias para manejar saldos independientes
-- por centro de distribución en el módulo de tesorería.

-- ============================================
-- 1. Tabla principal de saldos por centro
-- ============================================
CREATE TABLE IF NOT EXISTS TESORERIA_SALDO_CENTRO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_centro INT NOT NULL,
    saldo DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_saldo_centro_centro
        FOREIGN KEY (id_centro) REFERENCES CENTRO_DISTRIBUCION(id_centro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_saldo_centro_updated_by
        FOREIGN KEY (updated_by) REFERENCES USUARIO(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Índices
    UNIQUE KEY uk_saldo_centro (id_centro),
    INDEX idx_saldo_centro_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Saldos independientes por centro de distribución';

-- ============================================
-- 2. Tabla de historial de cambios de saldo por centro
-- ============================================
CREATE TABLE IF NOT EXISTS TESORERIA_SALDO_CENTRO_HISTORIAL (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_centro INT NOT NULL,
    tipo ENUM('establecer', 'incrementar', 'gasto', 'devolucion') NOT NULL,
    saldo_anterior DECIMAL(14, 2) NOT NULL,
    monto DECIMAL(14, 2) NOT NULL,
    saldo_nuevo DECIMAL(14, 2) NOT NULL,
    motivo TEXT NULL,
    id_registro_tesoreria INT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_historial_centro
        FOREIGN KEY (id_centro) REFERENCES CENTRO_DISTRIBUCION(id_centro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_historial_created_by
        FOREIGN KEY (created_by) REFERENCES USUARIO(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_historial_tesoreria
        FOREIGN KEY (id_registro_tesoreria) REFERENCES TESORERIA(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Índices
    INDEX idx_historial_centro (id_centro),
    INDEX idx_historial_tipo (tipo),
    INDEX idx_historial_fecha (created_at),
    INDEX idx_historial_registro (id_registro_tesoreria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de movimientos de saldo por centro de distribución';

-- ============================================
-- 3. Inicializar saldos para centros existentes
-- ============================================
-- Esta consulta crea registros de saldo iniciales (en 0) para todos los
-- centros de distribución que ya existan en la base de datos.
INSERT INTO TESORERIA_SALDO_CENTRO (id_centro, saldo, created_at, updated_at)
SELECT
    cd.id_centro,
    0.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM CENTRO_DISTRIBUCION cd
WHERE NOT EXISTS (
    SELECT 1
    FROM TESORERIA_SALDO_CENTRO tsc
    WHERE tsc.id_centro = cd.id_centro
);

-- ============================================
-- 4. Trigger para registrar automáticamente cambios de saldo
-- ============================================
DELIMITER $$

DROP TRIGGER IF EXISTS trg_saldo_centro_after_update$$

CREATE TRIGGER trg_saldo_centro_after_update
AFTER UPDATE ON TESORERIA_SALDO_CENTRO
FOR EACH ROW
BEGIN
    -- Solo registrar si el saldo cambió
    IF OLD.saldo != NEW.saldo THEN
        INSERT INTO TESORERIA_SALDO_CENTRO_HISTORIAL (
            id_centro,
            tipo,
            saldo_anterior,
            monto,
            saldo_nuevo,
            created_by,
            created_at
        ) VALUES (
            NEW.id_centro,
            'devolucion', -- Tipo genérico para cambios automáticos
            OLD.saldo,
            NEW.saldo - OLD.saldo,
            NEW.saldo,
            NEW.updated_by,
            CURRENT_TIMESTAMP
        );
    END IF;
END$$

DELIMITER ;

-- ============================================
-- 5. Procedimiento almacenado: Obtener saldo de un centro
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_saldo_centro$$

CREATE PROCEDURE sp_get_saldo_centro(
    IN p_id_centro INT
)
BEGIN
    SELECT
        sc.id_centro,
        sc.saldo,
        c.codigo,
        c.nombre as nombre_centro,
        c.ciudad,
        sc.updated_at,
        sc.updated_by,
        u.nombre_completo as updated_by_nombre
    FROM TESORERIA_SALDO_CENTRO sc
    LEFT JOIN CENTRO_DISTRIBUCION c ON sc.id_centro = c.id_centro
    LEFT JOIN USUARIO u ON sc.updated_by = u.id_usuario
    WHERE sc.id_centro = p_id_centro;
END$$

DELIMITER ;

-- ============================================
-- 6. Procedimiento almacenado: Validar saldo suficiente
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_validar_saldo_centro$$

CREATE PROCEDURE sp_validar_saldo_centro(
    IN p_id_centro INT,
    IN p_monto DECIMAL(14,2),
    OUT p_saldo_actual DECIMAL(14,2),
    OUT p_es_suficiente BOOLEAN
)
BEGIN
    -- Obtener saldo actual
    SELECT COALESCE(saldo, 0) INTO p_saldo_actual
    FROM TESORERIA_SALDO_CENTRO
    WHERE id_centro = p_id_centro;

    -- Si no existe registro, saldo es 0
    IF p_saldo_actual IS NULL THEN
        SET p_saldo_actual = 0;
    END IF;

    -- Verificar si es suficiente
    SET p_es_suficiente = (p_saldo_actual >= p_monto);
END$$

DELIMITER ;

-- ============================================
-- 7. Vista: Resumen de saldos por centro
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

-- ============================================
-- 8. Índices adicionales en tabla TESORERIA
-- ============================================
-- Agregar índice en id_centro si no existe para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_tesoreria_id_centro
ON TESORERIA(id_centro);

CREATE INDEX IF NOT EXISTS idx_tesoreria_fecha_centro
ON TESORERIA(fecha, id_centro);

-- ============================================
-- 9. Datos de ejemplo (COMENTADO - descomentar si se necesita)
-- ============================================
/*
-- Ejemplo: Establecer saldo inicial de 10,000 para centro ID 1
UPDATE TESORERIA_SALDO_CENTRO
SET saldo = 10000.00, updated_at = CURRENT_TIMESTAMP
WHERE id_centro = 1;

-- Ejemplo: Establecer saldo inicial de 15,000 para centro ID 2
UPDATE TESORERIA_SALDO_CENTRO
SET saldo = 15000.00, updated_at = CURRENT_TIMESTAMP
WHERE id_centro = 2;
*/

-- ============================================
-- 10. Verificación de la migración
-- ============================================
-- Consulta para verificar que todo se creó correctamente
SELECT
    'Tabla TESORERIA_SALDO_CENTRO' as item,
    COUNT(*) as registros
FROM TESORERIA_SALDO_CENTRO
UNION ALL
SELECT
    'Tabla TESORERIA_SALDO_CENTRO_HISTORIAL',
    COUNT(*)
FROM TESORERIA_SALDO_CENTRO_HISTORIAL
UNION ALL
SELECT
    'Vista v_resumen_saldos_centro',
    COUNT(*)
FROM v_resumen_saldos_centro;

-- ============================================
-- Notas de implementación:
-- ============================================
-- 1. Ejecutar este script en el orden presentado
-- 2. Asegurarse de que las tablas CENTRO_DISTRIBUCION, USUARIO y TESORERIA existan
-- 3. Después de ejecutar, inicializar los saldos manualmente desde la interfaz
-- 4. El trigger registrará automáticamente todos los cambios de saldo
-- 5. Usar los procedimientos almacenados para validaciones antes de crear gastos
-- ============================================
