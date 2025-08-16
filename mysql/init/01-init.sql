-- ==============================
-- SCRIPT SQL - RMP (Route Management Platform)
-- Archivo: 01-init.sql
-- Descripción: Inicialización completa del sistema con todas las tablas maestras,
-- transaccionales y de soporte necesarias para alimentar RESUMEN DE RUTAS
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

-- Tabla ZONA: áreas geográficas
CREATE TABLE ZONA (
    id_zona INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
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

-- Tabla CLIENTE: clientes atendidos
CREATE TABLE CLIENTE (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    id_zona INT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_zona) REFERENCES ZONA(id_zona)
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
    nro_viaje INT NOT NULL,
    salida_cd DATETIME,
    llegada_cd DATETIME,
    distancia_km DECIMAL(10,2),
    tiempo_manejo_min INT,
    tiempo_servicio_min INT,
    recarga_min INT,
    refrigerio_min INT,
    tipo_viaje VARCHAR(50),
    created_by INT, -- referencia a USUARIO
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vehiculo) REFERENCES VEHICULO(id_vehiculo),
    FOREIGN KEY (id_repartidor) REFERENCES REPARTIDOR(id_repartidor),
    FOREIGN KEY (created_by) REFERENCES USUARIO(id_usuario),
    FOREIGN KEY (updated_by) REFERENCES USUARIO(id_usuario)
);

-- Tabla VISITA: detalle de cada cliente atendido en un viaje
CREATE TABLE VISITA (
    id_visita INT PRIMARY KEY AUTO_INCREMENT,
    id_viaje INT NOT NULL,
    id_cliente INT NOT NULL,
    pedidos INT DEFAULT 0,
    entrega_cf DECIMAL(10,2) DEFAULT 0,
    recojo_cf DECIMAL(10,2) DEFAULT 0,
    peso_kg DECIMAL(10,2) DEFAULT 0,
    distancia_km DECIMAL(10,2) DEFAULT 0,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_viaje) REFERENCES VIAJE(id_viaje),
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
    FOREIGN KEY (created_by) REFERENCES USUARIO(id_usuario),
    FOREIGN KEY (updated_by) REFERENCES USUARIO(id_usuario)
);

-- ==============================
-- TABLAS DE SOPORTE
-- ==============================

-- Tabla para auditoría de cambios
CREATE TABLE AUDITORIA (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    tabla VARCHAR(100) NOT NULL,
    id_registro INT NOT NULL,
    accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    datos_previos JSON,
    datos_nuevos JSON,
    realizado_por INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (realizado_por) REFERENCES USUARIO(id_usuario)
);

-- ==============================
-- CREACIÓN DE ÍNDICES
-- ==============================

CREATE INDEX idx_viaje_fecha ON VIAJE(fecha);
CREATE INDEX idx_viaje_vehiculo_fecha ON VIAJE(id_vehiculo, fecha);
CREATE INDEX idx_viaje_repartidor ON VIAJE(id_repartidor);
CREATE INDEX idx_visita_viaje ON VISITA(id_viaje);
CREATE INDEX idx_visita_cliente ON VISITA(id_cliente);
CREATE INDEX idx_cliente_zona ON CLIENTE(id_zona);
CREATE INDEX idx_vehiculo_placa ON VEHICULO(placa);
CREATE INDEX idx_repartidor_codigo ON REPARTIDOR(codigo);
CREATE INDEX idx_cliente_codigo ON CLIENTE(codigo);
CREATE INDEX idx_zona_codigo ON ZONA(codigo);
CREATE INDEX idx_viaje_fecha_vehiculo_repartidor ON VIAJE(fecha, id_vehiculo, id_repartidor);
CREATE INDEX idx_visita_viaje_cliente ON VISITA(id_viaje, id_cliente);

-- ==============================
-- VISTA PARA RESUMEN DE RUTAS
-- ==============================

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
LEFT JOIN ZONA z ON c.id_zona = z.id_zona
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

-- ==============================
-- INSERCIÓN DE DATOS INICIALES
-- ==============================

-- Insertar roles básicos del sistema
INSERT INTO ROL (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Acceso completo al sistema - gestión de usuarios, configuración y todos los módulos'),
('USUARIO', 'Acceso estándar - gestión de operaciones diarias sin configuración del sistema');

-- Insertar usuarios con contraseñas hasheadas
-- Contraseña para 'admin': admin123 (hasheada con bcrypt)
-- Contraseña para 'demo': demo123 (hasheada con bcrypt)
INSERT INTO USUARIO (username, password_hash, nombre_completo, email, telefono, activo) VALUES
('admin', '$2a$10$jdTXLdWhSMBxZ8/ZNg6PMepqh5mQM8DXZtee0RFQSph4YsTPQPM6e', 'Administrador del Sistema', 'admin@rmp.com', '+51 999 888 777', TRUE),
('demo', '$2a$10$xz36JMqHO5dDLxJ07xdgBOeMXN8r0tqB3l8miiAKwO8jyhPTRH1ae', 'Usuario Demostración', 'demo@rmp.com', '+51 999 888 666', TRUE);

-- Asignar roles a los usuarios
INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES
(1, 1), -- admin con rol ADMINISTRADOR
(2, 2); -- demo con rol USUARIO

-- ==============================
-- INICIALIZACIÓN COMPLETA
-- ==============================
-- Base de datos lista para uso
-- Usuarios predeterminados:
-- - admin / admin123 (Administrador)
-- - demo / demo123 (Usuario)
-- Para insertar más datos de prueba, usar la interfaz web
-- o ejecutar scripts INSERT por separado
