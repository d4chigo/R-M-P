# Módulo Centro de Distribución

## Descripción
El módulo de Centro de Distribución permite gestionar todos los centros de distribución y almacenes de la empresa. Proporciona funcionalidades completas para crear, editar, eliminar y consultar información detallada de cada centro.

## Características Principales

### 📊 Gestión de Centros
- **Crear nuevos centros**: Registro completo con información detallada
- **Editar centros existentes**: Modificación de datos y configuración
- **Eliminar centros**: Gestión del ciclo de vida de los centros
- **Consulta detallada**: Visualización completa de información de cada centro

### 🗺️ Visualización en Mapa
- **Mapa interactivo**: Visualización geográfica de todos los centros
- **Marcadores inteligentes**: Información detallada en popups
- **Múltiples capas**: OpenStreetMap, Satélite y Terreno
- **Navegación avanzada**: Zoom, centrado y ubicación actual
- **Estadísticas visuales**: Métricas rápidas en el mapa

### 🏗️ Información del Centro
- **Datos básicos**: Código, nombre, descripción
- **Ubicación**: Dirección, ciudad, coordenadas geográficas
- **Estado operativo**: Activo, Inactivo, Mantenimiento
- **Capacidad**: Volumen de almacenamiento en m³
- **Personal**: Número de empleados asignados
- **Contacto**: Teléfono y email de contacto

### 🔍 Funcionalidades de Búsqueda
- **Búsqueda por texto**: Filtrado por código, nombre, dirección o ciudad
- **Filtro por fecha**: Búsqueda por fecha de creación
- **Paginación**: Navegación eficiente en grandes volúmenes de datos

### 📈 Estadísticas en Tiempo Real
- **Total de centros**: Conteo de centros registrados
- **Centros activos**: Número de centros operativos
- **Capacidad total**: Suma de capacidad de almacenamiento
- **Personal total**: Total de empleados en todos los centros

## Estructura de Archivos

```
centro-distribucion/
├── page.tsx                    # Página principal del módulo con pestañas
├── README.md                   # Este archivo de documentación
components/
├── tables/
│   └── centro-distribucion-table.tsx    # Tabla de visualización
├── forms/
│   └── centro-distribucion-form.tsx     # Formulario de creación/edición
└── centro-distribucion-mapa.tsx         # Componente de mapa interactivo
hooks/
└── use-centro-distribucion.ts           # Hook personalizado para la API
```

## Componentes

### CentroDistribucionTable
Tabla principal que muestra la lista de centros con:
- Paginación automática
- Estados visuales (activo, inactivo, mantenimiento)
- Acciones de edición, eliminación y visualización
- Skeleton loading para mejor UX
- Mensajes informativos cuando no hay datos

### CentroDistribucionForm
Formulario completo para crear y editar centros con:
- Validación en tiempo real
- Campos requeridos y opcionales
- Validación de coordenadas geográficas
- Validación de formatos (email, números)
- Manejo de errores con mensajes claros

### CentroDistribucionMapa
Componente de mapa interactivo con:
- Visualización de centros en mapa de Leaflet
- Marcadores personalizados para cada centro
- Popups informativos con datos del centro
- Controles de zoom y navegación
- Múltiples capas de mapa (OpenStreetMap, Satélite, Terreno)
- Botón de ubicación actual
- Estadísticas rápidas del mapa
- Resaltado de centro seleccionado

## Hook Personalizado

### useCentroDistribucion
Hook que proporciona todas las operaciones CRUD:
- `fetchCentros()`: Obtener lista de centros
- `createCentro()`: Crear nuevo centro
- `updateCentro()`: Actualizar centro existente
- `deleteCentro()`: Eliminar centro
- `getCentroById()`: Obtener centro específico
- `searchCentros()`: Búsqueda por criterios
- `getCentrosByEstado()`: Filtrado por estado

## API Endpoints

El módulo espera los siguientes endpoints en el backend:
- `GET /api/centros-distribucion` - Listar todos los centros
- `POST /api/centros-distribucion` - Crear nuevo centro
- `PUT /api/centros-distribucion/:id` - Actualizar centro
- `DELETE /api/centros-distribucion/:id` - Eliminar centro
- `GET /api/centros-distribucion/:id` - Obtener centro específico
- `GET /api/centros-distribucion/search?q=term` - Búsqueda
- `GET /api/centros-distribucion/estado/:estado` - Filtrar por estado

## Modelo de Datos

```typescript
interface CentroDistribucion {
  id_centro?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  capacidad_almacen?: number;
  personal_asignado?: number;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}
```

## Uso

### 📋 Pestaña: Lista de Centros
1. **Acceso**: Navegar a `/centro-distribucion` desde la página principal
2. **Crear centro**: Hacer clic en "Nuevo Centro" y completar el formulario
3. **Editar centro**: Hacer clic en el ícono de edición en la tabla
4. **Ver detalles**: Hacer clic en el ícono de ojo para ver información completa
5. **Eliminar centro**: Hacer clic en el ícono de eliminación (con confirmación)

### 🗺️ Pestaña: Mapa
1. **Visualización**: Ver todos los centros ubicados geográficamente
2. **Navegación**: Usar controles de zoom y navegación
3. **Selección**: Hacer clic en marcadores para seleccionar centros
4. **Capas**: Cambiar entre diferentes tipos de mapa
5. **Ubicación**: Usar botón de ubicación actual

### 📊 Pestaña: Detalles
1. **Información completa**: Ver todos los datos del centro seleccionado
2. **Coordenadas**: Visualizar ubicación exacta en latitud/longitud
3. **Estado**: Ver estado operativo y capacidad del centro

## Validaciones

- **Código**: Requerido, máximo 20 caracteres
- **Nombre**: Requerido, máximo 100 caracteres
- **Descripción**: Requerida, máximo 500 caracteres
- **Dirección**: Requerida, máximo 200 caracteres
- **Ciudad**: Requerida, máximo 100 caracteres
- **Estado**: Requerido (activo, inactivo, mantenimiento)
- **Capacidad**: Opcional, número positivo, máximo 1,000,000 m³
- **Personal**: Opcional, entero positivo, máximo 10,000
- **Email**: Opcional, formato válido, máximo 100 caracteres
- **Coordenadas**: Si se proporciona una, debe proporcionarse la otra

## Integración

El módulo está completamente integrado con:
- Sistema de autenticación
- Sistema de notificaciones (toast)
- Tema claro/oscuro
- Diseño responsive
- Navegación del sistema

## Notas de Desarrollo

- El módulo sigue el patrón establecido en el proyecto
- Utiliza los componentes UI existentes
- Implementa manejo de errores robusto
- Incluye logging detallado para debugging
- Soporta operaciones offline con estado local 