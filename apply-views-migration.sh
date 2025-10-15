#!/bin/bash
# Script para aplicar la migración de vistas SQL sin perder datos

echo "🔧 Aplicando migración de vistas SQL..."
echo ""

# Verificar que Docker está corriendo
if ! docker ps | grep -q rmp_mysql; then
    echo "❌ Error: El contenedor rmp_mysql no está corriendo"
    echo "   Ejecuta: docker-compose up -d"
    exit 1
fi

echo "📊 Vistas actuales:"
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db -e "SHOW TABLES LIKE 'v_%';" 2>/dev/null | grep -v "Tables_in"
echo ""

echo "🚀 Creando todas las vistas..."
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db < mysql/migrations/create-all-views.sql 2>&1 | grep -E "✅|status"
echo ""

echo "📊 Vistas después de la migración:"
docker exec -i rmp_mysql mysql -u root -pREMOVED_SECRET rmp_db -e "SHOW TABLES LIKE 'v_%';" 2>/dev/null | grep -v "Tables_in"
echo ""

echo "✅ Migración completada!"
echo ""
echo "Puedes verificar el resumen de rutas ahora en la aplicación."
