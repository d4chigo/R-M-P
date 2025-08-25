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


-- ==============================
-- TABLAS FINANCIERAS
-- ==============================

-- Tabla tesoreria (nuevo esquema simplificado y alineado con backend)
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
    nro_viaje INT NOT NULL,
    territorios_visitados VARCHAR(255),
    salida_cd DATETIME,
    llegada_cd DATETIME,
    distancia_km DECIMAL(10,2),
    recarga_min INT,
    refrigerio_min INT,
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

-- Tabla de incidencias por viaje
CREATE TABLE INCIDENCIA_VIAJE (
    id_incidencia INT PRIMARY KEY AUTO_INCREMENT,
    id_viaje INT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'AVERIA','RETRASO','ACCIDENTE','ROBO','OTRO'
    severidad ENUM('BAJA','MEDIA','ALTA') DEFAULT 'BAJA',
    descripcion VARCHAR(255),
    costo_estimado DECIMAL(10,2) DEFAULT 0,
    ocurrio_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_viaje) REFERENCES VIAJE(id_viaje)
);

-- Asistencia de repartidores
CREATE TABLE ASISTENCIA_REPARTIDOR (
    id_asistencia INT PRIMARY KEY AUTO_INCREMENT,
    id_repartidor INT NOT NULL,
    fecha DATE NOT NULL,
    checkin DATETIME NULL,
    checkout DATETIME NULL,
    ausente BOOLEAN DEFAULT FALSE,
    observacion VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_repartidor) REFERENCES REPARTIDOR(id_repartidor),
    UNIQUE KEY uq_rep_fecha (id_repartidor, fecha)
);

-- Documentos de vehículo (cumplimiento)
CREATE TABLE VEHICULO_DOCUMENTO (
    id_doc INT PRIMARY KEY AUTO_INCREMENT,
    id_vehiculo INT NOT NULL,
    tipo ENUM('SOAT','SEGURO','REVISION_TECNICA','TARJETA_PROPIEDAD','PERMISO_CIRCULACION','EXTINTOR','BOTIQUIN','GPS') NOT NULL,
    numero VARCHAR(50) NULL,
    emision DATE NULL,
    vencimiento DATE NULL,
    proveedor VARCHAR(100) NULL,
    archivo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vehiculo) REFERENCES VEHICULO(id_vehiculo),
    INDEX idx_doc_vehiculo_tipo (id_vehiculo, tipo),
    INDEX idx_doc_vencimiento (vencimiento)
);

-- Mantenimientos de vehículo
CREATE TABLE MANTENIMIENTO (
    id_mantenimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_vehiculo INT NOT NULL,
    fecha DATE NOT NULL,
    odometro_km INT NULL,
    tipo ENUM('PREVENTIVO','CORRECTIVO') DEFAULT 'PREVENTIVO',
    descripcion VARCHAR(255),
    costo DECIMAL(10,2) DEFAULT 0,
    taller VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vehiculo) REFERENCES VEHICULO(id_vehiculo),
    INDEX idx_mant_vehiculo_fecha (id_vehiculo, fecha)
);

-- Configuración por vehículo
CREATE TABLE VEHICULO_CONFIG (
    id_vehiculo INT PRIMARY KEY,
    mantenimiento_km_intervalo INT DEFAULT 10000,
    mantenimiento_dias_intervalo INT DEFAULT 180,
    requiere_gps BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_vehiculo) REFERENCES VEHICULO(id_vehiculo)
);

-- ==============================
-- CREACIÓN DE ÍNDICES
-- ==============================

CREATE INDEX idx_viaje_fecha ON VIAJE(fecha);
CREATE INDEX idx_viaje_vehiculo_fecha ON VIAJE(id_vehiculo, fecha);
CREATE INDEX idx_viaje_repartidor ON VIAJE(id_repartidor);



CREATE INDEX idx_vehiculo_placa ON VEHICULO(placa);
CREATE INDEX idx_repartidor_codigo ON REPARTIDOR(codigo);

CREATE INDEX idx_zona_codigo ON ZONA(codigo);
CREATE INDEX idx_viaje_fecha_vehiculo_repartidor ON VIAJE(fecha, id_vehiculo, id_repartidor);
CREATE INDEX idx_tesoreria_fecha ON TESORERIA(fecha);
CREATE INDEX idx_tesoreria_categoria ON TESORERIA(categoria);
CREATE INDEX idx_tesoreria_reembolso ON TESORERIA(reembolso);
CREATE INDEX idx_tesoreria_turno ON TESORERIA(turno);
CREATE INDEX idx_tesoreria_distrito ON TESORERIA(distrito);
CREATE INDEX idx_tesoreria_deleted_at ON TESORERIA(deleted_at);
-- Evitar duplicados por día/vehículo/nro_viaje
ALTER TABLE VIAJE ADD UNIQUE KEY uq_viaje_por_dia_vehiculo (fecha, id_vehiculo, nro_viaje);


-- ==============================
-- VISTA PARA RESUMEN DE RUTAS
-- ==============================

CREATE OR REPLACE VIEW v_resumen_rutas AS
SELECT
    v.fecha AS Fecha,
    ve.placa AS Placa,
    CONCAT(ve.marca, ' ', ve.modelo) AS Vehiculo,
    CONCAT(r.codigo, ' - ', r.nombre) AS Repartidor,
    COUNT(DISTINCT v.id_viaje) AS `Nro de viajes`,
    v.territorios_visitados AS `Territorio`,
    COALESCE(SUM(v.distancia_km), 0) AS Distancia,
    MIN(v.salida_cd) AS `Salida del CD`,
    MAX(v.llegada_cd) AS `Llegada al CD`,
    CASE
        WHEN MIN(v.salida_cd) IS NOT NULL AND MAX(v.llegada_cd) IS NOT NULL
        THEN TIMEDIFF(MAX(v.llegada_cd), MIN(v.salida_cd))
        ELSE NULL
    END AS Tiempo,
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
    r.nombre,
    v.territorios_visitados
ORDER BY v.fecha DESC, ve.placa;

-- ==============================
-- VISTAS DE PERFORMANCE Y CUMPLIMIENTO
-- ==============================

-- Performance por vehículo (por fecha)
CREATE VIEW v_performance_vehiculo AS
SELECT
  v.fecha AS Fecha,
  ve.id_vehiculo,
  ve.placa AS Placa,
  CONCAT(ve.marca,' ',ve.modelo) AS Vehiculo,
  COUNT(DISTINCT v.id_viaje) AS Nro_viajes,
  COALESCE(SUM(v.distancia_km),0) AS Km,
  0 AS Litros, -- Campo obsoleto: combustible_litros
  NULL AS Km_por_Litro, -- No se puede calcular sin combustible_litros
  NULL AS Costo_por_Km, -- No se puede calcular sin combustible_costo
  0 AS Pedidos,
  0 AS PesoKg,
  NULL AS Utilizacion_Prom,
  0 AS Min_Manejo, -- Campo obsoleto: tiempo_manejo_min
  0 AS Min_Servicio, -- Campo obsoleto: tiempo_servicio_min
  0 AS Min_Espera, -- Campo obsoleto: tiempo_espera_min
  0 AS Paradas_No_Plan, -- Campo obsoleto: paradas_no_plan
  COUNT(DISTINCT inc.id_incidencia) AS Incidencias,
  COALESCE(SUM(inc.costo_estimado),0) AS Costo_Incidencias
FROM VIAJE v
JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo

LEFT JOIN INCIDENCIA_VIAJE inc ON inc.id_viaje = v.id_viaje
GROUP BY v.fecha, ve.id_vehiculo, ve.placa, ve.marca, ve.modelo, ve.capacidad_kg
ORDER BY v.fecha DESC, ve.placa;

-- Performance por repartidor (por fecha)
CREATE VIEW v_performance_repartidor AS
SELECT
  v.fecha AS Fecha,
  r.id_repartidor,
  CONCAT(r.codigo,' - ',r.nombre) AS Repartidor,
  COUNT(DISTINCT v.id_viaje) AS Nro_viajes,
  COALESCE(SUM(v.distancia_km),0) AS Km,
  0 AS Pedidos,
  0 AS Pedidos_Entregados,
  NULL AS Tasa_Entrega,
  0 AS Visitas_Puntuales,
  0 AS Visitas,
  NULL AS Puntualidad,
  0 AS Min_Totales, -- Campos obsoletos: tiempo_manejo_min, tiempo_servicio_min, tiempo_espera_min
  NULL AS Pedidos_por_Hora
FROM VIAJE v
JOIN REPARTIDOR r ON r.id_repartidor = v.id_repartidor
GROUP BY v.fecha, r.id_repartidor, r.codigo, r.nombre
ORDER BY v.fecha DESC, Repartidor;

-- Cumplimiento de vehículo (documentos y mantenimiento)
CREATE VIEW v_cumplimiento_vehiculo AS
SELECT
  ve.id_vehiculo,
  ve.placa AS Placa,
  CONCAT(ve.marca,' ',ve.modelo) AS Vehiculo,
  -- Documentos
  SUM(CASE WHEN vd.vencimiento IS NULL OR vd.vencimiento >= CURRENT_DATE THEN 1 ELSE 0 END) AS Docs_Vigentes,
  SUM(CASE WHEN vd.vencimiento IS NOT NULL AND vd.vencimiento < CURRENT_DATE THEN 1 ELSE 0 END) AS Docs_Vencidos,
  MIN(DATEDIFF(vd.vencimiento, CURRENT_DATE)) AS Dias_Prox_Venc,
  -- Mantenimiento
  MAX(m.fecha) AS Ult_Mant_Fecha,
  MAX(m.odometro_km) AS Ult_Mant_Odo,
  MAX(vv.odometro_fin) AS Ult_Odo_Registrado,
  vc.mantenimiento_km_intervalo AS Intervalo_KM,
  vc.mantenimiento_dias_intervalo AS Intervalo_Dias,
  CASE
    WHEN MAX(m.fecha) IS NULL THEN NULL
    ELSE DATEDIFF(CURRENT_DATE, MAX(m.fecha))
  END AS Dias_desde_ult_mant,
  CASE
    WHEN MAX(m.odometro_km) IS NULL OR MAX(vv.odometro_fin) IS NULL THEN NULL
    ELSE MAX(vv.odometro_fin) - MAX(m.odometro_km)
  END AS Km_desde_ult_mant,
  CASE
    WHEN vc.mantenimiento_km_intervalo IS NULL OR MAX(m.odometro_km) IS NULL OR MAX(vv.odometro_fin) IS NULL THEN NULL
    ELSE vc.mantenimiento_km_intervalo - (MAX(vv.odometro_fin) - MAX(m.odometro_km))
  END AS Km_para_prox_mant,
  CASE
    WHEN vc.mantenimiento_dias_intervalo IS NULL OR MAX(m.fecha) IS NULL THEN NULL
    ELSE vc.mantenimiento_dias_intervalo - DATEDIFF(CURRENT_DATE, MAX(m.fecha))
  END AS Dias_para_prox_mant
FROM VEHICULO ve
LEFT JOIN VEHICULO_DOCUMENTO vd ON vd.id_vehiculo = ve.id_vehiculo
LEFT JOIN MANTENIMIENTO m ON m.id_vehiculo = ve.id_vehiculo
LEFT JOIN VIAJE vv ON vv.id_vehiculo = ve.id_vehiculo
LEFT JOIN VEHICULO_CONFIG vc ON vc.id_vehiculo = ve.id_vehiculo
GROUP BY ve.id_vehiculo, ve.placa, ve.marca, ve.modelo, vc.mantenimiento_km_intervalo, vc.mantenimiento_dias_intervalo
ORDER BY ve.placa;

-- ==============================
-- INSERCIÓN DE DATOS INICIALES
-- ==============================

-- Insertar roles básicos del sistema
-- INSERT INTO ROL (nombre, descripcion) VALUES
-- ('ADMINISTRADOR', 'Acceso completo al sistema - gestión de usuarios, configuración y todos los módulos'),
-- ('USUARIO', 'Acceso estándar - gestión de operaciones diarias sin configuración del sistema');

-- Insertar usuarios con contraseñas hasheadas
-- Contraseña para 'admin': admin123 (hasheada con bcrypt)
-- Contraseña para 'demo': demo123 (hasheada con bcrypt)
-- INSERT INTO USUARIO (username, password_hash, nombre_completo, email, telefono, activo) VALUES
-- ('admin', '$2a$10$jdTXLdWhSMBxZ8/ZNg6PMepqh5mQM8DXZtee0RFQSph4YsTPQPM6e', 'Administrador del Sistema', 'admin@rmp.com', '+51 999 888 777', TRUE),
-- ('demo', '$2a$10$xz36JMqHO5dDLxJ07xdgBOeMXN8r0tqB3l8miiAKwO8jyhPTRH1ae', 'Usuario Demostración', 'demo@rmp.com', '+51 999 888 666', TRUE);

-- Asignar roles a los usuarios
-- INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES
-- (1, 1), -- admin con rol ADMINISTRADOR
-- (2, 2); -- demo con rol USUARIO

-- ==============================
-- INICIALIZACIÓN COMPLETA
-- ==============================
-- Base de datos lista para uso
-- Usuarios predeterminados:
-- - admin / admin123 (Administrador)
-- - demo / demo123 (Usuario)
-- Para insertar más datos de prueba, usar la interfaz web
-- o ejecutar scripts INSERT por separado
