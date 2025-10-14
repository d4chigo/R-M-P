# apply_migration.ps1
# Script para: 1) hacer backup de la BD, 2) aplicar la migración SQL, 3) verificar la tabla creada.
# Requisitos: ejecutar desde la raíz del proyecto (donde está docker-compose.yml). PowerShell (Windows).
# Uso: Abre PowerShell en la carpeta del repo y ejecuta: .\scripts\apply_migration.ps1

Set-StrictMode -Version Latest

Write-Host "=== Script: aplicar migración TESORERIA_SALDO_CENTRO ===" -ForegroundColor Cyan

# Crear carpeta backups
$backupsDir = Join-Path -Path (Get-Location) -ChildPath "backups"
if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir | Out-Null
}

# Timestamp
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $backupsDir "rmp_backup_$ts.sql"

# Hacer dump de la base de datos ejecutando mysqldump dentro del contenedor mysql
Write-Host "[1/4] Creando backup de la base de datos en: $backupFile" -ForegroundColor Yellow
try {
    docker compose exec -T mysql sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > $backupFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "mysqldump devolvió código $LASTEXITCODE" -ForegroundColor Red
        throw "Error en mysqldump"
    }
    Write-Host "Backup completado." -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo crear el backup: $_" -ForegroundColor Red
    exit 1
}

# Aplicar la migración SQL
$migrationPath = Join-Path -Path (Get-Location) -ChildPath "server\migrations\2025_10_11_add_tesoreria_saldo_centro.sql"
if (-not (Test-Path $migrationPath)) {
    Write-Host "ERROR: No se encontró el archivo de migración: $migrationPath" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Aplicando migración: $migrationPath" -ForegroundColor Yellow
try {
    docker compose exec -T mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < $migrationPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "mysql devolvió código $LASTEXITCODE" -ForegroundColor Red
        throw "Error aplicando migración"
    }
    Write-Host "Migración aplicada." -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo aplicar la migración: $_" -ForegroundColor Red
    exit 1
}

# Verificar que la tabla existe
Write-Host "[3/4] Verificando que la tabla TESORERIA_SALDO_CENTRO existe" -ForegroundColor Yellow
try {
    docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -D "$MYSQL_DATABASE" -e "SHOW TABLES LIKE \"TESORERIA_SALDO_CENTRO\";"'
    Write-Host "Comando de verificación ejecutado. Revisa la salida anterior para confirmar existencia." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Falló la verificación: $_" -ForegroundColor Red
}

# Sugerencia: reiniciar servicios
Write-Host "[4/4] Sugerencia: reiniciar backend/client para cargar cambios." -ForegroundColor Cyan
Write-Host "Puedes ejecutar: docker compose up -d --build server client" -ForegroundColor Cyan

Write-Host "=== FIN ===" -ForegroundColor Cyan
