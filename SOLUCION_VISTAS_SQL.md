# 🔧 Solución: Vistas SQL no se creaban en init.sql

## 🐛 Problema Identificado

El script `01-init.sql` tenía una etiqueta HTML mal copiada (`</parameter>`) en la línea 456 que causaba un error de sintaxis SQL, deteniendo la ejecución del script antes de crear las vistas.

## ✅ Solución Aplicada

Se eliminó la etiqueta incorrecta del script:

**Antes:**
```sql
DEALLOCATE PREPARE stmt2;</parameter>
```

**Después:**
```sql
DEALLOCATE PREPARE stmt2;
```

## 🔄 Cómo aplicar la corrección

### Opción 1: Reinicio completo (Recomendado si no tienes datos importantes)

```bash
# 1. Detener y eliminar todo incluyendo volúmenes
docker-compose down -v

# 2. Verificar que los volúmenes fueron eliminados
docker volume ls | grep rmp

# 3. Reiniciar los contenedores
docker-compose up -d --build

# 4. Esperar 30 segundos para que MySQL termine de inicializar
sleep 30

# 5. Verificar que las vistas fueron creadas
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db << 'EOSQL'
SHOW TABLES LIKE 'v_%';
EOSQL
```

### Opción 2: Mantener datos existentes (Script de migración)

Si ya tienes datos y no quieres perderlos, ejecuta este comando para crear las vistas manualmente:

```bash
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db < mysql/migrations/create-all-views.sql
```

## ✅ Resultado Esperado

Deberías ver las siguientes 7 vistas creadas:

- ✅ v_resumen_rutas
- ✅ v_resumen_saldos_centro
- ✅ v_tesoreria_por_centro
- ✅ v_tesoreria_por_persona
- ✅ v_tesoreria_por_vehiculo
- ✅ v_tesoreria_resumen_categoria
- ✅ v_tesoreria_tendencia_mensual

## 🔍 Verificación

Para verificar que todo está funcionando:

```bash
# Ver todas las vistas
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db -e "SHOW TABLES LIKE 'v_%';"

# Probar una consulta
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db -e "SELECT COUNT(*) as total FROM v_resumen_rutas;"
```

## 📝 Nota Importante

**¿Por qué pasó esto?**

Docker MySQL solo ejecuta los scripts de `/docker-entrypoint-initdb.d/` **una sola vez** cuando crea el volumen por primera vez. Si el volumen ya existe, no vuelve a ejecutar los scripts, incluso si los modificas.

Por eso necesitas eliminar el volumen (`docker-compose down -v`) para que vuelva a ejecutar los scripts de inicialización.

---

**Última actualización:** Octubre 2025
