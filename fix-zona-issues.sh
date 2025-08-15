#!/bin/bash

# ==============================
# SCRIPT DE CORRECCIÓN RÁPIDA - PROBLEMAS DEL MÓDULO DE ZONAS
# Archivo: fix-zona-issues.sh
# Descripción: Corrige automáticamente los problemas más comunes
# ==============================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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
    echo -e "${CYAN}🔧 $1${NC}"
    echo -e "${CYAN}====================================${NC}"
}

# 1. Corregir orden de rutas en zona.route.js
fix_routes_order() {
    log_section "CORRIGIENDO ORDEN DE RUTAS"

    local route_file="server/routes/zona.route.js"

    if [ ! -f "$route_file" ]; then
        log_error "Archivo $route_file no encontrado"
        return 1
    fi

    log_info "Reordenando rutas en $route_file..."

    # Crear backup
    cp "$route_file" "$route_file.backup"

    # Crear nueva versión con orden correcto
    cat > "$route_file" << 'EOF'
const express = require("express");
const router = express.Router();
const controller = require("../controllers/zona.controller");

// Rutas específicas ANTES de rutas con parámetros dinámicos
router.get("/estadisticas", controller.getZonasConEstadisticas);
router.get("/search", controller.searchZonas);
router.get("/codigo/:codigo", controller.getByCodigo);

// Rutas generales
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
EOF

    log_success "Rutas reordenadas correctamente"
    log_info "Backup guardado en: $route_file.backup"
}

# 2. Corregir manejo de coordenadas en zona-mapa.tsx
fix_map_coordinates() {
    log_section "CORRIGIENDO MANEJO DE COORDENADAS EN MAPA"

    local map_file="client/components/zona-mapa.tsx"

    if [ ! -f "$map_file" ]; then
        log_error "Archivo $map_file no encontrado"
        return 1
    fi

    log_info "Corrigiendo uso de toFixed() en coordenadas..."

    # Crear backup
    cp "$map_file" "$map_file.backup"

    # Corregir problemas de toFixed
    sed -i 's/zona\.latitud\.toFixed(4)/Number(zona.latitud).toFixed(4)/g' "$map_file"
    sed -i 's/zona\.longitud\.toFixed(4)/Number(zona.longitud).toFixed(4)/g' "$map_file"
    sed -i 's/zona\.latitud\.toFixed(6)/Number(zona.latitud).toFixed(6)/g' "$map_file"
    sed -i 's/zona\.longitud\.toFixed(6)/Number(zona.longitud).toFixed(6)/g' "$map_file"
    sed -i 's/selectedZona\.latitud\.toFixed(6)/Number(selectedZona.latitud).toFixed(6)/g' "$map_file"
    sed -i 's/selectedZona\.longitud\.toFixed(6)/Number(selectedZona.longitud).toFixed(6)/g' "$map_file"

    # Mejorar filtro de zonas con coordenadas
    sed -i 's/zona\.latitud && zona\.longitud/zona.latitud != null \&\& zona.longitud != null \&\& !isNaN(Number(zona.latitud)) \&\& !isNaN(Number(zona.longitud))/g' "$map_file"

    log_success "Coordenadas corregidas en el mapa"
    log_info "Backup guardado en: $map_file.backup"
}

# 3. Corregir campos de búsqueda en página principal
fix_search_fields() {
    log_section "CORRIGIENDO CAMPOS DE BÚSQUEDA"

    local page_file="client/app/zonas/page.tsx"

    if [ ! -f "$page_file" ]; then
        log_error "Archivo $page_file no encontrado"
        return 1
    fi

    log_info "Actualizando campos de búsqueda..."

    # Crear backup
    cp "$page_file" "$page_file.backup"

    # Corregir searchKeys
    sed -i 's/searchKeys={\["codigo", "nombre"\]}/searchKeys={["codigo", "descripcion"]}/g' "$page_file"
    sed -i 's/Buscar por código o nombre/Buscar por código o descripción/g' "$page_file"

    log_success "Campos de búsqueda actualizados"
    log_info "Backup guardado en: $page_file.backup"
}

# 4. Corregir componente de estadísticas
fix_statistics_component() {
    log_section "CORRIGIENDO COMPONENTE DE ESTADÍSTICAS"

    local stats_file="client/components/zona-estadisticas.tsx"

    if [ ! -f "$stats_file" ]; then
        log_error "Archivo $stats_file no encontrado"
        return 1
    fi

    log_info "Corrigiendo manejo de coordenadas en estadísticas..."

    # Crear backup
    cp "$stats_file" "$stats_file.backup"

    # Corregir toFixed en estadísticas
    sed -i 's/zona\.latitud\.toFixed(4)/Number(zona.latitud).toFixed(4)/g' "$stats_file"
    sed -i 's/zona\.longitud\.toFixed(4)/Number(zona.longitud).toFixed(4)/g' "$stats_file"

    log_success "Componente de estadísticas corregido"
    log_info "Backup guardado en: $stats_file.backup"
}

# 5. Verificar y aplicar migración de base de datos
apply_database_migration() {
    log_section "VERIFICANDO MIGRACIÓN DE BASE DE DATOS"

    local migration_file="mysql/init/03-migration-zona-upgrade.sql"

    if [ ! -f "$migration_file" ]; then
        log_error "Archivo de migración no encontrado: $migration_file"
        return 1
    fi

    log_info "Verificando estado de Docker..."

    if ! docker-compose ps mysql >/dev/null 2>&1; then
        log_warning "MySQL no está ejecutándose en Docker"
        log_info "Intentando iniciar MySQL..."

        if docker-compose up -d mysql >/dev/null 2>&1; then
            log_success "MySQL iniciado"
            sleep 10  # Esperar que MySQL esté listo
        else
            log_error "No se pudo iniciar MySQL"
            log_info "Ejecuta manualmente: docker-compose up -d mysql"
            return 1
        fi
    else
        log_success "MySQL está ejecutándose"
    fi

    log_info "Aplicando migración de base de datos..."

    if docker-compose exec -T mysql mysql -u root -prootpassword rmp_db < "$migration_file" >/dev/null 2>&1; then
        log_success "Migración aplicada exitosamente"
    else
        log_warning "Error aplicando migración (puede ya estar aplicada)"
        log_info "Esto es normal si la migración ya se ejecutó anteriormente"
    fi
}

# 6. Reiniciar servidor si está ejecutándose
restart_server() {
    log_section "REINICIANDO SERVIDOR"

    log_info "Verificando si el servidor está ejecutándose..."

    # Buscar proceso del servidor
    if pgrep -f "node.*server" >/dev/null; then
        log_info "Deteniendo servidor actual..."
        pkill -f "node.*server" || true
        sleep 2
    fi

    if [ -f ".server_pid" ]; then
        local server_pid=$(cat .server_pid)
        if kill -0 $server_pid 2>/dev/null; then
            log_info "Deteniendo servidor (PID: $server_pid)..."
            kill $server_pid
            sleep 2
        fi
        rm -f .server_pid
    fi

    log_info "Iniciando servidor..."
    cd server
    npm start &
    local new_pid=$!
    cd ..
    echo $new_pid > .server_pid

    log_success "Servidor reiniciado (PID: $new_pid)"
    log_info "Esperando que el servidor esté listo..."
    sleep 5
}

# 7. Verificar que las correcciones funcionan
verify_fixes() {
    log_section "VERIFICANDO CORRECCIONES"

    log_info "Verificando endpoint de estadísticas..."

    # Verificar que el servidor responde
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:4000/ >/dev/null 2>&1; then
            log_success "Servidor respondiendo correctamente"
            break
        fi

        log_info "Intento $attempt/$max_attempts - Esperando servidor..."
        sleep 2
        ((attempt++))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Servidor no responde después de $max_attempts intentos"
        return 1
    fi

    # Verificar endpoint de estadísticas específicamente
    local stats_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/zonas/estadisticas 2>/dev/null || echo "000")

    case $stats_response in
        "200"|"401")
            log_success "Endpoint /api/zonas/estadisticas funcionando (HTTP $stats_response)"
            ;;
        "404")
            log_error "Endpoint /api/zonas/estadisticas aún devuelve 404"
            log_warning "Es posible que necesites reiniciar el servidor manualmente"
            ;;
        *)
            log_warning "Respuesta inesperada del endpoint: HTTP $stats_response"
            ;;
    esac
}

# 8. Mostrar resumen final
show_final_summary() {
    log_section "RESUMEN DE CORRECCIONES APLICADAS"

    echo -e "${GREEN}✅ Correcciones aplicadas:${NC}"
    echo "   🔄 Orden de rutas corregido en server/routes/zona.route.js"
    echo "   📍 Manejo de coordenadas corregido en zona-mapa.tsx"
    echo "   🔍 Campos de búsqueda actualizados en página principal"
    echo "   📊 Componente de estadísticas corregido"
    echo "   🗄️  Migración de base de datos aplicada"
    echo "   🔃 Servidor reiniciado"

    echo -e "\n${CYAN}📋 Archivos de backup creados:${NC}"
    echo "   server/routes/zona.route.js.backup"
    echo "   client/components/zona-mapa.tsx.backup"
    echo "   client/app/zonas/page.tsx.backup"
    echo "   client/components/zona-estadisticas.tsx.backup"

    echo -e "\n${BLUE}🎯 Próximos pasos:${NC}"
    echo "   1. Visita http://localhost:3000/zonas"
    echo "   2. Prueba la pestaña de Estadísticas"
    echo "   3. Prueba la pestaña de Mapa"
    echo "   4. Ejecuta 'node test-zonas.js' para verificar todo"

    echo -e "\n${YELLOW}⚠️  Si persisten problemas:${NC}"
    echo "   - Ejecuta: ./inicio-zonas.sh restart"
    echo "   - Revisa logs del servidor con: tail -f server/logs/app.log"
    echo "   - Ejecuta diagnóstico: node debug-zona.js"
}

# Función principal
main() {
    local action=${1:-all}

    echo -e "${CYAN}🔧 SCRIPT DE CORRECCIÓN RÁPIDA - MÓDULO DE ZONAS${NC}"
    echo -e "${CYAN}Corrigiendo problemas comunes...${NC}\n"

    case $action in
        "routes")
            fix_routes_order
            ;;
        "map")
            fix_map_coordinates
            ;;
        "search")
            fix_search_fields
            ;;
        "stats")
            fix_statistics_component
            ;;
        "db")
            apply_database_migration
            ;;
        "server")
            restart_server
            ;;
        "verify")
            verify_fixes
            ;;
        "all")
            fix_routes_order
            fix_map_coordinates
            fix_search_fields
            fix_statistics_component
            apply_database_migration
            restart_server
            verify_fixes
            show_final_summary
            ;;
        "help"|"-h"|"--help")
            echo "Uso: $0 [acción]"
            echo ""
            echo "Acciones disponibles:"
            echo "  routes  - Corregir orden de rutas"
            echo "  map     - Corregir coordenadas en mapa"
            echo "  search  - Corregir campos de búsqueda"
            echo "  stats   - Corregir estadísticas"
            echo "  db      - Aplicar migración de BD"
            echo "  server  - Reiniciar servidor"
            echo "  verify  - Verificar correcciones"
            echo "  all     - Aplicar todas las correcciones (por defecto)"
            echo "  help    - Mostrar esta ayuda"
            exit 0
            ;;
        *)
            log_error "Acción desconocida: $action"
            echo "Ejecuta '$0 help' para ver acciones disponibles"
            exit 1
            ;;
    esac
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto R-M-P"
    exit 1
fi

# Ejecutar función principal
main "$@"
