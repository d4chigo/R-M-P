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
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    v.peso_kg AS `Peso (Kg)`
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



