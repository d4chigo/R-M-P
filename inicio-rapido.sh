#!/bin/bash

# ===============================================
# Script de Inicio Rápido - R-M-P
# Sistema de Gestión de Rutas y Transporte
# ===============================================

echo "🚛 ============================================="
echo "   R-M-P - Sistema de Gestión de Transporte"
echo "   Script de Inicio Rápido v2.0"
echo "=============================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto R-M-P"
    exit 1
fi

print_info "Verificando dependencias del sistema..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    print_info "Instalación: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    print_info "Instalación: https://docs.docker.com/compose/install/"
    exit 1
fi

print_success "Docker y Docker Compose están disponibles"

# Mostrar opciones
echo ""
echo "🔧 Selecciona una opción:"
echo "1) Iniciar con Docker (Recomendado)"
echo "2) Instalación manual (Node.js + MySQL)"
echo "3) Solo verificar sistema"
echo "4) Limpiar y reiniciar"
echo ""
read -p "Ingresa tu opción (1-4): " option

case $option in
    1)
        echo ""
        print_info "🐳 Iniciando con Docker..."

        # Detener servicios anteriores si existen
        print_info "Deteniendo servicios anteriores..."
        docker-compose down --remove-orphans 2>/dev/null

        # Construir e iniciar servicios
        print_info "Construyendo e iniciando servicios..."
        if docker-compose up -d --build; then
            print_success "Servicios iniciados correctamente"

            # Esperar a que los servicios estén listos
            print_info "Esperando a que los servicios estén listos..."
            sleep 10

            # Verificar estado de los servicios
            echo ""
            echo "📊 Estado de los servicios:"
            docker-compose ps

            # Verificar conectividad
            echo ""
            print_info "Verificando conectividad..."

            # Verificar backend
            if curl -s http://localhost:4000/api/test > /dev/null; then
                print_success "Backend funcionando en http://localhost:4000"
            else
                print_warning "Backend aún no está listo, puede tomar unos minutos más"
            fi

            # Verificar frontend
            if curl -s http://localhost:3000 > /dev/null; then
                print_success "Frontend funcionando en http://localhost:3000"
            else
                print_warning "Frontend aún no está listo, puede tomar unos minutos más"
            fi

            echo ""
            print_success "🎉 Sistema iniciado correctamente!"
            echo ""
            echo "📱 URLs de acceso:"
            echo "   Frontend: http://localhost:3000"
            echo "   Backend API: http://localhost:4000/api"
            echo "   Test conectividad: http://localhost:4000/api/test"
            echo ""
            echo "🔐 Credenciales de prueba:"
            echo "   👤 Administrador: admin / admin123"
            echo "   👤 Usuario Demo: demo / demo123"
            echo ""
            echo "📋 Comandos útiles:"
            echo "   Ver logs: docker-compose logs -f"
            echo "   Detener: docker-compose down"
            echo "   Reiniciar: docker-compose restart"

        else
            print_error "Error al iniciar los servicios con Docker"
            print_info "Intenta con la opción 2 (instalación manual)"
        fi
        ;;

    2)
        echo ""
        print_info "🔧 Instalación manual..."

        # Verificar Node.js
        if ! command -v node &> /dev/null; then
            print_error "Node.js no está instalado"
            print_info "Descarga desde: https://nodejs.org/"
            exit 1
        fi

        # Verificar npm
        if ! command -v npm &> /dev/null; then
            print_error "npm no está instalado"
            exit 1
        fi

        # Verificar MySQL
        if ! command -v mysql &> /dev/null; then
            print_warning "MySQL no está instalado o no está en PATH"
            print_info "Instala MySQL Server y asegúrate de que esté corriendo"
        fi

        print_info "Node.js $(node --version) y npm $(npm --version) detectados"

        # Instalar dependencias del backend
        echo ""
        print_info "Instalando dependencias del backend..."
        cd server
        if npm install; then
            print_success "Dependencias del backend instaladas"
        else
            print_error "Error instalando dependencias del backend"
            exit 1
        fi
        cd ..

        # Instalar dependencias del frontend
        echo ""
        print_info "Instalando dependencias del frontend..."
        cd client
        if npm install; then
            print_success "Dependencias del frontend instaladas"
        else
            print_error "Error instalando dependencias del frontend"
            exit 1
        fi
        cd ..

        echo ""
        print_success "✅ Instalación completada!"
        echo ""
        print_info "📋 Próximos pasos:"
        echo "1. Configura MySQL y crea la base de datos:"
        echo "   mysql -u root -p -e 'CREATE DATABASE rmp_db;'"
        echo "   mysql -u root -p rmp_db < mysql/init/01-init.sql"
        echo "   mysql -u root -p rmp_db < mysql/init/02-sample-data.sql"
        echo ""
        echo "2. Inicia el backend:"
        echo "   cd server && npm start"
        echo ""
        echo "3. En otra terminal, inicia el frontend:"
        echo "   cd client && npm run dev"
        ;;

    3)
        echo ""
        print_info "🔍 Verificando sistema..."

        # Verificar estructura de archivos
        archivos_clave=(
            "server/index.js"
            "client/package.json"
            "mysql/init/01-init.sql"
            "mysql/init/02-sample-data.sql"
            "docker-compose.yml"
        )

        echo "📂 Verificando archivos principales:"
        for archivo in "${archivos_clave[@]}"; do
            if [ -f "$archivo" ]; then
                print_success "$archivo"
            else
                print_error "$archivo - FALTANTE"
            fi
        done

        # Verificar servicios corriendo
        echo ""
        echo "🌐 Verificando servicios:"

        if curl -s http://localhost:4000/api/test > /dev/null; then
            print_success "Backend corriendo en puerto 4000"
        else
            print_warning "Backend no responde en puerto 4000"
        fi

        if curl -s http://localhost:3000 > /dev/null; then
            print_success "Frontend corriendo en puerto 3000"
        else
            print_warning "Frontend no responde en puerto 3000"
        fi

        # Verificar Docker
        if docker-compose ps 2>/dev/null | grep -q "Up"; then
            print_success "Contenedores Docker corriendo"
            docker-compose ps
        else
            print_info "No hay contenedores Docker corriendo"
        fi
        ;;

    4)
        echo ""
        print_warning "🧹 Limpiando y reiniciando sistema..."

        # Detener Docker
        print_info "Deteniendo contenedores..."
        docker-compose down --remove-orphans --volumes 2>/dev/null

        # Limpiar imágenes Docker
        print_info "Limpiando imágenes Docker..."
        docker system prune -f 2>/dev/null

        # Limpiar node_modules
        print_info "Limpiando node_modules..."
        rm -rf server/node_modules client/node_modules 2>/dev/null
        rm -rf server/package-lock.json client/package-lock.json 2>/dev/null

        print_success "Sistema limpiado"
        print_info "Ejecuta el script nuevamente para reinstalar"
        ;;

    *)
        print_error "Opción no válida"
        exit 1
        ;;
esac

echo ""
print_info "📚 Para más información consulta: README_ADAPTADO.md"
print_info "🐞 Para problemas ejecuta: node diagnostico.js"
echo ""
