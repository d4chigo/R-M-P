# Adaptación Completa del Sistema R-M-P

## Resumen de Cambios Realizados

Este documento detalla todos los cambios realizados para adaptar el sistema R-M-P a la nueva estructura de base de datos definida en `mysql/init/01-init.sql`.

## 📊 Nueva Estructura de Base de Datos

### Tablas Principales

#### 1. USUARIO
```sql
- id_usuario (INT, PK, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- nombre_completo (VARCHAR(150), NOT NULL)
- email (VARCHAR(100), UNIQUE)
- telefono (VARCHAR(20))
- activo (BOOLEAN, DEFAULT TRUE)
- created_at, updated_at (TIMESTAMP)
```

#### 2. ROL
```sql
- id_rol (INT, PK, AUTO_INCREMENT)
- nombre (VARCHAR(50), UNIQUE, NOT NULL)
- descripcion (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 3. USUARIO_ROL (Relación muchos a muchos)
```sql
- id_usuario (INT, FK)
- id_rol (INT, FK)
- PK(id_usuario, id_rol)
```

#### 4. ZONA
```sql
- id_zona (INT, PK, AUTO_INCREMENT)
- codigo (VARCHAR(20), UNIQUE, NOT NULL)
- nombre (VARCHAR(100), NOT NULL)
- created_at, updated_at (TIMESTAMP)
```

#### 5. VEHICULO
```sql
- id_vehiculo (INT, PK, AUTO_INCREMENT)
- placa (VARCHAR(10), UNIQUE, NOT NULL)
- marca (VARCHAR(50), NOT NULL)
- modelo (VARCHAR(50), NOT NULL)
- anio (INT)
- capacidad_kg (DECIMAL(10,2))
- capacidad_cajas (INT)
- activo (BOOLEAN, DEFAULT TRUE)
- created_at, updated_at (TIMESTAMP)
```

#### 6. REPARTIDOR
```sql
- id_repartidor (INT, PK, AUTO_INCREMENT)
- codigo (VARCHAR(20), UNIQUE, NOT NULL)
- nombre (VARCHAR(100), NOT NULL)
- dni (VARCHAR(15))
- licencia_conducir (VARCHAR(20))
- telefono (VARCHAR(20))
- activo (BOOLEAN, DEFAULT TRUE)
- created_at, updated_at (TIMESTAMP)
```

#### 7. CLIENTE
```sql
- id_cliente (INT, PK, AUTO_INCREMENT)
- codigo (VARCHAR(20), UNIQUE, NOT NULL)
- nombre (VARCHAR(100), NOT NULL)
- direccion (TEXT)
- id_zona (INT, FK)
- activo (BOOLEAN, DEFAULT TRUE)
- created_at, updated_at (TIMESTAMP)
```

#### 8. VIAJE
```sql
- id_viaje (INT, PK, AUTO_INCREMENT)
- fecha (DATE, NOT NULL)
- id_vehiculo (INT, FK, NOT NULL)
- id_repartidor (INT, FK, NOT NULL)
- nro_viaje (INT, NOT NULL)
- salida_cd (DATETIME)
- llegada_cd (DATETIME)
- distancia_km (DECIMAL(10,2))
- tiempo_manejo_min (INT)
- tiempo_servicio_min (INT)
- recarga_min (INT)
- refrigerio_min (INT)
- tipo_viaje (VARCHAR(50))
- created_by (INT, FK)
- updated_by (INT, FK)
- created_at, updated_at (TIMESTAMP)
```

#### 9. VISITA
```sql
- id_visita (INT, PK, AUTO_INCREMENT)
- id_viaje (INT, FK, NOT NULL)
- id_cliente (INT, FK, NOT NULL)
- pedidos (INT, DEFAULT 0)
- entrega_cf (DECIMAL(10,2), DEFAULT 0)
- recojo_cf (DECIMAL(10,2), DEFAULT 0)
- peso_kg (DECIMAL(10,2), DEFAULT 0)
- distancia_km (DECIMAL(10,2), DEFAULT 0)
- created_by (INT, FK)
- updated_by (INT, FK)
- created_at, updated_at (TIMESTAMP)
```

#### 10. AUDITORIA
```sql
- id_auditoria (INT, PK, AUTO_INCREMENT)
- tabla (VARCHAR(100), NOT NULL)
- id_registro (INT, NOT NULL)
- accion (VARCHAR(20), NOT NULL)
- datos_previos (JSON)
- datos_nuevos (JSON)
- realizado_por (INT, FK)
- fecha (TIMESTAMP)
```

### Vista Principal

#### v_resumen_rutas
Consolidada que agrupa datos por fecha, vehículo y repartidor:
- Fecha, Placa, Vehiculo, Repartidor
- Nro de viajes, Zona, Distancia
- Salida del CD, Llegada al CD, Tiempo
- Nro de clientes, Nro de pedidos
- Entrega (CF), Recojo (CF), Peso (Kg)

## 🔧 Controladores Actualizados

### 1. auth.controller.js
**Cambios principales:**
- Uso de `username` en lugar de `email` para login
- Campo `password_hash` en lugar de `contrasena`
- Campo `nombre_completo` en lugar de `nombre`
- Campo `activo` en lugar de `estado`
- Nuevas funciones: `register`, `getProfile`, `updateProfile`

### 2. vehiculo.controller.js
**Cambios principales:**
- Campo `activo` incluido en todas las operaciones
- Soft delete implementado
- Nuevas funciones: `getVehiculosActivos`, `toggleVehiculoActivo`
- Estadísticas de uso incluidas

### 3. repartidor.controller.js
**Cambios principales:**
- Campo `activo` incluido en todas las operaciones
- Soft delete implementado
- Nuevas funciones: `getRepartidoresActivos`, `toggleRepartidorActivo`
- Estadísticas de viajes incluidas

### 4. cliente.controller.js
**Cambios principales:**
- Campo `activo` incluido en todas las operaciones
- Relación con zonas fortalecida
- Soft delete implementado
- Nuevas funciones: `getClientesActivos`, `toggleClienteActivo`

### 5. zona.controller.js
**Cambios principales:**
- Estructura simplificada con `codigo` y `nombre`
- Estadísticas de clientes por zona
- Relaciones con clientes mejoradas

### 6. viaje.controller.js
**Cambios principales:**
- Campos de auditoría: `created_by`, `updated_by`
- Información de usuarios que crean/modifican registros
- Relaciones mejoradas con vehículos y repartidores

### 7. visita.controller.js
**Cambios principales:**
- Campos de auditoría: `created_by`, `updated_by`
- Información de usuarios que crean/modifican registros
- Estructura de datos simplificada

### 8. usuario.controller.js (NUEVO)
**Funcionalidades:**
- CRUD completo de usuarios
- Gestión de contraseñas
- Activación/desactivación
- Estadísticas de actividad
- Búsqueda y filtros

### 9. reportes.controller.js
**Cambios principales:**
- Uso de la vista `v_resumen_rutas`
- Campo `Zona` en lugar de `Territorio`
- Métricas mejoradas y más precisas

## 🛡️ Middleware de Autenticación

### auth.middleware.js
**Actualizaciones:**
- Uso de `id_usuario` en lugar de `id`
- Campo `activo` en lugar de `estado`
- Nuevos middlewares: `requireRole`, `requireAdmin`, `requireOperator`
- Soporte para sistema de roles

## 🚀 Rutas Actualizadas

### Nuevas rutas añadidas:
- `/api/usuarios` - Gestión completa de usuarios
- `/api/auth/register` - Registro de nuevos usuarios
- `/api/auth/profile` - Gestión de perfil

### Rutas mejoradas:
- Todas las rutas existentes mantienen compatibilidad
- Nuevos endpoints para funciones específicas (`/activos`, `/estadisticas`, `/toggle`)

## 📄 Archivos de Configuración

### 1. mysql/init/01-init.sql
- Estructura completa de la base de datos
- Índices optimizados
- Vista `v_resumen_rutas`
- Usuarios por defecto con contraseñas hasheadas

### 2. mysql/init/02-sample-data.sql (NUEVO)
- Datos de prueba completos
- 3 roles del sistema
- 10 zonas geográficas
- 10 vehículos y 10 repartidores
- 26 clientes distribuidos
- 20 viajes de muestra con visitas

### 3. server/index.js
- Ruta `/api/usuarios` incluida
- Documentación de endpoints actualizada
- Tests de conectividad mejorados

## 🔐 Sistema de Roles

### Roles implementados:
1. **administrador**: Acceso completo al sistema
2. **operador**: Acceso a operaciones diarias
3. **usuario**: Acceso básico de consulta

### Middlewares de autorización:
- `requireAdmin`: Solo administradores
- `requireOperator`: Operadores y administradores
- `requireRole(roles)`: Roles específicos

## 📊 Funcionalidades Nuevas

### 1. Soft Delete
- Todas las entidades principales soportan soft delete
- Campo `activo` para marcar registros como inactivos
- Preservación de datos históricos

### 2. Auditoría
- Tabla `AUDITORIA` para rastrear cambios
- Campos `created_by` y `updated_by` en transacciones
- Historial completo de modificaciones

### 3. Estadísticas Avanzadas
- Endpoints específicos para estadísticas por entidad
- Performance de vehículos y repartidores
- Métricas de cumplimiento mejoradas

### 4. Gestión de Usuarios
- CRUD completo de usuarios
- Sistema de roles y permisos
- Gestión de contraseñas segura

## 🧪 Pruebas

### Datos de prueba incluidos:
- **Usuarios**: admin y demo con roles asignados
- **Zonas**: 10 zonas geográficas realistas
- **Vehículos**: 10 vehículos con diferentes capacidades
- **Repartidores**: 10 repartidores con datos completos
- **Clientes**: 26 clientes distribuidos por zonas
- **Viajes**: 20 viajes de una semana laboral
- **Visitas**: Visitas detalladas para los viajes

### Endpoints de testing:
- `GET /api/test` - Verificar conectividad BD
- `GET /api/schema` - Verificar estructura BD

## 🔧 Instalación y Uso

### 1. Base de datos:
```bash
# Los scripts se ejecutan automáticamente al inicializar MySQL
# 01-init.sql: Estructura de la BD
# 02-sample-data.sql: Datos de prueba
```

### 2. Credenciales por defecto:
```
Administrador:
- Username: admin
- Password: admin123

Usuario demo:
- Username: demo  
- Password: demo123
```

### 3. API Endpoints principales:
```
# Autenticación
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/profile

# Gestión de entidades
GET /api/usuarios
GET /api/vehiculos
GET /api/repartidores
GET /api/clientes
GET /api/zonas
GET /api/viajes
GET /api/visitas

# Reportes
GET /api/reportes/resumen-rutas
GET /api/reportes/metricas-diarias
```

## ✅ Beneficios de la Adaptación

1. **Consistencia**: Estructura de BD uniforme y bien normalizada
2. **Escalabilidad**: Sistema de roles y auditoría implementado
3. **Mantenibilidad**: Soft delete y trazabilidad completa
4. **Funcionalidad**: Nuevas características sin romper compatibilidad
5. **Seguridad**: Autenticación y autorización robustas
6. **Reportes**: Vista optimizada para consultas rápidas

## 🚨 Consideraciones Importantes

1. **Migración**: Los datos existentes deben migrarse a la nueva estructura
2. **Contraseñas**: Usar hash BCrypt para todas las contraseñas
3. **Roles**: Asignar roles apropiados a usuarios existentes
4. **Índices**: Los índices están optimizados para las consultas más frecuentes
5. **Campos obligatorios**: Validar que todos los campos requeridos tengan valores

## 📈 Próximos Pasos

1. **Frontend**: Adaptar componentes React a nuevos endpoints
2. **Testing**: Implementar tests automatizados
3. **Documentación**: API documentation con Swagger
4. **Monitoring**: Implementar logging y métricas
5. **Backup**: Estrategia de respaldo automatizado

---

*Adaptación completada el: 2024-01-20*
*Versión del sistema: 2.0.0*
*Esquema de BD: 01-init.sql*