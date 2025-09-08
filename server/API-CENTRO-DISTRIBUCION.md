# API Centro de Distribución

## 📋 Descripción
API completa para la gestión de centros de distribución y almacenes del sistema R-M-P.

## 🔐 Autenticación
Todas las rutas requieren autenticación mediante token JWT en el header `Authorization: Bearer <token>`.

## 🚀 Endpoints

### 1. Obtener Todos los Centros
```http
GET /api/centros-distribucion
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_centro": 1,
      "codigo": "CD001",
      "nombre": "Centro de Distribución Norte",
      "descripcion": "Centro principal para distribución en la zona norte",
      "direccion": "Av. Principal 123",
      "ciudad": "Ciudad de México",
      "estado": "activo",
      "capacidad_almacen": 5000.00,
      "personal_asignado": 25,
      "telefono": "+52 55 1234 5678",
      "email": "norte@empresa.com",
      "latitud": 19.4326,
      "longitud": -99.1332,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "message": "Centros de distribución obtenidos exitosamente"
}
```

### 2. Obtener Centro por ID
```http
GET /api/centros-distribucion/:id
```

**Parámetros:**
- `id` (path): ID del centro de distribución

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_centro": 1,
    "codigo": "CD001",
    "nombre": "Centro de Distribución Norte",
    // ... resto de campos
  },
  "message": "Centro de distribución obtenido exitosamente"
}
```

**Respuesta de error (404):**
```json
{
  "success": false,
  "message": "Centro de distribución no encontrado"
}
```

### 3. Crear Nuevo Centro
```http
POST /api/centros-distribucion
```

**Requiere permisos de administrador**

**Body:**
```json
{
  "codigo": "CD001",
  "nombre": "Centro de Distribución Norte",
  "descripcion": "Centro principal para distribución en la zona norte",
  "direccion": "Av. Principal 123",
  "ciudad": "Ciudad de México",
  "estado": "activo",
  "capacidad_almacen": 5000.00,
  "personal_asignado": 25,
  "telefono": "+52 55 1234 5678",
  "email": "norte@empresa.com",
  "latitud": 19.4326,
  "longitud": -99.1332
}
```

**Campos obligatorios:**
- `codigo`: Código único del centro
- `nombre`: Nombre del centro
- `direccion`: Dirección física
- `ciudad`: Ciudad donde se ubica

**Campos opcionales:**
- `descripcion`: Descripción del centro
- `estado`: Estado operativo (activo, inactivo, mantenimiento)
- `capacidad_almacen`: Capacidad en metros cúbicos
- `personal_asignado`: Número de empleados
- `telefono`: Teléfono de contacto
- `email`: Email de contacto
- `latitud`: Coordenada de latitud
- `longitud`: Coordenada de longitud

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id_centro": 1,
    // ... datos del centro creado
  },
  "message": "Centro de distribución creado exitosamente"
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "Los campos código, nombre, dirección y ciudad son obligatorios"
}
```

### 4. Actualizar Centro
```http
PUT /api/centros-distribucion/:id
```

**Requiere permisos de administrador**

**Parámetros:**
- `id` (path): ID del centro a actualizar

**Body:** Mismo formato que crear, pero todos los campos son opcionales excepto los obligatorios.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_centro": 1,
    // ... datos del centro actualizado
  },
  "message": "Centro de distribución actualizado exitosamente"
}
```

### 5. Eliminar Centro
```http
DELETE /api/centros-distribucion/:id
```

**Requiere permisos de administrador**

**Parámetros:**
- `id` (path): ID del centro a eliminar

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Centro de distribución CD001 eliminado exitosamente"
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "No se puede eliminar el centro de distribución porque tiene viajes asociados"
}
```

### 6. Buscar Centros
```http
GET /api/centros-distribucion/search?q=termino
```

**Query Parameters:**
- `q`: Término de búsqueda (obligatorio)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    // ... centros que coinciden con la búsqueda
  ],
  "message": "Se encontraron 2 centros de distribución"
}
```

### 7. Obtener Centros por Estado
```http
GET /api/centros-distribucion/estado/:estado
```

**Parámetros:**
- `estado` (path): Estado del centro (activo, inactivo, mantenimiento)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    // ... centros con el estado especificado
  ],
  "message": "Se encontraron 5 centros de distribución con estado activo"
}
```

### 8. Obtener Estadísticas
```http
GET /api/centros-distribucion/stats
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total_centros": 10,
    "centros_activos": 8,
    "centros_inactivos": 1,
    "centros_mantenimiento": 1,
    "centros_con_coordenadas": 9,
    "capacidad_total": 45000.00,
    "personal_total": 150
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

## 📊 Modelo de Datos

### Tabla CENTRO_DISTRIBUCION
```sql
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
```

## 🔍 Índices de Base de Datos
- `idx_centro_distribucion_codigo`: Búsqueda por código
- `idx_centro_distribucion_estado`: Filtrado por estado
- `idx_centro_distribucion_ciudad`: Filtrado por ciudad
- `idx_centro_distribucion_coordenadas`: Búsqueda geográfica

## ⚠️ Validaciones

### Crear/Actualizar
- Código, nombre, dirección y ciudad son obligatorios
- El código debe ser único
- Estado debe ser uno de: activo, inactivo, mantenimiento
- Capacidad de almacén debe ser un número positivo
- Personal asignado debe ser un entero positivo
- Email debe tener formato válido
- Coordenadas deben estar en rangos válidos:
  - Latitud: -90 a 90
  - Longitud: -180 a 180

### Eliminar
- No se puede eliminar si hay viajes asociados
- Solo administradores pueden eliminar

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos o faltantes |
| 401 | Unauthorized - Token no válido o expirado |
| 403 | Forbidden - Sin permisos de administrador |
| 404 | Not Found - Centro no encontrado |
| 500 | Internal Server Error - Error del servidor |

## 📝 Ejemplos de Uso

### Crear un nuevo centro
```bash
curl -X POST http://localhost:4000/api/centros-distribucion \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "CD001",
    "nombre": "Centro Norte",
    "direccion": "Av. Principal 123",
    "ciudad": "Ciudad de México",
    "estado": "activo",
    "capacidad_almacen": 5000.00,
    "personal_asignado": 25
  }'
```

### Obtener todos los centros
```bash
curl -X GET http://localhost:4000/api/centros-distribucion \
  -H "Authorization: Bearer <token>"
```

### Buscar centros
```bash
curl -X GET "http://localhost:4000/api/centros-distribucion/search?q=norte" \
  -H "Authorization: Bearer <token>"
```

## 🔧 Configuración

### Variables de Entorno
- `PORT`: Puerto del servidor (default: 4000)
- `DB_HOST`: Host de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos

### Middleware
- `authenticateToken`: Verifica el token JWT
- `checkAdmin`: Verifica permisos de administrador

## 📈 Monitoreo y Logs

El controlador registra todas las operaciones con timestamps y detalles de error para facilitar el debugging y monitoreo del sistema. 