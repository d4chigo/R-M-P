#!/bin/bash

# ==============================
# SCRIPT DE INICIO RÁPIDO - MÓDULO DE ZONAS
# Sistema R-M-P (Route Management Platform)
# ==============================

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_section() {
    echo -e "\n${CYAN}====================================${NC}"
    echo -e "${CYAN}🗺️  $1${NC}"
    echo -e "${CYAN}====================================${NC}"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar si un puerto está en uso
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Función para esperar que un servicio esté disponible
wait_for_service() {
    local url=$1
    local timeout=${2:-30}
    local count=0

    echo -n "Esperando que $url esté disponible"
    while ! curl -s "$url" >/dev/null 2>&1; do
        if [ $count -ge $timeout ]; then
            echo ""
            log_error "Timeout esperando $url"
            return 1
        fi
        echo -n "."
        sleep 1
        ((count++))
    done
    echo ""
    log_success "$url está disponible"
}

# Verificar requisitos del sistema
check_requirements() {
    log_section "VERIFICANDO REQUISITOS"

    # Verificar Node.js
    if command_exists node; then
        local node_version=$(node --version)
        log_success "Node.js encontrado: $node_version"
    else
        log_error "Node.js no encontrado. Instala Node.js 18+ desde https://nodejs.org/"
        exit 1
    fi

    # Verificar npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        log_success "npm encontrado: v$npm_version"
    else
        log_error "npm no encontrado"
        exit 1
    fi

    # Verificar Docker
    if command_exists docker; then
        log_success "Docker encontrado"
    else
        log_warning "Docker no encontrado. Se necesita para la base de datos MySQL"
    fi

    # Verificar Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        log_success "Docker Compose encontrado"
    else
        log_warning "Docker Compose no encontrado"
    fi

    # Verificar curl
    if command_exists curl; then
        log_success "curl encontrado"
    else
        log_error "curl no encontrado. Instala curl para las pruebas"
        exit 1
    fi
}

# Configurar base de datos
setup_database() {
    log_section "CONFIGURANDO BASE DE DATOS"

    if [ -f "docker-compose.yml" ]; then
        log_info "Iniciando contenedores Docker..."

        # Detener contenedores existentes
        docker-compose down >/dev/null 2>&1 || true

        # Iniciar contenedores
        docker-compose up -d mysql

        log_info "Esperando que MySQL esté listo..."
        sleep 10

        # Verificar conexión a MySQL
        local max_attempts=30
        local attempt=1

        while [ $attempt -le $max_attempts ]; do
            if docker-compose exec -T mysql mysql -u root -prootpassword -e "SELECT 1;" >/dev/null 2>&1; then
                log_success "MySQL está funcionando"
                break
            fi

            log_info "Intento $attempt/$max_attempts - Esperando MySQL..."
            sleep 2
            ((attempt++))
        done

        if [ $attempt -gt $max_attempts ]; then
            log_error "MySQL no pudo iniciarse después de $max_attempts intentos"
            exit 1
        fi

        # Cargar datos de prueba para zonas
        if [ -f "mysql/init/02-datos-prueba-zonas.sql" ]; then
            log_info "Cargando datos de prueba para zonas..."
            docker-compose exec -T mysql mysql -u root -prootpassword rmp_db < mysql/init/02-datos-prueba-zonas.sql
            log_success "Datos de prueba cargados"
        fi

        # Aplicar migración de zonas si existe
        if [ -f "mysql/init/03-migration-zona-upgrade.sql" ]; then
            log_info "Aplicando migración de zona (descripción y coordenadas)..."
            docker-compose exec -T mysql mysql -u root -prootpassword rmp_db < mysql/init/03-migration-zona-upgrade.sql
            log_success "Migración de zona aplicada exitosamente"
        fi

    else
        log_warning "docker-compose.yml no encontrado. Asegúrate de que MySQL esté ejecutándose"
    fi
}

# Instalar dependencias del servidor
setup_server() {
    log_section "CONFIGURANDO SERVIDOR BACKEND"

    if [ -d "server" ]; then
        cd server

        log_info "Instalando dependencias del servidor..."
        npm install

        log_success "Dependencias del servidor instaladas"
        cd ..
    else
        log_error "Directorio 'server' no encontrado"
        exit 1
    fi
}

# Instalar dependencias del cliente
setup_client() {
    log_section "CONFIGURANDO CLIENTE FRONTEND"

    if [ -d "client" ]; then
        cd client

        log_info "Instalando dependencias del cliente..."
        npm install

        log_success "Dependencias del cliente instaladas"
        cd ..
    else
        log_error "Directorio 'client' no encontrado"
        exit 1
    fi
}

# Iniciar servidor backend
start_server() {
    log_section "INICIANDO SERVIDOR BACKEND"

    if port_in_use 4000; then
        log_warning "Puerto 4000 ya está en uso. Deteniendo proceso existente..."
        pkill -f "node.*server" || true
        sleep 2
    fi

    cd server
    log_info "Iniciando servidor en puerto 4000..."
    npm start &
    local server_pid=$!
    cd ..

    # Esperar que el servidor esté disponible
    wait_for_service "http://localhost:4000" 15

    echo $server_pid > .server_pid
    log_success "Servidor backend iniciado (PID: $server_pid)"
}

# Iniciar cliente frontend
start_client() {
    log_section "INICIANDO CLIENTE FRONTEND"

    if port_in_use 3000; then
        log_warning "Puerto 3000 ya está en uso. Deteniendo proceso existente..."
        pkill -f "next.*dev" || true
        sleep 2
    fi

    cd client
    log_info "Iniciando cliente en puerto 3000..."
    npm run dev &
    local client_pid=$!
    cd ..

    # Esperar que el cliente esté disponible
    wait_for_service "http://localhost:3000" 20

    echo $client_pid > .client_pid
    log_success "Cliente frontend iniciado (PID: $client_pid)"
}

# Ejecutar pruebas del módulo de zonas
run_tests() {
    log_section "EJECUTANDO PRUEBAS DEL MÓDULO DE ZONAS"

    if [ -f "test-zonas.js" ]; then
        log_info "Ejecutando pruebas automatizadas..."
        sleep 3  # Dar tiempo para que los servicios se estabilicen

        if node test-zonas.js; then
            log_success "¡Todas las pruebas pasaron! El módulo de zonas está funcionando correctamente"
        else
            log_warning "Algunas pruebas fallaron. Revisa los logs arriba"
        fi
    else
        log_warning "Archivo test-zonas.js no encontrado. Saltando pruebas"
    fi
}

# Mostrar información de acceso
show_access_info() {
    log_section "INFORMACIÓN DE ACCESO"

    echo -e "${GREEN}🎉 ¡Sistema iniciado exitosamente!${NC}\n"

    echo -e "${CYAN}📱 ACCESO AL SISTEMA:${NC}"
    echo -e "   🌐 Frontend: ${BLUE}http://localhost:3000${NC}"
    echo -e "   🗺️  Módulo Zonas: ${BLUE}http://localhost:3000/zonas${NC}"
    echo -e "   🔧 Backend API: ${BLUE}http://localhost:4000${NC}"
    echo -e "   📊 Estado del servidor: ${BLUE}http://localhost:4000/api/test${NC}"

    echo -e "\n${CYAN}🔐 CREDENCIALES DE PRUEBA:${NC}"
    echo -e "   📧 Usuario: ${YELLOW}demo@rmp.com${NC}"
    echo -e "   🔑 Contraseña: ${YELLOW}demo${NC}"

    echo -e "\n${CYAN}🗂️  DATOS DE PRUEBA:${NC}"
    echo -e "   🗺️  25 zonas de ejemplo cargadas con coordenadas GPS"
    echo -e "   📍 Zonas de Lima, Callao y áreas metropolitanas"
    echo -e "   📝 Descripciones detalladas para cada zona"
    echo -e "   🗺️  Mapa interactivo con ubicaciones precisas"

    echo -e "\n${CYAN}🛠️  COMANDOS ÚTILES:${NC}"
    echo -e "   🧪 Ejecutar pruebas: ${YELLOW}node test-zonas.js${NC}"
    echo -e "   📋 Ver logs servidor: ${YELLOW}tail -f server/logs/app.log${NC}"
    echo -e "   🔄 Reiniciar servicios: ${YELLOW}./inicio-zonas.sh restart${NC}"
    echo -e "   ⏹️  Detener servicios: ${YELLOW}./inicio-zonas.sh stop${NC}"

    echo -e "\n${CYAN}📚 DOCUMENTACIÓN:${NC}"
    echo -e "   📖 README Módulo: ${BLUE}MODULO_ZONAS_README.md${NC}"
    echo -e "   🏗️  Esquema BD: ${BLUE}mysql/init/01-init.sql${NC}"
    echo -e "   🧪 Datos prueba: ${BLUE}mysql/init/02-datos-prueba-zonas.sql${NC}"
    echo -e "   🔄 Migración: ${BLUE}mysql/init/03-migration-zona-upgrade.sql${NC}"
    echo -e "   📋 Resumen: ${BLUE}ZONAS_IMPLEMENTATION_SUMMARY.md${NC}"
}

# Función para detener servicios
stop_services() {
    log_section "DETENIENDO SERVICIOS"

    # Detener servidor
    if [ -f ".server_pid" ]; then
        local server_pid=$(cat .server_pid)
        if kill -0 $server_pid 2>/dev/null; then
            log_info "Deteniendo servidor (PID: $server_pid)..."
            kill $server_pid
            log_success "Servidor detenido"
        fi
        rm -f .server_pid
    fi

    # Detener cliente
    if [ -f ".client_pid" ]; then
        local client_pid=$(cat .client_pid)
        if kill -0 $client_pid 2>/dev/null; then
            log_info "Deteniendo cliente (PID: $client_pid)..."
            kill $client_pid
            log_success "Cliente detenido"
        fi
        rm -f .client_pid
    fi

    # Detener procesos adicionales por si acaso
    pkill -f "node.*server" >/dev/null 2>&1 || true
    pkill -f "next.*dev" >/dev/null 2>&1 || true

    log_success "Todos los servicios han sido detenidos"
}

# Función para reiniciar servicios
restart_services() {
    log_section "REINICIANDO SERVICIOS"
    stop_services
    sleep 2
    start_server
    start_client
    show_access_info
}

# Función para mostrar ayuda
show_help() {
    echo -e "${CYAN}🗺️  SCRIPT DE INICIO RÁPIDO - MÓDULO DE ZONAS${NC}"
    echo -e "${CYAN}Sistema R-M-P (Route Management Platform)${NC}\n"

    echo -e "${YELLOW}USO:${NC}"
    echo -e "  ./inicio-zonas.sh [comando]\n"

    echo -e "${YELLOW}COMANDOS:${NC}"
    echo -e "  ${GREEN}start${NC}     Iniciar todos los servicios (por defecto)"
    echo -e "  ${GREEN}stop${NC}      Detener todos los servicios"
    echo -e "  ${GREEN}restart${NC}   Reiniciar todos los servicios"
    echo -e "  ${GREEN}test${NC}      Ejecutar solo las pruebas"
    echo -e "  ${GREEN}setup${NC}     Solo configurar dependencias"
    echo -e "  ${GREEN}db${NC}        Solo configurar base de datos"
    echo -e "  ${GREEN}migrate${NC}   Solo aplicar migración de zonas"
    echo -e "  ${GREEN}help${NC}      Mostrar esta ayuda\n"

    echo -e "${YELLOW}EJEMPLOS:${NC}"
    echo -e "  ./inicio-zonas.sh              # Iniciar todo el sistema"
    echo -e "  ./inicio-zonas.sh stop         # Detener servicios"
    echo -e "  ./inicio-zonas.sh test         # Solo ejecutar pruebas"
    echo -e "  ./inicio-zonas.sh setup        # Solo instalar dependencias"
    echo -e "  ./inicio-zonas.sh migrate      # Solo aplicar migración\n"

    echo -e "${YELLOW}REQUISITOS:${NC}"
    echo -e "  - Node.js 18+"
    echo -e "  - Docker y Docker Compose"
    echo -e "  - curl (para pruebas)"
    echo -e "  - Puertos 3000 y 4000 disponibles\n"
}

# Función principal
main() {
    local command=${1:-start}

    case $command in
        "start")
            check_requirements
            setup_database
            setup_server
            setup_client
            start_server
            start_client
            run_tests
            show_access_info
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "test")
            check_requirements
            run_tests
            ;;
        "setup")
            check_requirements
            setup_server
            setup_client
            log_success "Configuración completada"
            ;;
        "db")
            check_requirements
            setup_database
            ;;
        "migrate")
            check_requirements
            if [ -f "mysql/init/03-migration-zona-upgrade.sql" ]; then
                log_info "Aplicando solo migración de zonas..."
                docker-compose exec -T mysql mysql -u root -prootpassword rmp_db < mysql/init/03-migration-zona-upgrade.sql
                log_success "Migración aplicada exitosamente"
            else
                log_error "Archivo de migración no encontrado"
            fi
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Comando desconocido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Manejo de señales para limpieza
cleanup() {
    echo -e "\n${YELLOW}🛑 Señal de interrupción recibida${NC}"
    stop_services
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto R-M-P"
    log_info "Estructura esperada:"
    log_info "  - server/ (directorio del backend)"
    log_info "  - client/ (directorio del frontend)"
    log_info "  - package.json (archivo de configuración)"
    exit 1
fi

# Ejecutar función principal
main "$@"
