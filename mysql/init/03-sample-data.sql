-- Script para insertar datos de ejemplo adicionales
-- Este archivo se ejecuta después del script de inicialización principal

USE rmp_db;

-- Verificar que las tablas básicas existen
SELECT 'Insertando datos de ejemplo...' AS mensaje;

-- Insertar carretas adicionales si no existen
INSERT IGNORE INTO CARRETA (id, placa, tipo, capacidad_kg, estado, created_by) VALUES
(1, 'CAR-001', 'Remolque', 15000, 'Activo', 1),
(2, 'CAR-002', 'Semirremolque', 25000, 'Activo', 1),
(3, 'CAR-003', 'Trailer', 30000, 'Activo', 1),
(4, 'CAR-004', 'Remolque', 12000, 'Activo', 1),
(5, 'CAR-005', 'Semirremolque', 28000, 'Activo', 1);

-- Insertar vehículos adicionales si no existen
INSERT IGNORE INTO VEHICULO (id, placa, marca, modelo, anio, tipo, capacidad_carga_kg, tipo_carga, estado, fecha_adquisicion, vin, id_carreta, created_by) VALUES
(1, 'ABC-123', 'Volvo', 'FH16', 2020, 'Tractocamión', 20000, 'General', 'Activo', '2020-01-15', '1HGCM82633A004352', 1, 1),
(2, 'DEF-456', 'Scania', 'R450', 2019, 'Tractocamión', 18000, 'General', 'Activo', '2019-06-20', '2HGCM82633A004353', 2, 1),
(3, 'GHI-789', 'Mercedes', 'Actros', 2021, 'Tractocamión', 22000, 'General', 'Activo', '2021-03-10', '3HGCM82633A004354', 3, 1),
(4, 'JKL-012', 'Freightliner', 'Cascadia', 2020, 'Tractocamión', 19000, 'General', 'Activo', '2020-08-05', '4HGCM82633A004355', 4, 1),
(5, 'MNO-345', 'Kenworth', 'T680', 2022, 'Tractocamión', 21000, 'General', 'Activo', '2022-02-12', '5HGCM82633A004356', 5, 1);

-- Insertar rutas adicionales si no existen
INSERT IGNORE INTO RUTA (id, codigo, nombre, origen, destino, distancia_km, duracion_aproximada, tipo_ruta, estado, fecha_creacion, created_by) VALUES
(1, 'RUT-001', 'Lima - Arequipa', 'Lima', 'Arequipa', 1020, '12:00:00', 'Nacional', 'Activo', '2024-01-01 08:00:00', 1),
(2, 'RUT-002', 'Lima - Cusco', 'Lima', 'Cusco', 1165, '14:00:00', 'Nacional', 'Activo', '2024-01-01 08:00:00', 1),
(3, 'RUT-003', 'Lima - Trujillo', 'Lima', 'Trujillo', 561, '07:00:00', 'Nacional', 'Activo', '2024-01-01 08:00:00', 1),
(4, 'RUT-004', 'Lima - Piura', 'Lima', 'Piura', 973, '11:00:00', 'Nacional', 'Activo', '2024-01-01 08:00:00', 1),
(5, 'RUT-005', 'Lima - Iquitos', 'Lima', 'Iquitos', 1356, '16:00:00', 'Nacional', 'Activo', '2024-01-01 08:00:00', 1);

-- Insertar clientes de ejemplo
INSERT IGNORE INTO CLIENTE (id, nombre, codigo, id_tipo_cliente, id_zona_pvta, id_zona_tvta, ruc, ciudad, telefono, email, contacto_nombre, horario, estado, latitud, longitud, created_by) VALUES
(1, 'Distribuidora Central S.A.C.', 'CLI001', 1, 1, 1, '20123456789', 'Lima', '+51-1-2345678', 'contacto@distribuidora.com', 'Juan Pérez', 'Lunes a Viernes 8:00 AM - 6:00 PM', 'Activo', -12.0464, -77.0428, 1),
(2, 'Comercial Norte EIRL', 'CLI002', 2, 2, 2, '20987654321', 'Trujillo', '+51-44-123456', 'ventas@comercialnorte.com', 'María García', 'Lunes a Sábado 7:00 AM - 7:00 PM', 'Activo', -8.1116, -79.0292, 1),
(3, 'Logística Sur SAC', 'CLI003', 3, 3, 3, '20456789123', 'Arequipa', '+51-54-789012', 'operaciones@logisticasur.com', 'Carlos Rodríguez', 'Lunes a Viernes 8:30 AM - 5:30 PM', 'Activo', -16.4090, -71.5375, 1),
(4, 'Importaciones Este S.A.', 'CLI004', 1, 4, 4, '20789123456', 'Huancayo', '+51-64-345678', 'admin@importeste.com', 'Ana López', 'Lunes a Viernes 9:00 AM - 6:00 PM', 'Activo', -12.0653, -75.2049, 1),
(5, 'Distribuciones Oeste EIRL', 'CLI005', 2, 5, 5, '20654321987', 'Lima', '+51-1-8765432', 'contacto@distoeste.com', 'Pedro Martínez', 'Lunes a Viernes 8:00 AM - 7:00 PM', 'Activo', -12.0464, -77.0428, 1);

-- Insertar viajes de ejemplo
INSERT IGNORE INTO VIAJE (id, id_ruta, ruta, id_vehiculo, vehiculo, fecha, id_repartidor, created_by) VALUES
(1, 1, 'Lima - Arequipa', 1, 'ABC-123', '2024-12-20', 1, 1),
(2, 2, 'Lima - Cusco', 2, 'DEF-456', '2024-12-21', 2, 1),
(3, 3, 'Lima - Trujillo', 3, 'GHI-789', '2024-12-22', 1, 1),
(4, 4, 'Lima - Piura', 4, 'JKL-012', '2024-12-23', 2, 1),
(5, 5, 'Lima - Iquitos', 5, 'MNO-345', '2024-12-24', 1, 1);

-- Insertar visitas de ejemplo
INSERT IGNORE INTO VISITA (id, id_viaje, id_cliente, entrega, recojo, llega, sale, sec1, sec2, distancia_km, created_by) VALUES
(1, 1, 1, 1500.50, 800.25, '08:30:00', '10:15:00', 'SEC001', 'SEC002', 25.5, 1),
(2, 1, 3, 2200.75, 1100.00, '14:00:00', '15:30:00', 'SEC003', 'SEC004', 15.2, 1),
(3, 2, 2, 1800.00, 900.50, '09:00:00', '11:45:00', 'SEC005', 'SEC006', 35.8, 1),
(4, 3, 4, 1200.25, 600.75, '07:45:00', '09:30:00', 'SEC007', 'SEC008', 28.3, 1),
(5, 4, 5, 3000.00, 1500.00, '10:15:00', '12:00:00', 'SEC009', 'SEC010', 42.1, 1);

-- Verificar que los datos se insertaron correctamente
SELECT 'Datos de ejemplo insertados correctamente:' AS mensaje;

SELECT 'CARRETAS:' AS tabla, COUNT(*) as total FROM CARRETA
UNION ALL
SELECT 'VEHÍCULOS:', COUNT(*) FROM VEHICULO
UNION ALL
SELECT 'RUTAS:', COUNT(*) FROM RUTA
UNION ALL
SELECT 'CLIENTES:', COUNT(*) FROM CLIENTE
UNION ALL
SELECT 'VIAJES:', COUNT(*) FROM VIAJE
UNION ALL
SELECT 'VISITAS:', COUNT(*) FROM VISITA
UNION ALL
SELECT 'TIPOS CLIENTE:', COUNT(*) FROM TIPO_CLIENTE
UNION ALL
SELECT 'ZONAS:', COUNT(*) FROM ZONA
UNION ALL
SELECT 'USUARIOS:', COUNT(*) FROM USUARIO;

-- Mostrar algunos datos de ejemplo
SELECT 'Ejemplos de rutas disponibles:' AS info;
SELECT id, codigo, nombre, origen, destino FROM RUTA LIMIT 5;

SELECT 'Ejemplos de vehículos disponibles:' AS info;
SELECT id, placa, marca, modelo, estado FROM VEHICULO LIMIT 5;

SELECT 'Ejemplos de clientes disponibles:' AS info;
SELECT id, codigo, nombre, ruc, ciudad FROM CLIENTE LIMIT 5;

-- Script completado exitosamente
SELECT 'Script de datos de ejemplo completado exitosamente' AS resultado;
