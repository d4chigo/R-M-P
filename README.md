# 🚛 R-M-P - Sistema de Gestión de Rutas, Mercancías y Procesos

> Sistema completo para la gestión de rutas, vehículos, clientes, carretas, viajes y visitas empresariales.

## 📋 Tabla de Contenidos

- [🎯 Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [🔧 Configuración](#-configuración)
- [🗄️ Migraciones de Base de Datos](#️-migraciones-de-base-de-datos)
- [📚 Documentación Adicional](#-documentación-adicional)

## 🎯 Características

 - ✅ **Panel de Administración**: Interfaz web intuitiva con Next.js
 - ✅ **API RESTful**: Backend robusto para integración
 - ✅ **Base de Datos MySQL**: Almacenamiento confiable y escalable
 - ✅ **Containerización**: Despliegue fácil con Docker
 - ✅ **Interfaz Moderna**: UI/UX con componentes Shadcn/UI y Tailwind CSS

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│    (MySQL)      │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   phpMyAdmin    │
                    │   Port: 8080    │
                    └─────────────────┘
```


---

© {new Date().getFullYear()} R-M-P. Todos los derechos reservados. Desarrollado por d4chigo — Licencia MIT.
## 🚀 Inicio Rápido

### Prerrequisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Git

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/d4chigo/R-M-P.git
   cd R-M-P
   ```

2. **Configura las variables de entorno:**
   ```bash
   cp .env.example .env
   ```

3. **Edita el archivo .env con tus valores:**
   ```bash
   nano .env  # o code .env para VS Code
   ```

4. **Inicia los servicios:**
   ```bash
   docker-compose up --build -d
   ```

5. **¡Listo! Accede a la aplicación:**
   - 🌐 **Frontend**: http://localhost:3000
   - 🔧 **API**: http://localhost:4000
   - 🗄️ **phpMyAdmin**: http://localhost:8080

## 🔧 Configuración

### Variables de Entorno

El archivo `.env` contiene todas las configuraciones necesarias:

```bash
# Entorno de Ejecución
NODE_ENV=development                    # development | production | test

# Configuración de Base de Datos
MYSQL_ROOT_PASSWORD=                     # Contraseña del usuario root (obligatoria)
MYSQL_DATABASE=rmp_db                   # Nombre de la base de datos
MYSQL_USER=rmp_user                     # Usuario de la aplicación
MYSQL_PASSWORD=                         # Contraseña del usuario (obligatoria)

# Configuración de Puertos
CLIENT_PORT=3000                        # Puerto del frontend
SERVER_PORT=4000                        # Puerto del backend
MYSQL_PORT=3306                         # Puerto de MySQL
PHPMYADMIN_PORT=8080                    # Puerto de phpMyAdmin

# Configuración de API
NEXT_PUBLIC_API_URL=http://localhost:4000   # URL del API para el frontend
```

### Credenciales por Defecto

- **MySQL Root**: configurado mediante `MYSQL_ROOT_PASSWORD`
- **MySQL Usuario**: configurado mediante `MYSQL_USER` y `MYSQL_PASSWORD`

## 🗄️ Migraciones de Base de Datos

El sistema incluye migraciones automáticas que se ejecutan al inicializar Docker:

### Scripts de Inicialización

Los scripts en `mysql/init/` se ejecutan automáticamente en orden:

1. **`01-init.sql`** - Tablas principales (usuarios, roles, vehículos, etc.)
2. **`50-saldos-por-centro.sql`** - Sistema de saldos por centro de distribución
3. **`99-events.sql`** - Eventos programados y tareas automáticas

### Nueva Funcionalidad: Saldos por Centro de Distribución

La migración `50-saldos-por-centro.sql` incluye:

- ✅ Gestión de saldos independientes por centro de distribución
- ✅ Historial completo de movimientos de saldo
- ✅ Triggers automáticos para auditoría
- ✅ Procedimientos almacenados para validaciones
- ✅ Vista de resumen para reportes

### Reconstruir Docker con Migraciones

Si necesitas reconstruir Docker con todas las migraciones:

```bash
# Hacer backup primero
docker exec rmp_mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql

# Reconstruir desde cero
docker-compose down -v
docker-compose up -d --build
```

Para instrucciones detalladas, consulta: **[DOCKER_REBUILD_GUIDE.md](DOCKER_REBUILD_GUIDE.md)**

## 📚 Documentación Adicional

- **[DOCKER_REBUILD_GUIDE.md](DOCKER_REBUILD_GUIDE.md)** - Guía completa de reconstrucción de Docker
- **[IMPLEMENTACION_SALDOS_CENTRO.md](IMPLEMENTACION_SALDOS_CENTRO.md)** - Documentación del sistema de saldos por centro
- **[client/BACKEND_API_REQUIREMENTS.md](client/BACKEND_API_REQUIREMENTS.md)** - Especificaciones de API

- **Base de Datos**: `rmp_db`

## 📁 Estructura del Proyecto

```
R-M-P/
├── 📂 client/                    # Frontend (Next.js 14)
│   ├── 📂 app/                   # App Router
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Página de inicio
│   │   ├── 📂 carretas/          # Gestión de carretas
│   │   ├── 📂 clientes/          # Gestión de clientes
│   │   ├── 📂 rutas/             # Gestión de rutas
│   │   ├── 📂 tipos-cliente/     # Tipos de cliente
│   │   ├── 📂 vehiculos/         # Gestión de vehículos
│   │   ├── 📂 viajes/            # Gestión de viajes
│   │   └── 📂 visitas/           # Gestión de visitas
│   ├── 📂 components/            # Componentes reutilizables
│   │   ├── 📂 forms/             # Formularios
│   │   ├── 📂 tables/            # Tablas de datos
│   │   └── 📂 ui/                # Componentes UI (Shadcn)
│   ├── 📂 hooks/                 # Custom hooks
│   ├── 📂 lib/                   # Utilidades
│   └── 📂 public/                # Archivos estáticos
├── 📂 server/                    # Backend (Node.js)
│   ├── 📄 Dockerfile             # Configuración Docker
│   └── 📄 package.json           # Dependencias del servidor
├── 📂 mysql/                     # Configuración de MySQL
│   └── 📂 init/                  # Scripts de inicialización
│       └── 📄 01-init.sql        # Script inicial de BD
├── 📄 docker-compose.yml         # Configuración de servicios
├── 📄 .env                       # Variables de entorno (local)
├── 📄 .env.example               # Ejemplo de variables
└── 📄 README.md                  # Este archivo
```

## 🐳 Docker

### Servicios Incluidos

| Servicio | Descripción | Puerto | Estado |
|----------|-------------|--------|--------|
| **client** | Frontend Next.js | 3000 | ✅ |
| **server** | Backend API | 4000 | ✅ |
| **mysql** | Base de datos MySQL 9.0 | 3306 | ✅ |
| **phpmyadmin** | Administrador de BD | 8080 | ✅ |

### Comandos Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar con rebuild
docker-compose up --build -d

# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f client

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart server

# Ejecutar comandos en un contenedor
docker-compose exec server sh
docker-compose exec mysql mysql -u root -p
```

## 💾 Base de Datos

### Conexión

```javascript
// Configuración de conexión
const dbConfig = {
  host: 'mysql',
  port: 3306,
  database: 'rmp_db',
  user: 'rmp_user',
  password: process.env.DB_PASSWORD
}
```

### Inicialización

Los scripts en `mysql/init/` se ejecutan automáticamente al crear el contenedor por primera vez.

### Backup y Restore

```bash
# Crear backup
docker-compose exec mysql mysqldump -u root -p rmp_db > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -p rmp_db < backup.sql
```

## 🔗 API Endpoints

### Rutas Principales

```
GET    /api/rutas              # Listar rutas
POST   /api/rutas              # Crear ruta
GET    /api/rutas/:id          # Obtener ruta específica
PUT    /api/rutas/:id          # Actualizar ruta
DELETE /api/rutas/:id          # Eliminar ruta

GET    /api/vehiculos          # Listar vehículos
GET    /api/clientes           # Listar clientes
GET    /api/viajes             # Listar viajes
GET    /api/visitas            # Listar visitas
GET    /api/carretas           # Listar carretas
```

## 🛠️ Desarrollo

### Frontend (Next.js)

```bash
# Entrar al contenedor del cliente
docker-compose exec client sh

# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm dev

# Build para producción
pnpm build

# Linting
pnpm lint
```

### Backend (Node.js)

```bash
# Entrar al contenedor del servidor
docker-compose exec server sh

# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm dev

# Producción
pnpm start
```

### Tecnologías Utilizadas

#### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Shadcn/UI** - Componentes UI
- **React Hook Form** - Manejo de formularios
- **Lucide React** - Iconos

#### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver de MySQL
- **CORS** - Cross-Origin Resource Sharing

#### Base de Datos
- **MySQL 9.0** - Sistema de gestión de base de datos
- **phpMyAdmin** - Interfaz de administración web

## 📝 Comandos Útiles

### Verificación del Sistema

```bash
# Verificar que las variables se cargan correctamente
docker-compose config

# Ver estado de los servicios
docker-compose ps

# Verificar conectividad de red
docker-compose exec client ping server
docker-compose exec server ping mysql

# Ver uso de recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -a
```

### Debugging

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs con timestamps
docker-compose logs -f -t

# Últimas 100 líneas de logs
docker-compose logs --tail=100

# Inspeccionar un contenedor
docker inspect rmp_client
```

### Mantenimiento

```bash
# Actualizar imágenes
docker-compose pull

# Reconstruir sin caché
docker-compose build --no-cache

# Limpiar volúmenes
docker volume prune

# Reiniciar desde cero
docker-compose down -v
docker-compose up --build -d
```


### Estándares de Código

- Usa TypeScript en el frontend
- Sigue las convenciones de ESLint
- Escribe tests para nuevas funcionalidades
- Documenta los cambios en el README

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

<div align="center">

**Desarrollado con ❤️ por [d4chigo](https://github.com/d4chigo)**

[![GitHub](https://img.shields.io/badge/GitHub-R--M--P-blue?style=flat-square&logo=github)](https://github.com/d4chigo/R-M-P)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-9.0-orange?style=flat-square&logo=mysql)](https://www.mysql.com/)

</div>
