#!/bin/bash

# =================================================
# Script de Verificación Rápida - Módulo de Zonas
# =================================================

echo "🚀 Verificación Rápida del Módulo de Zonas"
echo "============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar estado
show_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Función para mostrar info
show_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para mostrar warning
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🔍 1. Verificando servicios Docker..."
echo "-----------------------------------"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    show_status 1 "Docker no está instalado"
    exit 1
fi

# Verificar contenedores
echo "📦 Verificando contenedores Docker..."
docker_status=$(sudo docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null)

if echo "$docker_status" | grep -q "rmp_client.*Up"; then
    show_status 0 "Cliente frontend funcionando"
else
    show_status 1 "Cliente frontend no está corriendo"
fi

if echo "$docker_status" | grep -q "rmp_server.*Up"; then
    show_status 0 "Servidor backend funcionando"
else
    show_status 1 "Servidor backend no está corriendo"
fi

if echo "$docker_status" | grep -q "rmp_mysql.*Up"; then
    show_status 0 "Base de datos funcionando"
else
    show_status 1 "Base de datos no está corriendo"
fi

echo ""
echo "🌐 2. Verificando conectividad..."
echo "--------------------------------"

# Verificar frontend
show_info "Probando frontend en http://localhost:3000..."
if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
    show_status 0 "Frontend accesible"
else
    show_status 1 "Frontend no accesible"
fi

# Verificar backend
show_info "Probando backend en http://localhost:4000..."
if curl -s -f http://localhost:4000 >/dev/null 2>&1; then
    show_status 0 "Backend accesible"
else
    show_status 1 "Backend no accesible"
fi

# Verificar proxy
show_info "Probando proxy API..."
if curl -s -f http://localhost:3000/api/test >/dev/null 2>&1; then
    show_status 0 "Proxy API funcionando"
else
    show_status 1 "Proxy API no funcionando"
fi

echo ""
echo "🔐 3. Verificando autenticación..."
echo "---------------------------------"

# Test de login
login_response=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@rmp.com","password":"admin123"}' 2>/dev/null)

if echo "$login_response" | grep -q '"success":true'; then
    show_status 0 "Login funcionando"

    # Extraer token
    token=$(echo "$login_response" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

    if [ -n "$token" ]; then
        show_info "Token obtenido correctamente"

        # Test estadísticas
        echo ""
        echo "📊 4. Verificando estadísticas de zonas..."
        echo "-----------------------------------------"

        stats_response=$(curl -s -H "Authorization: Bearer $token" \
            http://localhost:3000/api/zonas/estadisticas 2>/dev/null)

        if echo "$stats_response" | grep -q '"success":true'; then
            show_status 0 "Endpoint de estadísticas funcionando"

            zona_count=$(echo "$stats_response" | grep -o '"id_zona":[0-9]*' | wc -l)
            show_info "Zonas encontradas: $zona_count"
        else
            show_status 1 "Endpoint de estadísticas no funcionando"
        fi
    else
        show_status 1 "No se pudo obtener token"
    fi
else
    show_status 1 "Login no funcionando"
fi

echo ""
echo "🎯 5. Resumen Final"
echo "==================="

# URLs importantes
show_info "URLs del sistema:"
echo "   🌐 Frontend: http://localhost:3000/zonas"
echo "   🔧 Backend:  http://localhost:4000"
echo "   💾 DB Admin: http://localhost:8080"

echo ""
show_info "Credenciales de acceso:"
echo "   👤 Admin: admin@rmp.com / admin123"
echo "   👤 Demo:  demo@rmp.com / demo123"

echo ""
echo "🚀 Para acceder al módulo de zonas:"
echo "   1. Abre tu navegador"
echo "   2. Ve a: http://localhost:3000/zonas"
echo "   3. Las tres pestañas deberían funcionar:"
echo "      - 📋 Lista de Zonas"
echo "      - 📊 Estadísticas"
echo "      - 🗺️ Mapa"

echo ""
show_warning "Si alguna verificación falló, ejecuta:"
echo "   sudo docker-compose up -d"
echo "   ./verificar-zonas.sh"

echo ""
echo "✅ Verificación completada!"
