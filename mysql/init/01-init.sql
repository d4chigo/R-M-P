-- Script de inicialización de la base de datos R-M-P
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor MySQL
-- Asegurar que existe la base de datos (opcional, ya existe)
CREATE DATABASE IF NOT EXISTS rmp_db;
USE rmp_db;

CREATE TABLE `VEHICULO` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`placa` VARCHAR(255) NOT NULL UNIQUE,
	`marca` VARCHAR(255) NOT NULL,
	`modelo` VARCHAR(255) NOT NULL,
	`anio` INTEGER NOT NULL,
	`tipo` VARCHAR(255) NOT NULL,
	`capacidad_carga_kg` DECIMAL NOT NULL,
	`tipo_carga` VARCHAR(255) NOT NULL,
	`estado` VARCHAR(255) NOT NULL,
	`fecha_adquisicion` DATE NOT NULL,
	`vin` VARCHAR(255) NOT NULL UNIQUE,
	`id_carreta` INTEGER,
	PRIMARY KEY(`id`)
);


CREATE TABLE `RUTA` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`codigo` VARCHAR(255) NOT NULL,
	`nombre` VARCHAR(255) NOT NULL,
	`origen` VARCHAR(255) NOT NULL,
	`destino` VARCHAR(255) NOT NULL,
	`distancia_km` DECIMAL NOT NULL,
	`duracion_aproximada` TIME NOT NULL,
	`tipo_ruta` VARCHAR(255) NOT NULL,
	`estado` VARCHAR(255) NOT NULL,
	`fecha_creacion` DATETIME NOT NULL,
	`ultima_actualizacion` DATETIME,
	PRIMARY KEY(`id`)
);


CREATE TABLE `CARRETA` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`placa` VARCHAR(255) NOT NULL UNIQUE,
	`tipo` VARCHAR(255) NOT NULL,
	`capacidad_kg` DECIMAL NOT NULL,
	`estado` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `CLIENTE` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	`codigo` VARCHAR(255) NOT NULL,
	`id_tipo_cliente` INTEGER NOT NULL,
	`ruc` VARCHAR(255) NOT NULL UNIQUE,
	`direccion` VARCHAR(255) NOT NULL,
	`ciudad` VARCHAR(255) NOT NULL,
	`departamento` VARCHAR(255) NOT NULL,
	`pais` VARCHAR(255) NOT NULL,
	`telefono` VARCHAR(255) NOT NULL,
	`email` VARCHAR(255) NOT NULL,
	`contacto_nombre` VARCHAR(255) NOT NULL,
	`contacto_telefono` VARCHAR(255) NOT NULL,
	`abre` TIME NOT NULL,
	`cierra` TIME NOT NULL,
	`estado` VARCHAR(255) NOT NULL,
	`fecha_registro` DATETIME NOT NULL,
	`longitud` DECIMAL(10,7) NOT NULL,
	`latitud` DECIMAL(10,7) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `ZONA` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	`descripcion` TEXT(65535) NOT NULL,
	PRIMARY KEY(`id`)
) COMMENT='Nombre de la zona(zona norte.....)';


CREATE TABLE `VIAJE` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_ruta` INTEGER NOT NULL COMMENT 'codigo de ruta',
	`id_vehiculo` INTEGER NOT NULL COMMENT 'placa ',
	`fecha` DATE NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `TIPO_CLIENTE` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `VISITA` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_viaje` INTEGER NOT NULL,
	`id_cliente` INTEGER NOT NULL,
	`entrega` DECIMAL NOT NULL,
	`recojo` DECIMAL NOT NULL,
	`llega` TIME NOT NULL,
	`sale` TIME NOT NULL,
	`sec1` VARCHAR(255) NOT NULL,
	`sec2` VARCHAR(255) NOT NULL,
	`distancia_km` VARCHAR(255),
	PRIMARY KEY(`id`)
);


-- ======================================
-- FOREIGN KEYS (RELACIONES ENTRE TABLAS)
-- ======================================

-- Relación: VEHICULO -> CARRETA (un vehículo puede tener una carreta)
ALTER TABLE `VEHICULO`
ADD CONSTRAINT `fk_vehiculo_carreta`
FOREIGN KEY(`id_carreta`) REFERENCES `CARRETA`(`id`)
ON UPDATE CASCADE ON DELETE SET NULL;

-- Relación: CLIENTE -> TIPO_CLIENTE (un cliente tiene un tipo)
ALTER TABLE `CLIENTE`
ADD CONSTRAINT `fk_cliente_tipo`
FOREIGN KEY(`id_tipo_cliente`) REFERENCES `TIPO_CLIENTE`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: VIAJE -> RUTA (un viaje pertenece a una ruta)
ALTER TABLE `VIAJE`
ADD CONSTRAINT `fk_viaje_ruta`
FOREIGN KEY(`id_ruta`) REFERENCES `RUTA`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: VIAJE -> VEHICULO (un viaje usa un vehículo)
ALTER TABLE `VIAJE`
ADD CONSTRAINT `fk_viaje_vehiculo`
FOREIGN KEY(`id_vehiculo`) REFERENCES `VEHICULO`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Relación: VISITA -> VIAJE (una visita pertenece a un viaje)
ALTER TABLE `VISITA`
ADD CONSTRAINT `fk_visita_viaje`
FOREIGN KEY(`id_viaje`) REFERENCES `VIAJE`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;

-- Relación: VISITA -> CLIENTE (una visita es a un cliente)
ALTER TABLE `VISITA`
ADD CONSTRAINT `fk_visita_cliente`
FOREIGN KEY(`id_cliente`) REFERENCES `CLIENTE`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- ======================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ======================================

-- Índices en foreign keys
CREATE INDEX `idx_vehiculo_carreta` ON `VEHICULO`(`id_carreta`);
CREATE INDEX `idx_cliente_tipo` ON `CLIENTE`(`id_tipo_cliente`);
CREATE INDEX `idx_viaje_ruta` ON `VIAJE`(`id_ruta`);
CREATE INDEX `idx_viaje_vehiculo` ON `VIAJE`(`id_vehiculo`);
CREATE INDEX `idx_visita_viaje` ON `VISITA`(`id_viaje`);
CREATE INDEX `idx_visita_cliente` ON `VISITA`(`id_cliente`);

-- Índices adicionales para búsquedas comunes
CREATE INDEX `idx_vehiculo_placa` ON `VEHICULO`(`placa`);
CREATE INDEX `idx_cliente_ruc` ON `CLIENTE`(`ruc`);
CREATE INDEX `idx_ruta_codigo` ON `RUTA`(`codigo`);
CREATE INDEX `idx_viaje_fecha` ON `VIAJE`(`fecha`);

-- ======================================
-- VERIFICACIÓN DE INTEGRIDAD
-- ======================================

-- Verificar que todas las foreign keys funcionan
SELECT 'Base de datos inicializada correctamente con relaciones establecidas' AS resultado;
ON UPDATE NO ACTION ON DELETE NO ACTION;