-- Script de inicialización de la base de datos R-M-P
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor MySQL
-- Asegurar que existe la base de datos
CREATE DATABASE IF NOT EXISTS rmp_db;
USE rmp_db;

SET GLOBAL time_zone = 'America/Lima';
SET time_zone = 'America/Lima';

-- Tabla VEHICULO
CREATE TABLE `VEHICULO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `placa` VARCHAR(10) NOT NULL UNIQUE,
    `marca` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(50) NOT NULL,
    `anio` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `capacidad_carga_kg` INTEGER NOT NULL,
    `tipo_carga` VARCHAR(30) NOT NULL,
    `estado` VARCHAR(10) NOT NULL,
    `fecha_adquisicion` DATE NOT NULL,
    `vin` VARCHAR(17) NOT NULL UNIQUE,
    `id_carreta` INTEGER,
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla CARRETA
CREATE TABLE `CARRETA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `placa` VARCHAR(10) NOT NULL UNIQUE,
    `tipo` VARCHAR(20) NOT NULL,
    `capacidad_kg` INTEGER NOT NULL,
    `estado` VARCHAR(10) NOT NULL,
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla RUTA
CREATE TABLE `RUTA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `codigo` VARCHAR(10) NOT NULL UNIQUE,
    `nombre` VARCHAR(50) NOT NULL,
    `origen` VARCHAR(50) NOT NULL,
    `destino` VARCHAR(50) NOT NULL,
    `distancia_km` INTEGER NOT NULL,
    `duracion_aproximada` TIME NOT NULL,
    `tipo_ruta` VARCHAR(20) NOT NULL,
    `estado` VARCHAR(20) NOT NULL,
    `fecha_creacion` DATETIME NOT NULL,
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla TIPO_CLIENTE
CREATE TABLE `TIPO_CLIENTE` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `nombre` VARCHAR(50) NOT NULL UNIQUE,
    `descripcion` VARCHAR(100),
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla ZONA
CREATE TABLE `ZONA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `nombre` VARCHAR(50) NOT NULL UNIQUE,
    `descripcion` TEXT NOT NULL COMMENT 'Nombre de la zona (zona norte, etc.)',
    `region` VARCHAR(50),
    `latitud` DECIMAL(9,6),
    `longitud` DECIMAL(9,6),
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
) COMMENT='Nombre de la zona (zona norte, etc.)';

-- Tabla CLIENTE
CREATE TABLE `CLIENTE` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `nombre` VARCHAR(50) NOT NULL,
    `codigo` VARCHAR(10) NOT NULL UNIQUE,
    `id_tipo_cliente` INTEGER NOT NULL,
    `id_zona_pvta` INTEGER,
    `id_zona_tvta` INTEGER,
    `ruc` VARCHAR(11) NOT NULL UNIQUE,
    `ciudad` VARCHAR(50) NOT NULL,
    `telefono` VARCHAR(15) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `contacto_nombre` VARCHAR(50) NOT NULL,
    `horario` VARCHAR(20) NOT NULL,
    `estado` VARCHAR(10) NOT NULL,
    `latitud` DECIMAL(9,6) NOT NULL,
    `longitud` DECIMAL(9,6) NOT NULL,
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla USUARIO
CREATE TABLE `USUARIO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `nombre` VARCHAR(50) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `estado` VARCHAR(10) DEFAULT 'Activo',
    `last_login` DATETIME NULL COMMENT 'Última fecha de login',
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla VIAJE
CREATE TABLE `VIAJE` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `id_ruta` INTEGER NOT NULL COMMENT 'Código de ruta',
    `ruta` VARCHAR(50) NOT NULL,
    `id_vehiculo` INTEGER NOT NULL COMMENT 'Placa del vehículo',
    `vehiculo` VARCHAR(10) NOT NULL,
    `fecha` DATE NOT NULL,
    `id_repartidor` INTEGER NOT NULL,
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- Tabla VISITA
CREATE TABLE `VISITA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    `id_viaje` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `entrega` DECIMAL(10,2) NOT NULL,
    `recojo` DECIMAL(10,2) NOT NULL,
    `llega` TIME NOT NULL,
    `sale` TIME NOT NULL,
    `sec1` VARCHAR(10) NOT NULL,
    `sec2` VARCHAR(10) NOT NULL,
    `distancia_km` DECIMAL(10,2),
    -- Auditoría
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    PRIMARY KEY (`id`)
);

-- ======================================
-- FOREIGN KEYS (RELACIONES ENTRE TABLAS)
-- ======================================

-- Relación: VEHICULO -> CARRETA
ALTER TABLE `VEHICULO`
ADD CONSTRAINT `fk_vehiculo_carreta`
FOREIGN KEY (`id_carreta`) REFERENCES `CARRETA`(`id`)
ON UPDATE CASCADE ON DELETE SET NULL;

-- Relación: CLIENTE -> TIPO_CLIENTE
ALTER TABLE `CLIENTE`
ADD CONSTRAINT `fk_cliente_tipo`
FOREIGN KEY (`id_tipo_cliente`) REFERENCES `TIPO_CLIENTE`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: CLIENTE -> ZONA (PVTA)
ALTER TABLE `CLIENTE`
ADD CONSTRAINT `fk_cliente_zona_pvta`
FOREIGN KEY (`id_zona_pvta`) REFERENCES `ZONA`(`id`)
ON UPDATE CASCADE ON DELETE SET NULL;

-- Relación: CLIENTE -> ZONA (TVTA)
ALTER TABLE `CLIENTE`
ADD CONSTRAINT `fk_cliente_zona_tvta`
FOREIGN KEY (`id_zona_tvta`) REFERENCES `ZONA`(`id`)
ON UPDATE CASCADE ON DELETE SET NULL;

-- Relación: VIAJE -> RUTA
ALTER TABLE `VIAJE`
ADD CONSTRAINT `fk_viaje_ruta`
FOREIGN KEY (`id_ruta`) REFERENCES `RUTA`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: VIAJE -> VEHICULO
ALTER TABLE `VIAJE`
ADD CONSTRAINT `fk_viaje_vehiculo`
FOREIGN KEY (`id_vehiculo`) REFERENCES `VEHICULO`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: VIAJE -> USUARIO (Repartidor)
ALTER TABLE `VIAJE`
ADD CONSTRAINT `fk_viaje_repartidor`
FOREIGN KEY (`id_repartidor`) REFERENCES `USUARIO`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: VISITA -> VIAJE
ALTER TABLE `VISITA`
ADD CONSTRAINT `fk_visita_viaje`
FOREIGN KEY (`id_viaje`) REFERENCES `VIAJE`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;

-- Relación: VISITA -> CLIENTE
ALTER TABLE `VISITA`
ADD CONSTRAINT `fk_visita_cliente`
FOREIGN KEY (`id_cliente`) REFERENCES `CLIENTE`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- ======================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ======================================

-- Índices en foreign keys
CREATE INDEX `idx_vehiculo_carreta` ON `VEHICULO`(`id_carreta`);
CREATE INDEX `idx_cliente_tipo` ON `CLIENTE`(`id_tipo_cliente`);
CREATE INDEX `idx_cliente_zona_pvta` ON `CLIENTE`(`id_zona_pvta`);
CREATE INDEX `idx_cliente_zona_tvta` ON `CLIENTE`(`id_zona_tvta`);
CREATE INDEX `idx_viaje_ruta` ON `VIAJE`(`id_ruta`);
CREATE INDEX `idx_viaje_vehiculo` ON `VIAJE`(`id_vehiculo`);
CREATE INDEX `idx_viaje_repartidor` ON `VIAJE`(`id_repartidor`);
CREATE INDEX `idx_visita_viaje` ON `VISITA`(`id_viaje`);
CREATE INDEX `idx_visita_cliente` ON `VISITA`(`id_cliente`);

-- Índices adicionales para búsquedas comunes
CREATE INDEX `idx_vehiculo_placa` ON `VEHICULO`(`placa`);
CREATE INDEX `idx_cliente_ruc` ON `CLIENTE`(`ruc`);
CREATE INDEX `idx_ruta_codigo` ON `RUTA`(`codigo`);
CREATE INDEX `idx_viaje_fecha` ON `VIAJE`(`fecha`);

-- Índices para autenticación
CREATE INDEX `idx_usuario_email` ON `USUARIO`(`email`);
CREATE INDEX `idx_usuario_estado` ON `USUARIO`(`estado`);

-- ======================================
-- DATOS INICIALES - SOLO USUARIOS
-- ======================================

-- Insertar usuarios de autenticación por defecto
INSERT INTO USUARIO (nombre, contrasena, email, estado, created_by) VALUES
('Administrador', '$2a$10$iUbSmL2uwaU5sIryjMYRVect6MhXSBNx85f5plAEF3p2GSwbxFXoa', 'admin@rmp.com', '1', 1),
('Usuario Demo', '$2a$10$S16xtRVcad4th4ktbcUuY.RsU8rscIx02AXu17S1xBoKvhPSVRS6W', 'demo@rmp.com', '1', 1);

-- ======================================
-- VERIFICACIÓN DE INTEGRIDAD
-- ======================================

-- Verificar que todas las foreign keys funcionan
SELECT 'Base de datos inicializada correctamente con relaciones establecidas' AS resultado;

-- Mostrar usuarios creados
SELECT 'Usuarios creados:' AS info;
SELECT id, nombre, email, estado, created_at FROM USUARIO;

-- Script completado exitosamente
SELECT 'Script de inicialización completado exitosamente' AS resultado;
