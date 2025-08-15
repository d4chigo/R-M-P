# INSTRUCCIONES DE PRUEBA - MÓDULO DE VIAJES

## 📋 Resumen
Este documento proporciona instrucciones paso a paso para probar el módulo de viajes completamente alineado con la base de datos.

---

## 🚀 INICIO RÁPIDO

### 1. Ejecutar el Script de Verificación
```bash
# Desde el directorio raíz del proyecto
node test-viajes-module.js
```

Este script verificará:
- ✅ Estructura de la base de datos
- ✅ Archivos del frontend
- ✅ Controlador del backend
- ✅ Definición de rutas API

---

## 🗄️ PREPARACIÓN DE LA BASE DE DATOS

### 1. Verificar Estructura de Tabla VIAJE
```sql
DESCRIBE VIAJE;
```

**Campos esperados:**
- `id_viaje` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `fecha` (DATE, NOT NULL)
- `id_vehiculo` (INT, NOT NULL, FK → VEHICULO)
- `id_repartidor` (INT, NOT NULL, FK → REPARTIDOR)
- `nro_viaje` (INT, NOT NULL)
- `salida_cd` (DATETIME)
- `llegada_cd` (DATETIME)
- `distancia_km` (DECIMAL(10,2))
- `tiempo_manejo_min` (INT)
- `tiempo_servicio_min` (INT)
- `recarga_min` (INT)
- `refrigerio_min` (INT)
- `tipo_viaje` (VARCHAR(50))
- `created_by` (INT, FK → USUARIO)
- `updated_by` (INT, FK → USUARIO)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. Verificar Datos Necesarios
```sql
-- Verificar que existan vehículos activos
SELECT COUNT(*) as vehiculos_activos FROM VEHICULO WHERE activo = 1;

-- Verificar que existan repartidores activos
SELECT COUNT(*) as repartidores_activos FROM REPARTIDOR WHERE activo = 1;

-- Verificar usuarios para created_by/updated_by
SELECT COUNT(*) as usuarios FROM USUARIO WHERE activo = 1;
```

### 3. Insertar Datos de Prueba (si es necesario)
```sql
-- Ejemplo de vehículo de prueba
INSERT INTO VEHICULO (placa, marca, modelo, anio, capacidad_kg, capacidad_cajas, activo)
VALUES ('ABC123', 'Toyota', 'Hiace', 2022, 1500.00, 50, 1);

-- Ejemplo de repartidor de prueba
INSERT INTO REPARTIDOR (codigo, nombre, dni, telefono, activo)
VALUES ('REP001', 'Juan Pérez', '12345678', '987654321', 1);
```

---

## 🎨 PRUEBAS DEL FRONTEND

### 1. Iniciar el Servidor de Desarrollo
```bash
cd client
npm run dev
```

### 2. Acceder al Módulo de Viajes
- URL: `http://localhost:3000/viajes`
- Verificar que la página cargue sin errores

### 3. Probar Funcionalidades

#### ✅ **Visualización de Lista**
- [ ] La tabla muestra columnas: ID, Fecha, N° Viaje, Vehículo, Repartidor, Horarios, Detalles
- [ ] Los badges de estado funcionan correctamente (Programado/En Curso/Completado)
- [ ] Los iconos se muestran correctamente (Truck, User, Clock, MapPin)
- [ ] La información de vehículos incluye: placa, marca, modelo, capacidades
- [ ] La información de repartidores incluye: nombre, código, teléfono

#### ✅ **Crear Nuevo Viaje**
1. Hacer clic en "Nuevo Viaje"
2. Verificar que el formulario muestre:
   - [ ] Campo fecha (obligatorio)
   - [ ] Selector de vehículo con vehículos activos (obligatorio)
   - [ ] Selector de repartidor con repartidores activos (obligatorio)
   - [ ] Campo número de viaje (obligatorio)
   - [ ] Campos de horarios (opcionales)
   - [ ] Campo distancia (opcional)
   - [ ] Selector tipo de viaje (opcional)
   - [ ] Campos de tiempos (opcional)

3. **Pruebas de Validación:**
   - [ ] Dejar campos obligatorios vacíos → debe mostrar errores
   - [ ] Ingresar valores negativos en distancia/tiempos → debe mostrar warnings
   - [ ] Seleccionar llegada anterior a salida → debe mostrar warning
   - [ ] Crear viaje con datos válidos → debe funcionar

#### ✅ **Editar Viaje Existente**
1. Hacer clic en el botón de editar de un viaje
2. Verificar que:
   - [ ] Los campos se pre-llenan con datos existentes
   - [ ] Las validaciones funcionan igual que en creación
   - [ ] Los cambios se guardan correctamente

#### ✅ **Eliminar Viaje**
1. **Caso 1: Viaje sin referencias**
   - Hacer clic en eliminar
   - [ ] Debe mostrar dialog de confirmación con datos del viaje
   - [ ] Al confirmar, debe eliminar exitosamente

2. **Caso 2: Viaje con visitas asociadas**
   - Crear visitas para un viaje (tabla VISITA)
   - Intentar eliminar el viaje
   - [ ] Debe mostrar alerta explicativa detallada
   - [ ] Debe mencionar cantidad de visitas y clientes afectados
   - [ ] Debe explicar cómo resolver el problema
   - [ ] NO debe permitir la eliminación

#### ✅ **Búsqueda y Filtros**
- [ ] Búsqueda por placa de vehículo funciona
- [ ] Búsqueda por nombre de repartidor funciona
- [ ] Búsqueda por tipo de viaje funciona
- [ ] Filtro por fecha funciona
- [ ] Ordenamiento por columnas funciona

---

## ⚙️ PRUEBAS DEL BACKEND

### 1. Iniciar el Servidor Backend
```bash
cd server
npm start
```

### 2. Probar Endpoints con curl o Postman

#### ✅ **GET /api/viajes**
```bash
curl -X GET http://localhost:4000/api/viajes \
  -H "Content-Type: application/json"
```
**Verificar:**
- [ ] Retorna lista de viajes con información completa
- [ ] Incluye datos de vehículos (placa, marca, modelo)
- [ ] Incluye datos de repartidores (código, nombre)
- [ ] Incluye información de usuarios creadores

#### ✅ **GET /api/viajes/:id**
```bash
curl -X GET http://localhost:4000/api/viajes/1 \
  -H "Content-Type: application/json"
```
**Verificar:**
- [ ] Retorna viaje específico con todos los campos
- [ ] Error 404 para IDs inexistentes

#### ✅ **POST /api/viajes**
```bash
curl -X POST http://localhost:4000/api/viajes \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-12-20",
    "id_vehiculo": 1,
    "id_repartidor": 1,
    "nro_viaje": 1,
    "tipo_viaje": "ENTREGA",
    "distancia_km": 25.5
  }'
```
**Verificar:**
- [ ] Crea viaje exitosamente
- [ ] Valida campos obligatorios
- [ ] Valida existencia de vehículo y repartidor
- [ ] Previene duplicados (mismo vehículo, fecha, número de viaje)

#### ✅ **PUT /api/viajes/:id**
```bash
curl -X PUT http://localhost:4000/api/viajes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "distancia_km": 30.0,
    "tipo_viaje": "MIXTO"
  }'
```
**Verificar:**
- [ ] Actualiza campos específicos
- [ ] Mantiene campos no modificados
- [ ] Actualiza updated_at automáticamente

#### ✅ **DELETE /api/viajes/:id (Sin Referencias)**
```bash
curl -X DELETE http://localhost:4000/api/viajes/1 \
  -H "Content-Type: application/json"
```
**Verificar:**
- [ ] Elimina viaje exitosamente
- [ ] Retorna mensaje de confirmación

#### ✅ **DELETE /api/viajes/:id (Con Referencias)**
1. Primero crear una visita:
```sql
INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf)
VALUES (1, 1, 5, 150.00);
```

2. Intentar eliminar el viaje:
```bash
curl -X DELETE http://localhost:4000/api/viajes/1 \
  -H "Content-Type: application/json"
```
**Verificar:**
- [ ] Retorna error 400
- [ ] Mensaje explica las referencias existentes
- [ ] Incluye información detallada sobre visitas y clientes
- [ ] Proporciona solución recomendada

---

## 🔍 PRUEBAS DE INTEGRIDAD

### 1. Verificar Consistencia de Datos
```sql
-- Verificar que todos los viajes tengan vehículos válidos
SELECT v.id_viaje, v.id_vehiculo 
FROM VIAJE v 
LEFT JOIN VEHICULO ve ON v.id_vehiculo = ve.id_vehiculo 
WHERE ve.id_vehiculo IS NULL;

-- Verificar que todos los viajes tengan repartidores válidos
SELECT v.id_viaje, v.id_repartidor 
FROM VIAJE v 
LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor 
WHERE r.id_repartidor IS NULL;
```

### 2. Probar Casos Límite
- [ ] Crear viaje con fecha muy antigua
- [ ] Crear viaje con fecha muy futura
- [ ] Ingresar valores muy grandes en distancia/tiempos
- [ ] Caracteres especiales en tipo_viaje

### 3. Verificar Performance
- [ ] Tiempo de carga de lista de viajes < 2 segundos
- [ ] Tiempo de creación de viaje < 1 segundo
- [ ] Queries eficientes sin N+1 problems

---

## 📊 LISTA DE VERIFICACIÓN FINAL

### ✅ Base de Datos
- [ ] Tabla VIAJE con estructura correcta
- [ ] Foreign keys funcionando
- [ ] Datos de prueba disponibles
- [ ] Índices para performance

### ✅ Frontend
- [ ] Página carga sin errores de consola
- [ ] Formulario completo y validado
- [ ] Tabla con todas las columnas alineadas a BD
- [ ] Alertas de eliminación funcionando
- [ ] Responsive design en móviles

### ✅ Backend
- [ ] Todos los endpoints responden correctamente
- [ ] Validaciones de datos funcionando
- [ ] Manejo de errores robusto
- [ ] Logging apropiado

### ✅ Integración
- [ ] Frontend se comunica correctamente con backend
- [ ] Datos se muestran consistentemente
- [ ] CRUD completo funciona sin errores

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Cannot read property of undefined"
**Causa:** Estructura de datos incorrecta en frontend
**Solución:** Verificar que los campos en use-viajes.ts coincidan con el backend

### Error: "Viaje no encontrado"
**Causa:** ID incorrecto o viaje eliminado
**Solución:** Verificar que el viaje existe en la BD

### Error: "Vehículo/Repartidor no existe"
**Causa:** Referencias a registros inexistentes
**Solución:** Verificar datos en tablas VEHICULO y REPARTIDOR

### Error de Conexión
**Causa:** Backend no iniciado o puerto incorrecto
**Solución:** Verificar que el servidor backend esté ejecutándose

### Error de Permisos
**Causa:** Configuración de CORS o autenticación
**Solución:** Verificar configuración de headers y autenticación

---

## 📝 NOTAS ADICIONALES

- **Backup:** Siempre hacer backup de la BD antes de pruebas extensivas
- **Logs:** Revisar logs del servidor para información adicional
- **Browser DevTools:** Usar herramientas de desarrollo para debug
- **Network Tab:** Verificar requests/responses HTTP
- **Console:** Revisar errores de JavaScript

---

## 🎯 CRITERIOS DE ÉXITO

El módulo de viajes se considera **COMPLETAMENTE FUNCIONAL** cuando:

1. ✅ Todas las pruebas anteriores pasan exitosamente
2. ✅ No hay errores en consola del navegador
3. ✅ No hay errores en logs del servidor
4. ✅ El script `test-viajes-module.js` retorna 100% de éxito
5. ✅ Todas las funcionalidades CRUD funcionan correctamente
6. ✅ Las alertas de eliminación explican claramente las referencias

**¡El módulo está listo para producción!**