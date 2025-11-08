-- ==============================
-- SCRIPT SQL - RMP (Route Management Platform)
-- Archivo: 01-init.sql
-- Descripción: Inicialización del sistema con las tablas esenciales
-- ==============================

-- ==============================
-- CREACIÓN DE TABLAS MAESTRAS
-- ==============================

-- Tabla USUARIO: gestiona los usuarios del sistema
CREATE TABLE USUARIO (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    must_change_password BOOLEAN DEFAULT FALSE,
    last_temporary_password VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla ROL: define roles para control de acceso
CREATE TABLE ROL (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Relación USUARIO-ROL (muchos a muchos)
CREATE TABLE USUARIO_ROL (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
);

-- Insertar roles básicos del sistema (desarrollo): mantener sólo ADMINISTRADOR y EMPLEADO
-- Nota: para migraciones reales se debería mapear roles antiguos a EMPLEADO cuando aplique
INSERT INTO ROL (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administrador del sistema con acceso total'),
('EMPLEADO', 'Usuario con permisos de empleado (crear registros, ver informacion limitada)');

-- Tabla VEHICULO: unidades de transporte
CREATE TABLE VEHICULO (
    id_vehiculo INT PRIMARY KEY AUTO_INCREMENT,
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT,
    capacidad_kg DECIMAL(10,2),
    capacidad_cajas INT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla REPARTIDOR: conductores/operadores
CREATE TABLE REPARTIDOR (
    id_repartidor INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(15) NOT NULL UNIQUE,
    licencia_conducir VARCHAR(20),
    telefono VARCHAR(20),
    estado_disponibilidad ENUM('DISPONIBLE', 'OCUPADO', 'EN_DESCANSO', 'NO_DISPONIBLE') DEFAULT 'DISPONIBLE',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla CENTRO_DISTRIBUCION: centros de distribución y almacenes
CREATE TABLE CENTRO_DISTRIBUCION (
    id_centro INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
    capacidad_almacen DECIMAL(12,2) COMMENT 'Capacidad en metros cúbicos',
    personal_asignado INT DEFAULT 0,
    telefono VARCHAR(20),
    email VARCHAR(100),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================
-- TABLAS FINANCIERAS
-- ==============================

-- Tabla tesoreria
CREATE TABLE TESORERIA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE NOT NULL,
    placa VARCHAR(19) NULL,
    nombre VARCHAR(149) NOT NULL,
    cargo VARCHAR(99) NULL,
    categoria VARCHAR(99) NOT NULL,
    detalle TEXT NULL,
    reembolso VARCHAR(49) NULL,
    distrito VARCHAR(99) NULL,
    id_centro INT NULL,
    turno TINYINT NULL,
    encargado VARCHAR(99) NULL,
    monto DECIMAL(11,2) NOT NULL,
    es_multiple BOOLEAN DEFAULT FALSE,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla TESORERIA_CATEGORIAS: Detalles de categorías múltiples para registros de tesorería
CREATE TABLE TESORERIA_CATEGORIAS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_tesoreria INT NOT NULL,
    categoria VARCHAR(99) NOT NULL,
    monto DECIMAL(11,2) NOT NULL,
    orden INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tesoreria) REFERENCES TESORERIA(id) ON DELETE CASCADE,
    INDEX idx_tesoreria_categorias (id_tesoreria),
    INDEX idx_categoria (categoria)
);

-- ==============================
-- TABLAS TRANSACCIONALES
-- ==============================

-- Tabla VIAJE: viajes realizados por vehículo y repartidor
CREATE TABLE VIAJE (
    id_viaje INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE NOT NULL,
    id_vehiculo INT NOT NULL,
    id_repartidor INT NOT NULL,
    id_centro INT NULL,
    nro_viaje INT NOT NULL,
    territorios_visitados INT DEFAULT 0 COMMENT 'Total de territorios visitados en el viaje',
    salida_cd DATETIME,
    llegada_cd DATETIME,
    distancia_km DECIMAL(10,2),
    tipo_viaje VARCHAR(50),
    -- Totales de resumen de ruta
    nro_clientes INT DEFAULT 0,
    nro_pedidos INT DEFAULT 0,
    entrega_cf DECIMAL(12,2) DEFAULT 0,
    recojo_cf DECIMAL(12,2) DEFAULT 0,
    peso_kg DECIMAL(12,2) DEFAULT 0,
    -- Tripulación variable
    nro_conductores TINYINT DEFAULT 1,
    nro_liquidadores TINYINT DEFAULT 0,
    nro_auxiliares TINYINT DEFAULT 0,
    nro_trip_adicional TINYINT DEFAULT 0,
    tripulacion_especial VARCHAR(100) NULL,
    created_by INT, -- referencia a USUARIO
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vehiculo) REFERENCES VEHICULO(id_vehiculo),
    FOREIGN KEY (id_repartidor) REFERENCES REPARTIDOR(id_repartidor),
    FOREIGN KEY (id_centro) REFERENCES CENTRO_DISTRIBUCION(id_centro),
    FOREIGN KEY (created_by) REFERENCES USUARIO(id_usuario),
    FOREIGN KEY (updated_by) REFERENCES USUARIO(id_usuario)
);

-- Agregar FK para TESORERIA.id_centro hacia CENTRO_DISTRIBUCION
ALTER TABLE TESORERIA
    ADD CONSTRAINT fk_tesoreria_centro FOREIGN KEY (id_centro) REFERENCES CENTRO_DISTRIBUCION(id_centro);

-- Agregar FK a usuarios para saber quién creó/actualizó registros de tesorería
ALTER TABLE TESORERIA
    ADD CONSTRAINT fk_tesoreria_created_by FOREIGN KEY (created_by) REFERENCES USUARIO(id_usuario) ON DELETE SET NULL,
    ADD CONSTRAINT fk_tesoreria_updated_by FOREIGN KEY (updated_by) REFERENCES USUARIO(id_usuario) ON DELETE SET NULL;

-- Tabla para almacenar el saldo / monto fijo de tesorería (tarjeta fija)
CREATE TABLE TESORERIA_SALDO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    saldo DECIMAL(14,2) NOT NULL DEFAULT 0,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FK de TESORERIA_SALDO.updated_by hacia USUARIO
ALTER TABLE TESORERIA_SALDO
    ADD CONSTRAINT fk_tesoreria_saldo_updated_by FOREIGN KEY (updated_by) REFERENCES USUARIO(id_usuario) ON DELETE SET NULL;

-- Tabla para histórico diario de saldo (snapshot diario para rollover)
CREATE TABLE IF NOT EXISTS TESORERIA_SALDO_HISTORY (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fecha DATE NOT NULL,
        saldo_final DECIMAL(14,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tesoreria_saldo_history_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Asegurar unicidad por fecha para permitir upsert/idempotencia en rollover
-- MySQL no soporta ADD UNIQUE INDEX IF NOT EXISTS en todas las versiones, así que
-- usamos una rutina temporal para crear el índice único solo si no existe.
DELIMITER $$
CREATE PROCEDURE ensure_idx_tesoreria_saldo_history_fecha()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'TESORERIA_SALDO_HISTORY' AND INDEX_NAME = 'ux_tesoreria_saldo_history_fecha'
    ) THEN
        ALTER TABLE TESORERIA_SALDO_HISTORY ADD UNIQUE INDEX ux_tesoreria_saldo_history_fecha (fecha);
    END IF;
END$$
CALL ensure_idx_tesoreria_saldo_history_fecha()$$
DROP PROCEDURE ensure_idx_tesoreria_saldo_history_fecha$$
DELIMITER ;

-- ==============================
-- TABLA: TESORERIA_SALDO_CENTRO
-- Sistema de Saldos por Centro de Distribución
-- ==============================

-- 1. Tabla principal de saldos por centro
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

-- 2. Tabla de historial de cambios de saldo por centro
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

-- 3. Inicializar saldos para centros existentes
INSERT IGNORE INTO TESORERIA_SALDO_CENTRO (id_centro, saldo, created_at, updated_at)
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

-- 4. Trigger para registrar automáticamente cambios de saldo
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

-- 5. Procedimiento almacenado: Obtener saldo de un centro
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

-- 6. Procedimiento almacenado: Validar saldo suficiente
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

-- 7. Vista: Resumen de saldos por centro
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

-- ==============================
-- CREACIÓN DE ÍNDICES
-- ==============================

CREATE INDEX idx_viaje_fecha ON VIAJE(fecha);
CREATE INDEX idx_viaje_vehiculo_fecha ON VIAJE(id_vehiculo, fecha);
CREATE INDEX idx_viaje_repartidor ON VIAJE(id_repartidor);
CREATE INDEX idx_viaje_centro ON VIAJE(id_centro);
CREATE INDEX idx_vehiculo_placa ON VEHICULO(placa);
CREATE INDEX idx_repartidor_codigo ON REPARTIDOR(codigo);
CREATE INDEX idx_viaje_fecha_vehiculo_repartidor ON VIAJE(fecha, id_vehiculo, id_repartidor);
CREATE INDEX idx_centro_distribucion_codigo ON CENTRO_DISTRIBUCION(codigo);
CREATE INDEX idx_centro_distribucion_estado ON CENTRO_DISTRIBUCION(estado);
CREATE INDEX idx_centro_distribucion_ciudad ON CENTRO_DISTRIBUCION(ciudad);
CREATE INDEX idx_centro_distribucion_coordenadas ON CENTRO_DISTRIBUCION(latitud, longitud);
CREATE INDEX idx_tesoreria_fecha ON TESORERIA(fecha);
CREATE INDEX idx_tesoreria_categoria ON TESORERIA(categoria);
CREATE INDEX idx_tesoreria_reembolso ON TESORERIA(reembolso);
CREATE INDEX idx_tesoreria_turno ON TESORERIA(turno);
CREATE INDEX idx_tesoreria_distrito ON TESORERIA(distrito);
CREATE INDEX idx_tesoreria_deleted_at ON TESORERIA(deleted_at);
CREATE INDEX idx_tesoreria_centro ON TESORERIA(id_centro);
CREATE INDEX idx_tesoreria_es_multiple ON TESORERIA(es_multiple);

-- Índices adicionales en tabla TESORERIA para mejorar consultas con saldos por centro
SET @index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
    AND table_name = 'TESORERIA'
    AND index_name = 'idx_tesoreria_id_centro'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX idx_tesoreria_id_centro ON TESORERIA(id_centro)',
    'SELECT "Index idx_tesoreria_id_centro already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists2 = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
    AND table_name = 'TESORERIA'
    AND index_name = 'idx_tesoreria_fecha_centro'
);

SET @sql2 = IF(@index_exists2 = 0,
    'CREATE INDEX idx_tesoreria_fecha_centro ON TESORERIA(fecha, id_centro)',
    'SELECT "Index idx_tesoreria_fecha_centro already exists" AS info');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Evitar duplicados por día/vehículo/nro_viaje
ALTER TABLE VIAJE ADD UNIQUE KEY uq_viaje_por_dia_vehiculo (fecha, id_vehiculo, nro_viaje);


-- ==============================
-- VISTA PARA RESUMEN DE RUTAS
-- ==============================

-- Asegurarse de que no exista la tabla materializada `resumen_rutas`.
-- La fuente canónica en runtime será la vista `v_resumen_rutas`.
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
    -- Campos de tripulación
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


-- ==============================
-- VISTA: Cumplimiento VH (visitas)
-- Producción de filas por visita: Fecha, Placa, Codigo_Cliente, Cliente, OpenDT, CloseDT, ArriveDT, LeaveDT, IDR_Min, Fuera_VH
-- Nota: esta vista asume la existencia de una tabla VISITA con los campos mostrados abajo.
-- Ajustar nombres de columnas si la implementación real difiere.
-- Cumplimiento VH removido: la vista y los reportes relacionados fueron eliminados.
-- Si necesita restaurarla, crear una vista que seleccione desde las tablas
-- VISITA y CLIENTE (no presentes) o implementar una alternativa basada en
-- VIAJE/TESORERIA.

-- ==============================
-- VISTAS: Reportes de TESORERIA (Gastos)
-- ==============================

-- 1) Monto total por categoría
CREATE OR REPLACE VIEW v_tesoreria_resumen_categoria AS
SELECT
    categoria AS Categoria,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL
GROUP BY categoria;

-- 2) Monto total por persona (nombre)
CREATE OR REPLACE VIEW v_tesoreria_por_persona AS
SELECT
    nombre AS Persona,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL
GROUP BY nombre;

-- 3) Monto total por vehiculo (placa)
CREATE OR REPLACE VIEW v_tesoreria_por_vehiculo AS
SELECT
    placa AS Placa,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL AND placa IS NOT NULL
GROUP BY placa;

-- 4) Monto por centro de distribucion
CREATE OR REPLACE VIEW v_tesoreria_por_centro AS
SELECT
    id_centro AS Id_Centro,
    COUNT(*) AS Cantidad_Registros,
    COALESCE(SUM(monto), 0) AS Monto_Total,
    COALESCE(ROUND(AVG(monto),2), 0) AS Monto_Promedio
FROM TESORERIA
WHERE deleted_at IS NULL AND id_centro IS NOT NULL
GROUP BY id_centro;

-- 5) Tendencia mensual de gastos
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

-- ==============================
-- VERIFICACIÓN DE INTEGRACIÓN
-- ==============================

-- Consulta para verificar que todo se creó correctamente
-- Nota: Esta consulta ayuda a verificar la inicialización en los logs de Docker
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

-- ==============================
-- TRIGGERS PARA MÚLTIPLES CATEGORÍAS
-- ==============================

DELIMITER $$

CREATE TRIGGER trg_tesoreria_primera_categoria
AFTER INSERT ON TESORERIA_CATEGORIAS
FOR EACH ROW
BEGIN
    -- Actualizar el monto total en TESORERIA
    UPDATE TESORERIA 
    SET monto = (
        SELECT SUM(monto) FROM TESORERIA_CATEGORIAS 
        WHERE id_tesoreria = NEW.id_tesoreria
    )
    WHERE id = NEW.id_tesoreria;
    
    -- Marcar como múltiple si hay más de una categoría
    UPDATE TESORERIA 
    SET es_multiple = (
        SELECT COUNT(*) > 1 FROM TESORERIA_CATEGORIAS 
        WHERE id_tesoreria = NEW.id_tesoreria
    )
    WHERE id = NEW.id_tesoreria;
END$$

CREATE TRIGGER trg_tesoreria_categorias_update
AFTER UPDATE ON TESORERIA_CATEGORIAS
FOR EACH ROW
BEGIN
    -- Actualizar el monto total en TESORERIA
    UPDATE TESORERIA 
    SET monto = (
        SELECT SUM(monto) FROM TESORERIA_CATEGORIAS 
        WHERE id_tesoreria = NEW.id_tesoreria
    )
    WHERE id = NEW.id_tesoreria;
    
    -- Marcar como múltiple si hay más de una categoría
    UPDATE TESORERIA 
    SET es_multiple = (
        SELECT COUNT(*) > 1 FROM TESORERIA_CATEGORIAS 
        WHERE id_tesoreria = NEW.id_tesoreria
    )
    WHERE id = NEW.id_tesoreria;
END$$

CREATE TRIGGER trg_tesoreria_categorias_delete
BEFORE DELETE ON TESORERIA_CATEGORIAS
FOR EACH ROW
BEGIN
    -- Actualizar el monto total en TESORERIA (excluyendo el registro que será eliminado)
    UPDATE TESORERIA 
    SET monto = (
        SELECT COALESCE(SUM(monto), 0) FROM TESORERIA_CATEGORIAS 
        WHERE id_tesoreria = OLD.id_tesoreria AND id <> OLD.id
    )
    WHERE id = OLD.id_tesoreria;
    
    -- Marcar como múltiple según las categorías restantes
    UPDATE TESORERIA 
    SET es_multiple = (
        SELECT COUNT(*) > 1 FROM TESORERIA_CATEGORIAS 
        WHERE id_tesoreria = OLD.id_tesoreria AND id <> OLD.id
    )
    WHERE id = OLD.id_tesoreria;
END$$

DELIMITER ;

-- Log de éxito
SELECT '✅ Script 01-init.sql ejecutado exitosamente con sistema de saldos por centro integrado' AS status;

-- ==============================
-- NOTAS DE IMPLEMENTACIÓN:
-- ==============================
-- 1. Sistema de saldos por centro completamente integrado desde archivo 50-saldos-por-centro.sql
-- 2. Utilizado por la tarjeta "Montos por Centro de Distribución" en el módulo de tesorería
-- 3. Frontend: SaldoCard.tsx llama a /api/tesoreria/saldo/por-centro
-- 4. Backend: tesoreria.controller.js proporciona endpoints:
--    - GET /saldo/por-centro (obtener todos los saldos)
--    - PUT /saldo/por-centro/:id_centro (establecer saldo específico - solo admin)
--    - POST /saldo/por-centro/:id_centro/incrementar (agregar dinero - solo admin)
-- 5. Triggers automáticos registran cambios en TESORERIA_SALDO_CENTRO_HISTORIAL
-- 6. Procedimientos almacenados disponibles: sp_get_saldo_centro, sp_validar_saldo_centro
-- 7. Vista v_resumen_saldos_centro proporciona información consolidada
-- ==============================
