# 🔄 Reinicio Completo de Docker con Volúmenes Limpios

## ⚠️ IMPORTANTE: Esta operación eliminará TODOS los datos

Este proceso borrará toda la base de datos y la recreará desde cero con todos los scripts de inicialización.

## 📝 Pasos a seguir:

### 1. Detener todos los contenedores y eliminar volúmenes
```bash
docker-compose down -v
```

### 2. (Opcional) Verificar que los volúmenes fueron eliminados
```bash
docker volume ls | grep rmp
```

### 3. Reconstruir e iniciar los contenedores
```bash
docker-compose up -d --build
```

### 4. Verificar los logs de MySQL para confirmar la inicialización
```bash
docker-compose logs mysql | grep -E "init|Creating|View"
```

### 5. Verificar que las vistas fueron creadas
```bash
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db << 'EOSQL'
SHOW TABLES LIKE 'v_%';
EOSQL
```

## ✅ Resultado Esperado

Deberías ver las siguientes vistas:
- v_resumen_rutas
- v_resumen_saldos_centro
- v_tesoreria_por_centro
- v_tesoreria_por_persona
- v_tesoreria_por_vehiculo
- v_tesoreria_resumen_categoria
- v_tesoreria_tendencia_mensual

## 📊 Datos que se perderán

- ❌ Todos los usuarios (deberás recrearlos)
- ❌ Todos los centros de distribución
- ❌ Todos los vehículos y repartidores
- ❌ Todos los viajes
- ❌ Todos los registros de tesorería
- ❌ Todos los saldos

## 🎯 Datos que se crearán automáticamente

- ✅ Estructura completa de tablas
- ✅ Vistas SQL
- ✅ Procedimientos almacenados
- ✅ Triggers
- ✅ Roles básicos (ADMINISTRADOR, EMPLEADO)
- ✅ Índices y constraints

---

**Nota:** Si no quieres perder los datos, usa la Opción 2 o 3 del documento principal.
