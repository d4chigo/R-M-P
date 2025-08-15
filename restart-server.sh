#!/bin/bash

# ==============================
# SCRIPT DE REINICIO DEL SERVIDOR
# ==============================
# Este script reinicia el contenedor del servidor para aplicar cambios

echo "🔄 ====================================="
echo "🔄 REINICIANDO SERVIDOR R-M-P"
echo "🔄 ====================================="

# Verificar si Docker está disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado o no está en el PATH"
    exit 1
fi

# Verificar permisos de Docker
if ! docker ps &> /dev/null; then
    echo "⚠️  Necesitas permisos de Docker. Intentando con sudo..."
    USE_SUDO="sudo"
else
    USE_SUDO=""
fi

echo "🔍 Verificando estado de contenedores..."

# Mostrar contenedores actuales
echo "📋 Contenedores actuales:"
$USE_SUDO docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔄 Reiniciando servidor backend..."

# Reiniciar el contenedor del servidor
if $USE_SUDO docker restart rmp_server; then
    echo "✅ Servidor reiniciado exitosamente"
else
    echo "❌ Error al reiniciar el servidor"
    exit 1
fi

echo ""
echo "⏱️  Esperando que el servidor esté listo..."
sleep 5

# Verificar que el servidor esté funcionando
echo "🔍 Verificando estado del servidor..."
$USE_SUDO docker logs rmp_server --tail=10

echo ""
echo "🌐 Probando conectividad..."

# Hacer una prueba de conectividad al servidor
if command -v curl &> /dev/null; then
    echo "📡 Probando endpoint de salud..."
    if curl -s http://localhost:4000/ > /dev/null; then
        echo "✅ Servidor responde correctamente"
        echo "🌐 URL: http://localhost:4000"
        echo "📊 Frontend: http://localhost:3000"
        echo "🗄️  phpMyAdmin: http://localhost:8080"
    else
        echo "⚠️  El servidor aún no responde, dale unos segundos más..."
        echo "💡 Puedes verificar manualmente en: http://localhost:4000"
    fi
else
    echo "💡 Curl no disponible, verifica manualmente:"
    echo "🌐 Servidor: http://localhost:4000"
    echo "📊 Frontend: http://localhost:3000"
    echo "🗄️  phpMyAdmin: http://localhost:8080"
fi

echo ""
echo "🎉 ====================================="
echo "🎉 REINICIO COMPLETADO"
echo "🎉 ====================================="
echo ""
echo "📋 URLs disponibles:"
echo "   🖥️  Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:4000"
echo "   🗄️  phpMyAdmin: http://localhost:8080"
echo ""
echo "📝 Para ver logs en tiempo real:"
echo "   $USE_SUDO docker logs -f rmp_server"
echo ""
echo "🔍 Para verificar todos los contenedores:"
echo "   $USE_SUDO docker ps"
echo ""
