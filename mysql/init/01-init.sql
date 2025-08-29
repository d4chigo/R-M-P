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
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
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

-- Insertar roles básicos del sistema
INSERT INTO ROL (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administrador del sistema con acceso total'),
('OPERADOR', 'Usuario con acceso a gestión de rutas y reportes'),
('REPARTIDOR', 'Usuario con acceso limitado a sus rutas asignadas');

-- Tabla ZONA: áreas geográficas
CREATE TABLE ZONA (
    id_zona INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
SELECT
    v.fecha AS `Fecha`,
    ve.placa AS `Placa`,
    CONCAT(ve.marca, ' ', ve.modelo) AS `Vehiculo`,
    CONCAT(r.codigo, ' - ', r.nombre) AS `Repartidor`,
    COUNT(DISTINCT v.id_viaje) AS `Nro de viajes`,
    COALESCE(SUM(v.territorios_visitados), 0) AS `Territorios`,
    COALESCE(SUM(v.distancia_km), 0) AS `Distancia`,
    MIN(v.salida_cd) AS `Salida del CD`,
    MAX(v.llegada_cd) AS `Llegada al CD`,
    CASE
        WHEN MIN(v.salida_cd) IS NOT NULL AND MAX(v.llegada_cd) IS NOT NULL
        THEN TIMEDIFF(MAX(v.llegada_cd), MIN(v.salida_cd))
        ELSE NULL
    END AS `Tiempo`,
    COALESCE(SUM(v.nro_clientes), 0) AS `Nro de clientes`,
    COALESCE(SUM(v.nro_pedidos), 0) AS `Nro de pedidos`,
    COALESCE(SUM(v.entrega_cf), 0) AS `Entrega (CF)`,
    COALESCE(SUM(v.recojo_cf), 0) AS `Recojo (CF)`,
    COALESCE(SUM(v.peso_kg), 0) AS `Peso (Kg)`
FROM VIAJE v
JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo
JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
GROUP BY
    v.fecha,
    ve.id_vehiculo,
    ve.placa,
    ve.marca,
    ve.modelo,
    r.id_repartidor,
    r.codigo,
    r.nombre;



-- ==============================
-- DATOS DE PRUEBA PARA CENTROS DE DISTRIBUCIÓN
-- ==============================
INSERT INTO CENTRO_DISTRIBUCION (
    codigo, 
    nombre, 
    descripcion, 
    direccion, 
    ciudad, 
    estado, 
    capacidad_almacen, 
    personal_asignado, 
    telefono, 
    email, 
    latitud, 
    longitud
) VALUES 
('CD001', 'Centro Norte CDMX', 'Centro de distribución principal en el norte de la Ciudad de México', 'Av. Insurgentes Norte 1234', 'Ciudad de México', 'activo', 50000, 45, '55-1234-5678', 'norte@empresa.com', 19.4326, -99.1332),
('CD002', 'Centro Sur CDMX', 'Centro de distribución en el sur de la Ciudad de México', 'Calzada Tlalpan 5678', 'Ciudad de México', 'activo', 35000, 32, '55-8765-4321', 'sur@empresa.com', 19.3019, -99.1398),
('CD003', 'Centro Guadalajara', 'Centro de distribución en Guadalajara, Jalisco', 'Av. Vallarta 9012', 'Guadalajara', 'activo', 40000, 38, '33-9876-5432', 'gdl@empresa.com', 20.6597, -103.3496),
('CD004', 'Centro Monterrey', 'Centro de distribución en Monterrey, Nuevo León', 'Av. Constitución 3456', 'Monterrey', 'activo', 45000, 42, '81-2345-6789', 'mty@empresa.com', 25.6866, -100.3161),
('CD005', 'Centro Puebla', 'Centro de distribución en Puebla', 'Blvd. 5 de Mayo 7890', 'Puebla', 'mantenimiento', 30000, 28, '222-3456-7890', 'pue@empresa.com', 19.0413, -98.2062),
('CD006', 'Centro Querétaro', 'Centro de distribución en Querétaro', 'Av. Tecnológico 2345', 'Querétaro', 'activo', 25000, 25, '442-4567-8901', 'qro@empresa.com', 20.5888, -100.3899),
('CD007', 'Centro Mérida', 'Centro de distribución en Mérida, Yucatán', 'Calle 60 Norte 1234', 'Mérida', 'inactivo', 20000, 0, '999-5678-9012', 'mrd@empresa.com', 20.9674, -89.5926),
('CD008', 'Centro Tijuana', 'Centro de distribución en Tijuana, Baja California', 'Blvd. Agua Caliente 5678', 'Tijuana', 'activo', 35000, 35, '664-6789-0123', 'tij@empresa.com', 32.5149, -117.0382);
