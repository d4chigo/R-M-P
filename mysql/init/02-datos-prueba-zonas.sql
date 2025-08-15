-- ==============================
-- SCRIPT SQL - DATOS DE PRUEBA PARA ZONAS
-- Archivo: 02-datos-prueba-zonas.sql
-- Descripción: Inserta datos de prueba para la tabla ZONA con coordenadas reales de Lima
-- ==============================

-- Eliminar datos existentes (opcional para testing)
-- DELETE FROM ZONA;

-- ==============================
-- INSERTAR ZONAS DE PRUEBA CON COORDENADAS
-- ==============================

INSERT INTO ZONA (codigo, descripcion, latitud, longitud) VALUES
('ZN001', 'Zona Norte de Lima - Incluye Los Olivos, Independencia, San Martín de Porres y Comas. Área residencial y comercial con alta densidad poblacional.', -11.9608, -77.0467),
('ZS001', 'Zona Sur de Lima - Comprende Villa El Salvador, San Juan de Miraflores, Villa María del Triunfo y Chorrillos. Zona en crecimiento urbano.', -12.1694, -76.9897),
('ZE001', 'Zona Este de Lima - Abarca Ate, Santa Anita, El Agustino y San Juan de Lurigancho. Principal área industrial y residencial emergente.', -12.0432, -76.9574),
('ZO001', 'Zona Oeste de Lima - Incluye Magdalena del Mar, Pueblo Libre, Jesús María y Breña. Zona histórica y residencial consolidada.', -12.0683, -77.0847),
('ZC001', 'Zona Centro de Lima - Lima Cercado, Rímac y parte del Centro Histórico. Área comercial y administrativa principal de la capital.', -12.0464, -77.0428),

-- Callao
('CL001', 'Callao Puerto - Zona portuaria principal del país. Incluye terminales marítimos, aeroportuario y zona industrial pesada.', -12.0619, -77.1286),
('CL002', 'Callao Centro - Área comercial y residencial del Callao. Centro administrativo de la Provincia Constitucional del Callao.', -12.0533, -77.1231),
('CL003', 'Ventanilla - Distrito al norte del Callao. Zona residencial en expansión con importantes proyectos de vivienda social.', -11.8897, -77.1547),

-- Lima Moderna
('LC001', 'La Molina - Distrito residencial de clase alta. Importante centro educativo con universidades y colegios prestigiosos.', -12.0769, -76.9431),
('LC002', 'San Borja - Zona residencial y empresarial moderna. Centro financiero y comercial con importantes edificios corporativos.', -12.0983, -76.9967),
('LC003', 'Miraflores - Principal distrito turístico y comercial. Centro de negocios, hoteles, restaurantes y zona de playa.', -12.1197, -77.0285),
('LC004', 'San Isidro - Distrito financiero y residencial exclusivo. Sede de bancos, empresas multinacionales y embajadas.', -12.0986, -77.0375),
('LC005', 'Santiago de Surco - Distrito residencial y comercial moderno. Importante zona de centros comerciales y oficinas.', -12.1361, -76.9947),

-- Zonas Especializadas
('ZI001', 'Zona Industrial Ate - Principal parque industrial de Lima Este. Concentra fábricas, almacenes y centros de distribución.', -12.0167, -76.9206),
('ZR001', 'Zona Residencial Norte - Comprende Ancón, Santa Rosa y Puente Piedra. Zona residencial de playa y recreación.', -11.7667, -77.1667),
('ZR002', 'Zona Residencial Sur - Incluye Lurín, Pachacámac y zonas rurales del sur. Área de expansión urbana y agrícola.', -12.2789, -76.8647),
('ZC002', 'Zona Comercial Este - San Luis, La Victoria (zona comercial) y Cercado. Principal área de comercio mayorista.', -12.0742, -77.0075),
('ZC003', 'Zona Comercial Oeste - Magdalena, San Miguel y parte de Pueblo Libre. Centros comerciales y negocios locales.', -12.0833, -77.0914),

-- Provincias y Periferias
('PR001', 'Provincia Lima Norte - Incluye Carabayllo, Puente Piedra y Santa Rosa. Zona de expansión urbana hacia el norte.', -11.8561, -77.0428),
('PR002', 'Provincia Lima Sur - Comprende Lurín, Pachacámac y Villa María del Triunfo (zona sur). Área rural y semi-urbana.', -12.2844, -76.8656),
('ZP001', 'Zona Periférica Norte - Área de expansión urbana no planificada. Incluye asentamientos humanos y pueblos jóvenes del norte.', -11.9167, -77.0167),
('ZP002', 'Zona Periférica Sur - Zona de crecimiento urbano hacia el sur. Incluye nuevas urbanizaciones y proyectos habitacionales.', -12.2167, -76.9167),
('ZP003', 'Zona Periférica Este - Área de expansión hacia las estribaciones andinas. Incluye Chaclacayo, Cieneguilla y zona rural.', -12.0167, -76.8167),
('ZP004', 'Zona Periférica Oeste - Zona costera hacia el norte y sur del Callao. Incluye playas y balnearios.', -12.0167, -77.1667),
('ZE002', 'Zona Empresarial - Concentración de parques empresariales e industriales. Incluye centros logísticos y de distribución.', -12.0333, -76.9833);

-- ==============================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ==============================

-- Mostrar resumen de zonas insertadas
SELECT
    COUNT(*) as total_zonas,
    MIN(created_at) as primera_zona,
    MAX(created_at) as ultima_zona,
    COUNT(CASE WHEN latitud IS NOT NULL AND longitud IS NOT NULL THEN 1 END) as zonas_con_coordenadas
FROM ZONA;

-- Mostrar todas las zonas ordenadas por código
SELECT
    id_zona,
    codigo,
    LEFT(descripcion, 50) as descripcion_corta,
    latitud,
    longitud,
    created_at
FROM ZONA
ORDER BY codigo;

-- Verificar rango de coordenadas (deben estar en Lima)
SELECT
    MIN(latitud) as lat_min,
    MAX(latitud) as lat_max,
    MIN(longitud) as lng_min,
    MAX(longitud) as lng_max
FROM ZONA
WHERE latitud IS NOT NULL AND longitud IS NOT NULL;

-- ==============================
-- ESTADÍSTICAS DE COORDENADAS
-- ==============================

-- Zonas por cuadrante geográfico
SELECT
    CASE
        WHEN latitud > -12.0 AND longitud > -77.0 THEN 'Noreste'
        WHEN latitud > -12.0 AND longitud <= -77.0 THEN 'Noroeste'
        WHEN latitud <= -12.0 AND longitud > -77.0 THEN 'Sureste'
        ELSE 'Suroeste'
    END as cuadrante,
    COUNT(*) as cantidad_zonas
FROM ZONA
WHERE latitud IS NOT NULL AND longitud IS NOT NULL
GROUP BY
    CASE
        WHEN latitud > -12.0 AND longitud > -77.0 THEN 'Noreste'
        WHEN latitud > -12.0 AND longitud <= -77.0 THEN 'Noroeste'
        WHEN latitud <= -12.0 AND longitud > -77.0 THEN 'Sureste'
        ELSE 'Suroeste'
    END;

-- ==============================
-- COMENTARIOS SOBRE LAS ZONAS
-- ==============================

/*
Zonas creadas con coordenadas reales de Lima Metropolitana:

ZONAS PRINCIPALES:
- ZN001: Zona Norte Lima (-11.9608, -77.0467)
- ZS001: Zona Sur Lima (-12.1694, -76.9897)
- ZE001: Zona Este Lima (-12.0432, -76.9574)
- ZO001: Zona Oeste Lima (-12.0683, -77.0847)
- ZC001: Zona Centro Lima (-12.0464, -77.0428)

CALLAO:
- CL001: Callao Puerto (-12.0619, -77.1286)
- CL002: Callao Centro (-12.0533, -77.1231)
- CL003: Ventanilla (-11.8897, -77.1547)

LIMA MODERNA:
- LC001: La Molina (-12.0769, -76.9431)
- LC002: San Borja (-12.0983, -76.9967)
- LC003: Miraflores (-12.1197, -77.0285)
- LC004: San Isidro (-12.0986, -77.0375)
- LC005: Surco (-12.1361, -76.9947)

ZONAS ESPECIALIZADAS:
- ZI001: Zona Industrial Ate (-12.0167, -76.9206)
- ZR001-002: Zonas Residenciales Norte y Sur
- ZC002-003: Zonas Comerciales Este y Oeste
- PR001-002: Provincias Lima Norte y Sur
- ZP001-004: Zonas Periféricas
- ZE002: Zona Empresarial (-12.0333, -76.9833)

CARACTERÍSTICAS:
- Total: 25 zonas con coordenadas GPS reales
- Cobertura: Lima Metropolitana y Callao
- Rango latitud: -11.77° a -12.28° (Norte a Sur)
- Rango longitud: -76.82° a -77.17° (Este a Oeste)
- Todas las coordenadas corresponden a ubicaciones reales en Lima

COORDENADAS ESPECIALES:
- Centro de Lima: -12.0464, -77.0428 (Plaza de Armas)
- Aeropuerto: -12.0619, -77.1286 (incluido en Callao Puerto)
- Puerto: -12.0619, -77.1286 (Terminal Portuario del Callao)
- Zona más al Norte: Ventanilla (-11.8897, -77.1547)
- Zona más al Sur: Provincia Lima Sur (-12.2844, -76.8656)
- Zona más al Este: Zona Periférica Este (-12.0167, -76.8167)
- Zona más al Oeste: Zona Periférica Oeste (-12.0167, -77.1667)
*/
