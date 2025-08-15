# 🗺️ Módulo de Zonas - Sistema R-M-P

## 📋 Descripción General

El módulo de zonas permite gestionar las áreas geográficas donde opera la empresa de logística. Este módulo es fundamental para organizar clientes, rutas y operaciones por ubicación geográfica.

## 🗃️ Estructura de la Base de Datos

### Tabla ZONA
```sql
CREATE TABLE ZONA (
    id_zona INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Campos:
- **id_zona**: Identificador único auto-incremental
- **codigo**: Código único de la zona (máx. 20 caracteres)
- **nombre**: Nombre descriptivo de la zona (máx. 100 caracteres)
- **created_at**: Fecha y hora de creación
- **updated_at**: Fecha y hora de última actualización

## 🔧 API Endpoints

### Autenticación Requerida
Todos los endpoints requieren token de autenticación JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints Disponibles

#### 📋 Listar Zonas
```http
GET /api/zonas
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_zona": 1,
      "codigo": "ZN001",
      "nombre": "Zona Norte Lima",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1,
  "message": "Zonas obtenidas exitosamente"
}
```

#### 🔍 Obtener Zona por ID
```http
GET /api/zonas/:id
```
**Parámetros:**
- `id`: ID de la zona

#### 🔍 Obtener Zona por Código
```http
GET /api/zonas/codigo/:codigo
```
**Parámetros:**
- `codigo`: Código de la zona

#### ➕ Crear Zona
```http
POST /api/zonas
Content-Type: application/json

{
  "codigo": "ZN001",
  "nombre": "Zona Norte Lima"
}
```

#### ✏️ Actualizar Zona
```http
PUT /api/zonas/:id
Content-Type: application/json

{
  "codigo": "ZN002",
  "nombre": "Zona Norte Lima Actualizada"
}
```

#### 🗑️ Eliminar Zona
```http
DELETE /api/zonas/:id
```
**Nota:** No se puede eliminar una zona que tiene clientes asociados.

#### 🔍 Buscar Zonas
```http
GET /api/zonas/search?q=término
```
**Parámetros de consulta:**
- `q`: Término de búsqueda (busca en código y nombre)

#### 📊 Estadísticas de Zonas
```http
GET /api/zonas/estadisticas
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_zona": 1,
      "codigo": "ZN001",
      "nombre": "Zona Norte Lima",
      "total_clientes": 15,
      "clientes_activos": 12,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1,
  "message": "Zonas con estadísticas obtenidas exitosamente"
}
```

## 🎨 Frontend - Next.js

### Estructura de Archivos
```
client/
├── app/zonas/
│   └── page.tsx                 # Página principal del módulo
├── components/
│   ├── forms/
│   │   └── zona-form.tsx        # Formulario para crear/editar zonas
│   └── zona-estadisticas.tsx    # Componente de estadísticas
└── hooks/
    └── use-zonas.ts             # Hook personalizado para gestión de zonas
```

### Hook personalizado (use-zonas.ts)
```typescript
const { 
  zonas, 
  isLoading, 
  error,
  createZona,
  updateZona,
  deleteZona,
  getZonaById,
  getZonaByCodigo,
  searchByNombre,
  searchByCodigo,
  refetch
} = useZonas();
```

### Funcionalidades del Frontend
- ✅ Lista paginada con búsqueda y filtros
- ✅ Formulario de creación y edición
- ✅ Validaciones en tiempo real
- ✅ Confirmación antes de eliminar
- ✅ Vista de estadísticas con gráficos
- ✅ Diseño responsive
- ✅ Soporte para tema claro/oscuro
- ✅ Manejo de estados de carga y errores

### Pestañas Disponibles
1. **Lista de Zonas**: Tabla con todas las zonas y operaciones CRUD
2. **Estadísticas**: Dashboard con métricas y distribución de clientes

## 🔐 Validaciones

### Backend
- **Código requerido**: Máximo 20 caracteres, único en el sistema
- **Nombre requerido**: Máximo 100 caracteres
- **Verificación de integridad**: No permite eliminar zonas con clientes asociados

### Frontend
- **Validación en tiempo real**: Muestra errores mientras el usuario escribe
- **Límites de caracteres**: Contadores visuales
- **Confirmaciones**: Diálogos antes de operaciones destructivas

## 📊 Estadísticas Disponibles

### Métricas Principales
- **Total de zonas**: Número total de zonas registradas
- **Total de clientes**: Suma de todos los clientes en todas las zonas
- **Clientes activos**: Clientes con estado activo
- **Zonas con clientes**: Zonas que tienen al menos un cliente

### Detalle por Zona
- Número de clientes totales
- Número de clientes activos
- Porcentaje de actividad
- Badges de estado visual

## 🧪 Testing

### Script de Prueba Automatizada
```bash
node test-zonas.js
```

### Pruebas Incluidas
1. ✅ Estado del servidor
2. ✅ Conectividad con base de datos
3. ✅ Autenticación
4. ✅ Listar zonas
5. ✅ Crear zona
6. ✅ Obtener zona por ID
7. ✅ Obtener zona por código
8. ✅ Actualizar zona
9. ✅ Buscar zonas
10. ✅ Obtener estadísticas
11. ✅ Validaciones del sistema
12. ✅ Eliminar zona

### Datos de Prueba
El archivo `mysql/init/02-datos-prueba-zonas.sql` incluye 25 zonas de ejemplo:
- Zonas de Lima (Norte, Sur, Este, Oeste, Centro)
- Zonas del Callao
- Zonas residenciales y comerciales
- Zonas industriales y periféricas

## 🚀 Instalación y Configuración

### 1. Base de Datos
```sql
-- Ejecutar script de inicialización
SOURCE mysql/init/01-init.sql;

-- Opcional: Cargar datos de prueba
SOURCE mysql/init/02-datos-prueba-zonas.sql;
```

### 2. Servidor Backend
```bash
cd server
npm install
npm start
```

### 3. Cliente Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Acceso al Módulo
- URL: `http://localhost:3000/zonas`
- Login: `demo@rmp.com` / `demo`

## 📱 Responsive Design

### Breakpoints Soportados
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptaciones Móviles
- Formularios de pantalla completa
- Botones optimizados para touch
- Tablas con scroll horizontal
- Navegación simplificada

## 🎨 Temas y Personalización

### Soporte de Temas
- ✅ Tema claro
- ✅ Tema oscuro
- ✅ Cambio dinámico sin recarga

### Colores del Módulo
- **Primary**: Verde (#22c55e) - Representa geografía/mapas
- **Secondary**: Azul (#3b82f6) - Para acciones secundarias
- **Success**: Verde (#10b981)
- **Warning**: Amarillo (#f59e0b)
- **Error**: Rojo (#ef4444)

## 🔗 Relaciones con Otros Módulos

### Tabla CLIENTE
```sql
FOREIGN KEY (id_zona) REFERENCES ZONA(id_zona)
```
- Los clientes están asociados a una zona
- La eliminación de zona está protegida si tiene clientes

### Vista v_resumen_rutas
```sql
LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
COUNT(DISTINCT c.id_zona) AS Zona
```
- Las zonas aparecen en los reportes de rutas
- Permite análisis por área geográfica

## 🛠️ Mantenimiento

### Logs del Sistema
```javascript
console.log("📋 Obteniendo lista de zonas...");
console.log("✅ Se encontraron X zonas");
console.log("❌ Error al obtener zonas:", error);
```

### Backup Recomendado
```sql
-- Backup de zonas
SELECT * FROM ZONA 
ORDER BY codigo 
INTO OUTFILE '/backup/zonas_backup.csv';
```

### Monitoreo
- Verificar integridad referencial con tabla CLIENTE
- Monitorear performance de consultas con JOIN
- Validar códigos únicos periódicamente

## 🆘 Troubleshooting

### Problemas Comunes

#### Error: "Ya existe una zona con ese código"
**Solución**: Verificar unicidad del código en la base de datos
```sql
SELECT * FROM ZONA WHERE codigo = 'CODIGO_DUPLICADO';
```

#### Error: "No se puede eliminar la zona porque tiene clientes asociados"
**Solución**: Reasignar clientes a otra zona antes de eliminar
```sql
SELECT COUNT(*) FROM CLIENTE WHERE id_zona = ID_ZONA;
```

#### Error de conexión frontend-backend
**Verificar**:
1. Servidor backend ejecutándose en puerto 4000
2. Token de autenticación válido
3. CORS configurado correctamente

### Logs de Debugging
```bash
# Backend logs
tail -f server/logs/app.log

# Frontend logs
# Abrir DevTools del navegador > Console
```

## 📈 Roadmap Futuro

### Funcionalidades Planeadas
- [ ] Mapa interactivo con zonas
- [ ] Coordenadas GPS para zonas
- [ ] Geofencing automático
- [ ] Importación masiva desde CSV/Excel
- [ ] Análisis predictivo por zona
- [ ] Integración con servicios de mapas (Google Maps, OpenStreetMap)

### Mejoras Técnicas
- [ ] Cache Redis para consultas frecuentes
- [ ] Índices optimizados para búsquedas
- [ ] Compresión de respuestas API
- [ ] Versionado de API
- [ ] Documentación automática con Swagger

---

**Desarrollado para R-M-P (Route Management Platform)**
**Versión**: 2.0.0  
**Última actualización**: Enero 2024