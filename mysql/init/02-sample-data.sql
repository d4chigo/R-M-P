-- ==============================
-- SCRIPT SQL - RMP (Route Management Platform)
-- Archivo: 02-sample-data.sql
-- Descripción: Datos de prueba para el sistema RMP
-- Compatible con la estructura 01-init.sql
-- ==============================

-- ==============================
-- INSERTAR DATOS EN TABLA ROL
-- ==============================

INSERT INTO ROL (nombre, descripcion) VALUES
('administrador', 'Acceso completo al sistema'),
('operador', 'Acceso a operaciones diarias'),
('usuario', 'Acceso básico de consulta');

-- ==============================
-- INSERTAR RELACIONES USUARIO-ROL
-- ==============================

-- Asignar rol de administrador al usuario admin
INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES
(1, 1), -- admin es administrador
(2, 2); -- demo es operador

-- ==============================
-- INSERTAR DATOS EN TABLA ZONA
-- ==============================

INSERT INTO ZONA (codigo, nombre) VALUES
('Z001', 'Centro Histórico'),
('Z002', 'Norte Industrial'),
('Z003', 'Sur Residencial'),
('Z004', 'Este Comercial'),
('Z005', 'Oeste Periférico'),
('Z006', 'Callao Puerto'),
('Z007', 'San Juan de Lurigancho'),
('Z008', 'Villa El Salvador'),
('Z009', 'Comas'),
('Z010', 'San Martín de Porres');

-- ==============================
-- INSERTAR DATOS EN TABLA VEHICULO
-- ==============================

INSERT INTO VEHICULO (placa, marca, modelo, anio, capacidad_kg, capacidad_cajas, activo) VALUES
('ABC-123', 'Hyundai', 'HD78', 2020, 3500.00, 120, TRUE),
('DEF-456', 'Mitsubishi', 'Canter', 2019, 3000.00, 100, TRUE),
('GHI-789', 'Isuzu', 'NPR', 2021, 4000.00, 150, TRUE),
('JKL-012', 'Hyundai', 'HD65', 2018, 2800.00, 90, TRUE),
('MNO-345', 'Mitsubishi', 'Fuso', 2020, 3200.00, 110, TRUE),
('PQR-678', 'Isuzu', 'ELF', 2019, 2500.00, 80, TRUE),
('STU-901', 'Hyundai', 'HD78', 2021, 3500.00, 120, TRUE),
('VWX-234', 'Mitsubishi', 'Canter', 2020, 3000.00, 100, TRUE),
('YZA-567', 'Isuzu', 'NPR', 2018, 4000.00, 150, FALSE), -- Inactivo
('BCD-890', 'Hyundai', 'HD65', 2019, 2800.00, 90, TRUE);

-- ==============================
-- INSERTAR DATOS EN TABLA REPARTIDOR
-- ==============================

INSERT INTO REPARTIDOR (codigo, nombre, dni, licencia_conducir, telefono, activo) VALUES
('REP001', 'Carlos Mendoza López', '12345678', 'Q12345678', '987654321', TRUE),
('REP002', 'José Antonio Ruiz', '23456789', 'Q23456789', '987654322', TRUE),
('REP003', 'Miguel Ángel Torres', '34567890', 'Q34567890', '987654323', TRUE),
('REP004', 'Luis Fernando García', '45678901', 'Q45678901', '987654324', TRUE),
('REP005', 'Roberto Carlos Silva', '56789012', 'Q56789012', '987654325', TRUE),
('REP006', 'Fernando José Chávez', '67890123', 'Q67890123', '987654326', TRUE),
('REP007', 'Antonio Miguel Vargas', '78901234', 'Q78901234', '987654327', TRUE),
('REP008', 'Pedro Luis Morales', '89012345', 'Q89012345', '987654328', TRUE),
('REP009', 'Juan Carlos Herrera', '90123456', 'Q90123456', '987654329', FALSE), -- Inactivo
('REP010', 'Daniel Alberto Ramos', '01234567', 'Q01234567', '987654330', TRUE);

-- ==============================
-- INSERTAR DATOS EN TABLA CLIENTE
-- ==============================

INSERT INTO CLIENTE (codigo, nombre, direccion, id_zona, activo) VALUES
-- Zona Centro Histórico (Z001)
('CLI001', 'Supermercado Plaza Vea Centro', 'Jr. de la Unión 1050, Lima', 1, TRUE),
('CLI002', 'Metro Jirón de la Unión', 'Jr. de la Unión 926, Lima', 1, TRUE),
('CLI003', 'Tambo+ Centro', 'Jr. Carabaya 578, Lima', 1, TRUE),

-- Zona Norte Industrial (Z002)
('CLI004', 'Makro Independencia', 'Av. Túpac Amaru 3500, Independencia', 2, TRUE),
('CLI005', 'Tottus Independencia', 'Av. Carlos Izaguirre 233, Independencia', 2, TRUE),
('CLI006', 'Wong Los Olivos', 'Av. Alfredo Mendiola 3698, Los Olivos', 2, TRUE),

-- Zona Sur Residencial (Z003)
('CLI007', 'Plaza Vea Villa El Salvador', 'Av. César Vallejo 1345, Villa El Salvador', 3, TRUE),
('CLI008', 'Metro Villa María', 'Av. Villa María s/n, Villa María del Triunfo', 3, TRUE),
('CLI009', 'Tottus San Juan de Miraflores', 'Av. Salvador Allende 650, San Juan de Miraflores', 3, TRUE),

-- Zona Este Comercial (Z004)
('CLI010', 'Supermercados Peruanos Santa Anita', 'Av. Carretera Central km 8.5, Santa Anita', 4, TRUE),
('CLI011', 'Metro Ate Vitarte', 'Av. Nicolás Ayllón 3916, Ate', 4, TRUE),
('CLI012', 'Wong La Molina', 'Av. Javier Prado Este 4200, La Molina', 4, TRUE),

-- Zona Oeste Periférico (Z005)
('CLI013', 'Plaza Vea Callao', 'Av. Oscar R. Benavides 5915, Callao', 5, TRUE),
('CLI014', 'Metro Bellavista', 'Av. Óscar R. Benavides 3866, Bellavista', 5, TRUE),
('CLI015', 'Tottus Ventanilla', 'Av. Néstor Gambetta 5900, Ventanilla', 5, TRUE),

-- Zona Callao Puerto (Z006)
('CLI016', 'Minimarket Puerto Callao', 'Jr. Miller 456, Callao', 6, TRUE),
('CLI017', 'Bodega San Martín', 'Av. Sáenz Peña 234, Callao', 6, TRUE),
('CLI018', 'Mercado Central Callao', 'Jr. Colón 567, Callao', 6, TRUE),

-- Zona San Juan de Lurigancho (Z007)
('CLI019', 'Plaza Vea SJL', 'Av. Las Flores de Primavera 1050, San Juan de Lurigancho', 7, TRUE),
('CLI020', 'Metro Zárate', 'Av. Próceres de la Independencia 2950, San Juan de Lurigancho', 7, TRUE),

-- Zona Villa El Salvador (Z008)
('CLI021', 'Supermercado El Súper', 'Av. Revolución s/n, Villa El Salvador', 8, TRUE),
('CLI022', 'Minimarket Villa', 'Av. César Vallejo 789, Villa El Salvador', 8, TRUE),

-- Zona Comas (Z009)
('CLI023', 'Plaza Vea Comas', 'Av. Túpac Amaru 7800, Comas', 9, TRUE),
('CLI024', 'Metro Comas', 'Av. Universitaria Norte 5500, Comas', 9, TRUE),

-- Zona San Martín de Porres (Z010)
('CLI025', 'Tottus Fiori', 'Av. Canta Callao 1340, San Martín de Porres', 10, TRUE),
('CLI026', 'Wong Pro', 'Av. Eduardo de Habich 650, San Martín de Porres', 10, FALSE); -- Inactivo

-- ==============================
-- INSERTAR DATOS EN TABLA VIAJE
-- ==============================

-- Viajes para la semana pasada (lunes a viernes)
-- Lunes
INSERT INTO VIAJE (fecha, id_vehiculo, id_repartidor, nro_viaje, salida_cd, llegada_cd, distancia_km, tiempo_manejo_min, tiempo_servicio_min, recarga_min, refrigerio_min, tipo_viaje, created_by) VALUES
('2024-01-15', 1, 1, 1, '2024-01-15 08:00:00', '2024-01-15 16:30:00', 85.5, 180, 320, 30, 60, 'Regular', 1),
('2024-01-15', 2, 2, 1, '2024-01-15 08:15:00', '2024-01-15 17:00:00', 92.3, 195, 350, 25, 45, 'Regular', 1),
('2024-01-15', 3, 3, 1, '2024-01-15 07:45:00', '2024-01-15 16:15:00', 78.2, 165, 280, 35, 55, 'Express', 1),
('2024-01-15', 4, 4, 1, '2024-01-15 08:30:00', '2024-01-15 17:15:00', 105.7, 220, 380, 40, 50, 'Regular', 1),

-- Martes
('2024-01-16', 1, 1, 1, '2024-01-16 08:00:00', '2024-01-16 16:45:00', 88.3, 185, 335, 28, 65, 'Regular', 1),
('2024-01-16', 2, 2, 1, '2024-01-16 08:10:00', '2024-01-16 16:50:00', 94.1, 200, 340, 30, 40, 'Regular', 1),
('2024-01-16', 5, 5, 1, '2024-01-16 07:50:00', '2024-01-16 16:30:00', 82.6, 170, 295, 32, 58, 'Express', 1),
('2024-01-16', 6, 6, 1, '2024-01-16 08:20:00', '2024-01-16 17:10:00', 99.4, 210, 365, 38, 52, 'Regular', 1),

-- Miércoles
('2024-01-17', 3, 3, 1, '2024-01-17 08:05:00', '2024-01-17 16:35:00', 86.7, 175, 315, 33, 62, 'Regular', 1),
('2024-01-17', 4, 4, 1, '2024-01-17 08:25:00', '2024-01-17 17:05:00', 91.8, 190, 355, 35, 48, 'Regular', 1),
('2024-01-17', 7, 7, 1, '2024-01-17 07:55:00', '2024-01-17 16:25:00', 79.5, 160, 285, 30, 55, 'Express', 1),
('2024-01-17', 8, 8, 1, '2024-01-17 08:15:00', '2024-01-17 16:55:00', 103.2, 215, 375, 42, 50, 'Regular', 1),

-- Jueves
('2024-01-18', 1, 2, 1, '2024-01-18 08:00:00', '2024-01-18 16:40:00', 89.1, 180, 330, 29, 61, 'Regular', 1),
('2024-01-18', 2, 1, 1, '2024-01-18 08:20:00', '2024-01-18 17:00:00', 95.6, 205, 345, 31, 44, 'Regular', 1),
('2024-01-18', 5, 5, 1, '2024-01-18 07:45:00', '2024-01-18 16:20:00', 81.3, 168, 290, 34, 57, 'Express', 1),
('2024-01-18', 6, 6, 1, '2024-01-18 08:10:00', '2024-01-18 16:50:00', 97.8, 208, 360, 36, 51, 'Regular', 1),

-- Viernes
('2024-01-19', 3, 3, 1, '2024-01-19 08:05:00', '2024-01-19 16:30:00', 84.9, 172, 305, 31, 60, 'Regular', 1),
('2024-01-19', 4, 4, 1, '2024-01-19 08:30:00', '2024-01-19 17:20:00', 98.7, 212, 370, 39, 49, 'Regular', 1),
('2024-01-19', 7, 7, 1, '2024-01-19 07:50:00', '2024-01-19 16:15:00', 76.4, 155, 275, 28, 54, 'Express', 1),
('2024-01-19', 8, 8, 1, '2024-01-19 08:15:00', '2024-01-19 17:00:00', 101.5, 218, 385, 41, 53, 'Regular', 1);

-- ==============================
-- INSERTAR DATOS EN TABLA VISITA
-- ==============================

-- Visitas para el viaje 1 (ABC-123 con Carlos Mendoza - Lunes)
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by) VALUES
(1, 1, 15, 1250.50, 80.00, 450.00, 12.5, 1),
(1, 2, 8, 680.75, 45.50, 280.00, 8.3, 1),
(1, 3, 12, 950.00, 65.00, 320.00, 6.7, 1),
(1, 4, 20, 1680.25, 120.75, 580.00, 15.2, 1),
(1, 5, 6, 420.50, 30.00, 180.00, 4.8, 1);

-- Visitas para el viaje 2 (DEF-456 con José Antonio - Lunes)
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by) VALUES
(2, 6, 18, 1450.00, 95.25, 520.00, 14.1, 1),
(2, 7, 10, 780.50, 55.00, 350.00, 9.6, 1),
(2, 8, 14, 1120.75, 75.50, 420.00, 11.3, 1),
(2, 9, 22, 1850.00, 140.00, 650.00, 18.7, 1);

-- Visitas para el viaje 3 (GHI-789 con Miguel Ángel - Lunes)
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by) VALUES
(3, 10, 16, 1320.25, 85.00, 480.00, 13.2, 1),
(3, 11, 9, 720.00, 50.75, 300.00, 7.8, 1),
(3, 12, 13, 1050.50, 70.00, 380.00, 10.5, 1),
(3, 13, 7, 560.75, 38.50, 220.00, 5.9, 1);

-- Visitas para el viaje 4 (JKL-012 con Luis Fernando - Lunes)
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by) VALUES
(4, 14, 25, 2100.00, 160.00, 750.00, 22.1, 1),
(4, 15, 11, 880.25, 60.50, 320.00, 9.8, 1),
(4, 16, 8, 640.50, 42.00, 250.00, 6.4, 1),
(4, 17, 19, 1580.75, 110.25, 560.00, 16.8, 1);

-- Visitas para el viaje 5 (ABC-123 con Carlos Mendoza - Martes)
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by) VALUES
(5, 18, 17, 1380.00, 90.00, 500.00, 14.5, 1),
(5, 19, 12, 960.50, 68.25, 360.00, 10.2, 1),
(5, 20, 9, 750.75, 52.50, 280.00, 8.1, 1),
(5, 21, 14, 1150.00, 78.00, 420.00, 12.8, 1);

-- Visitas para el viaje 6 (DEF-456 con José Antonio - Martes)
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by) VALUES
(6, 22, 21, 1750.25, 125.75, 620.00, 19.3, 1),
(6, 23, 13, 1080.50, 72.00, 390.00, 11.6, 1),
(6, 24, 10, 820.75, 58.50, 310.00, 8.9, 1),
(6, 25, 16, 1280.00, 88.25, 460.00, 13.7, 1);

-- Continuar con más visitas para completar todos los viajes...
-- (Se pueden agregar más visitas según sea necesario)

-- ==============================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ==============================

-- Mostrar resumen de datos insertados
SELECT 'ZONAS' as tabla, COUNT(*) as registros FROM ZONA
UNION ALL
SELECT 'VEHICULOS' as tabla, COUNT(*) as registros FROM VEHICULO
UNION ALL
SELECT 'REPARTIDORES' as tabla, COUNT(*) as registros FROM REPARTIDOR
UNION ALL
SELECT 'CLIENTES' as tabla, COUNT(*) as registros FROM CLIENTE
UNION ALL
SELECT 'VIAJES' as tabla, COUNT(*) as registros FROM VIAJE
UNION ALL
SELECT 'VISITAS' as tabla, COUNT(*) as registros FROM VISITA;

-- Verificar que la vista funciona correctamente
SELECT
    COUNT(*) as total_registros_vista,
    MIN(Fecha) as fecha_minima,
    MAX(Fecha) as fecha_maxima
FROM v_resumen_rutas;

-- ==============================
-- COMENTARIOS FINALES
-- ==============================

/*
Este script de datos de prueba incluye:

1. 3 roles básicos del sistema
2. Relaciones usuario-rol para los usuarios por defecto
3. 10 zonas geográficas
4. 10 vehículos (9 activos, 1 inactivo)
5. 10 repartidores (9 activos, 1 inactivo)
6. 26 clientes distribuidos en diferentes zonas (25 activos, 1 inactivo)
7. 20 viajes de una semana de trabajo (lunes a viernes)
8. Visitas correspondientes a los primeros 6 viajes

Los datos están diseñados para:
- Probar todas las funcionalidades del sistema
- Generar reportes realistas
- Validar la vista v_resumen_rutas
- Permitir pruebas de diferentes escenarios
- Demostrar relaciones entre todas las entidades

Para agregar más datos de prueba, simplemente continúe el patrón
establecido en este script.
*/
