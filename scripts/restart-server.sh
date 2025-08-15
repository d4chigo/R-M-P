#!/bin/bash

# ==============================
# SCRIPT DE REINICIO DEL SERVIDOR RMP
# Archivo: restart-server.sh
# Descripción: Reinicia el servidor backend con verificaciones
# ==============================

echo "🚀 Script de Reinicio del Servidor RMP"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Navegar al directorio del servidor
SERVER_DIR="$(dirname "$0")/../server"
cd "$SERVER_DIR" || {
    print_error "No se pudo acceder al directorio del servidor"
    exit 1
}

print_info "Directorio actual: $(pwd)"

# Verificar si existe package.json
if [ ! -f "package.json" ]; then
    print_error "package.json no encontrado. ¿Estás en el directorio correcto?"
    exit 1
fi

print_status "package.json encontrado"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

print_status "Node.js versión: $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_status "npm versión: $(npm --version)"

# Buscar y terminar procesos existentes del servidor
print_info "Verificando procesos existentes del servidor..."

# Buscar procesos de Node.js que puedan ser nuestro servidor
EXISTING_PROCESSES=$(ps aux | grep "node.*server" | grep -v grep | awk '{print $2}' || true)

if [ -n "$EXISTING_PROCESSES" ]; then
    print_warning "Terminando procesos existentes del servidor..."
    echo "$EXISTING_PROCESSES" | xargs kill -9 2>/dev/null || true
    sleep 2
    print_status "Procesos terminados"
else
    print_info "No se encontraron procesos existentes del servidor"
fi

# Verificar puerto 4000
print_info "Verificando puerto 4000..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Puerto 4000 está ocupado. Liberando..."
    lsof -ti:4000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if ! lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Puerto 4000 disponible"
else
    print_error "No se pudo liberar el puerto 4000"
    exit 1
fi

# Verificar variables de entorno
print_info "Verificando configuración..."

if [ -f ".env" ]; then
    print_status "Archivo .env encontrado"
else
    print_warning "Archivo .env no encontrado, usando variables por defecto"
fi

# Verificar dependencias
print_info "Verificando dependencias..."

if [ -d "node_modules" ]; then
    print_status "node_modules encontrado"
else
    print_warning "node_modules no encontrado, instalando dependencias..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencias instaladas correctamente"
    else
        print_error "Error al instalar dependencias"
        exit 1
    fi
fi

# Iniciar el servidor
print_info "Iniciando servidor..."

# Verificar si existe script de desarrollo
if npm run | grep -q "dev"; then
    print_info "Ejecutando: npm run dev"
    npm run dev &
    SERVER_PID=$!
elif npm run | grep -q "start"; then
    print_info "Ejecutando: npm start"
    npm start &
    SERVER_PID=$!
else
    print_info "Ejecutando: node index.js"
    node index.js &
    SERVER_PID=$!
fi

# Esperar un momento para que el servidor inicie
sleep 3

# Verificar si el servidor está ejecutándose
if ps -p $SERVER_PID > /dev/null 2>&1; then
    print_status "Servidor iniciado correctamente (PID: $SERVER_PID)"

    # Verificar si el puerto está respondiendo
    sleep 2
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        print_status "Servidor respondiendo en puerto 4000"
    else
        print_warning "Servidor iniciado pero no responde en puerto 4000"
        print_info "Esto es normal si la ruta /api/health no existe"
    fi

    echo ""
    echo "======================================"
    print_status "SERVIDOR REINICIADO EXITOSAMENTE"
    echo "======================================"
    print_info "URL: http://localhost:4000"
    print_info "PID del proceso: $SERVER_PID"
    print_info "Para detener: kill $SERVER_PID"
    echo ""
    print_info "Logs del servidor:"
    echo "======================================"

    # Mostrar logs en tiempo real (opcional)
    # Si quieres que el script termine aquí, comenta la siguiente línea
    wait $SERVER_PID

else
    print_error "Error: El servidor no se inició correctamente"
    exit 1
fi
