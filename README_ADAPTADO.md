# R-M-P - Sistema de Gestión de Rutas y Transporte 🚛

## 📋 Descripción

Sistema completo de gestión de rutas y transporte adaptado a la nueva estructura de base de datos. Incluye backend en Node.js, frontend en Next.js y base de datos MySQL con datos de prueba completos.

## 🆕 Cambios Realizados (Adaptación Completa)

### ✅ Backend Actualizado
- **Autenticación**: Usa `username` y `password` (no `email` y `contrasena`)
- **Campo activo**: Todas las entidades usan `activo` (boolean) en lugar de `estado`
- **Auditoría**: Campos `created_by` y `updated_by` en transacciones
- **Soft Delete**: Preservación de datos históricos
- **Sistema de Roles**: Administrador, Operador, Usuario
- **Vista optimizada**: `v_resumen_rutas` para reportes

### ✅ Frontend Actualizado
- **Login con username**: Interfaz adaptada para nueva autenticación
- **Estados activo/inactivo**: Manejo de campo boolean
- **Nuevos campos de usuario**: `nombre_completo`, `id_usuario`
- **Credenciales de prueba**: Mostradas en pantalla de login

### ✅ Base de Datos
- **Estructura completa**: Todas las tablas según nuevo esquema
- **Datos de prueba**: 26 clientes, 10 vehículos, 10 repartidores, 20 viajes
- **Índices optimizados**: Para consultas rápidas
- **Vista principal**: `v_resumen_rutas` funcional

## 🚀 Instalación y Uso

### Opción 1: Docker (Recomendado)

```bash
# Clonar e iniciar con Docker
git clone <repo-url>
cd R-M-P

# Iniciar todos los servicios
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps
```

### Opción 2: Instalación Manual

#### 1. Base de Datos MySQL
```bash
# Instalar MySQL y crear base de datos
mysql -u root -p
CREATE DATABASE rmp_db;
USE rmp_db;
SOURCE mysql/init/01-init.sql;
SOURCE mysql/init/02-sample-data.sql;
```

#### 2. Backend (Puerto 4000)
```bash
cd server
npm install
npm start
```

#### 3. Frontend (Puerto 3000)
```bash
cd client
npm install
npm run dev
```

## 🔐 Credenciales de Prueba

### Usuarios por Defecto
```
👤 Administrador:
   Username: admin
   Password: admin123
   Rol: administrador

👤 Usuario Demo:
   Username: demo
   Password: demo123
   Rol: operador
```

## 📡 Endpoints API

### Autenticación
```
POST /api/auth/login          # Login con username/password
GET  /api/auth/me             # Usuario actual
PUT  /api/auth/profile        # Actualizar perfil
POST /api/auth/change-password # Cambiar contraseña
```

### Entidades Principales
```
# Usuarios
GET/POST/PUT/DELETE /api/usuarios
GET /api/usuarios/activos
GET /api/usuarios/estadisticas

# Vehículos  
GET/POST/PUT/DELETE /api/vehiculos
GET /api/vehiculos/activos
PUT /api/vehiculos/:id/toggle

# Repartidores
GET/POST/PUT/DELETE /api/repartidores
GET /api/repartidores/activos

# Clientes
GET/POST/PUT/DELETE /api/clientes
GET /api/clientes/activos
GET /api/clientes/zona/:id

# Zonas, Viajes, Visitas
GET/POST/PUT/DELETE /api/zonas
GET/POST/PUT/DELETE /api/viajes  
GET/POST/PUT/DELETE /api/visitas
```

### Reportes
```
GET /api/reportes/resumen-rutas      # Vista principal
GET /api/reportes/metricas-diarias   # Métricas del día
GET /api/reportes/performance/vehiculos
GET /api/reportes/performance/repartidores
```

## 🧪 Verificación del Sistema

### 1. Test de Conectividad
```bash
# Verificar servidor backend
curl http://localhost:4000/api/test

# Verificar esquema de BD
curl http://localhost:4000/api/schema
```

### 2. Test de Login
```bash
# Login con admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Acceso Frontend
```
http://localhost:3000/login
```

## 📊 Datos de Prueba Incluidos

- **3 Roles**: administrador, operador, usuario
- **10 Zonas**: Centro, Norte, Sur, Este, Oeste, etc.
- **10 Vehículos**: Diferentes marcas y capacidades
- **10 Repartidores**: Con licencias y contactos
- **26 Clientes**: Distribuidos en diferentes zonas
- **20 Viajes**: Una semana completa de operaciones
- **Visitas**: Detalles de entregas y recojos

## 🛠️ Solución de Problemas

### Error: "Failed to fetch"
```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:4000/api/test

# 2. Si no responde, iniciar servidor
cd server && npm install && npm start

# 3. Verificar puertos
netstat -tulpn | grep :4000
netstat -tulpn | grep :3000
```

### Error: "Cannot find module"
```bash
# Instalar dependencias
cd server && npm install
cd client && npm install
```

### Error de Base de Datos
```bash
# Verificar conexión MySQL
mysql -u root -p -e "SHOW DATABASES;"

# Recrear base de datos si es necesario
mysql -u root -p < mysql/init/01-init.sql
mysql -u root -p < mysql/init/02-sample-data.sql
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rmp_db
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=REMOVED_SECRET
JWT_EXPIRES_IN=24h

# Puerto servidor
PORT=4000
```

## 📈 Funcionalidades Principales

### ✅ Completamente Implementado
- Login con username/password
- CRUD de todas las entidades
- Soft delete con campo `activo`
- Sistema de roles y permisos
- Auditoría completa
- Reportes con vista optimizada
- Datos de prueba realistas

### 🔜 Mejoras Futuras
- Dashboard con gráficos
- Notificaciones en tiempo real
- Exportación de reportes (PDF/Excel)
- API de geolocalización
- App móvil

## 📚 Estructura del Proyecto

```
R-M-P/
├── client/                 # Frontend Next.js
│   ├── app/               # Pages de la aplicación
│   ├── components/        # Componentes reutilizables
│   └── contexts/          # Context providers
├── server/                # Backend Node.js
│   ├── controllers/       # Lógica de negocio
│   ├── routes/           # Rutas de la API
│   ├── middleware/       # Middlewares
│   └── config/           # Configuración
├── mysql/                 # Base de datos
│   └── init/             # Scripts de inicialización
└── docker-compose.yml    # Configuración Docker
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Notas Técnicas

- **Framework Backend**: Express.js con MySQL2
- **Framework Frontend**: Next.js 14 con TypeScript
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT con bcrypt
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: React Context API

## 📞 Soporte

Para problemas o preguntas:
1. Revisar la sección de solución de problemas
2. Verificar logs del servidor: `docker-compose logs server`
3. Verificar logs de la BD: `docker-compose logs mysql`

---

**✨ Sistema completamente adaptado y listo para usar**

*Última actualización: 2024-01-20*
*Versión: 2.0.0*
*Esquema BD: 01-init.sql*