# PostgreSQL Portable Setup & Startup Script
# Runs PostgreSQL in user space on Windows without administrator privileges.

$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Get-Location
}
$rootDir = Split-Path $scriptDir -Parent
$dbDir = Join-Path $rootDir "db"
$pgsqlDir = Join-Path $dbDir "pgsql"
$dataDir = Join-Path $dbDir "data"
$zipPath = Join-Path $dbDir "postgresql-binaries.zip"
$port = 5432

Write-Host "=== PostgreSQL Portable Setup ===" -ForegroundColor DarkCyan
Write-Host "Project Root: $rootDir" -ForegroundColor Gray
Write-Host "Database Folder: $dbDir" -ForegroundColor Gray

# Ensure db directory exists
if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Path $dbDir | Out-Null
}

# 1. Download PostgreSQL Binaries if not present
if (-not (Test-Path $pgsqlDir)) {
    Write-Host "PostgreSQL binaries not found at $pgsqlDir." -ForegroundColor Yellow
    Write-Host "Downloading portable PostgreSQL 15.3 for Windows x64 (approx. 200MB)..." -ForegroundColor Cyan
    Write-Host "This might take a minute depending on your internet connection." -ForegroundColor Cyan
    
    $ProgressPreference = 'SilentlyContinue'
    $url = "https://get.enterprisedb.com/postgresql/postgresql-15.3-1-windows-x64-binaries.zip"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipPath -TimeoutSec 300
        Write-Host "Download complete. Extracting ZIP to $dbDir..." -ForegroundColor Cyan
        Expand-Archive -Path $zipPath -DestinationPath $dbDir
        Remove-Item $zipPath -Force
        Write-Host "PostgreSQL extracted successfully." -ForegroundColor Green
    } catch {
        Write-Error "Failed to download or extract PostgreSQL binaries: $_"
        exit 1
    }
} else {
    Write-Host "PostgreSQL binaries found." -ForegroundColor Green
}

# 2. Initialize Database Cluster if data folder doesn't exist
if (-not (Test-Path $dataDir)) {
    Write-Host "Initializing database cluster in $dataDir..." -ForegroundColor Cyan
    $initdb = Join-Path $pgsqlDir "bin\initdb.exe"
    if (-not (Test-Path $initdb)) {
        Write-Error "initdb.exe not found at $initdb!"
        exit 1
    }
    
    # Run initdb with no password and trust authentication for localhost dev
    & $initdb -D $dataDir -U postgres -A trust
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Database initialization failed with exit code $LASTEXITCODE."
        exit 1
    }
    Write-Host "Database cluster initialized successfully." -ForegroundColor Green
} else {
    Write-Host "Database cluster already initialized." -ForegroundColor Green
}

# 3. Check if port is in use and start server
$conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "Port $port is already in use. Assuming PostgreSQL (or another service) is already running." -ForegroundColor Yellow
} else {
    Write-Host "Starting PostgreSQL server on port $port..." -ForegroundColor Cyan
    $pgctl = Join-Path $pgsqlDir "bin\pg_ctl.exe"
    $logFile = Join-Path $dbDir "pg_server.log"
    
    # Start pg_ctl as a background process
    & $pgctl -D $dataDir -l $logFile start
    
    # Wait for the database server to start
    $retries = 10
    $started = $false
    while ($retries -gt 0 -and -not $started) {
        Start-Sleep -Seconds 1
        $testConn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($testConn) {
            $started = $true
        }
        $retries--
    }
    
    if ($started) {
        Write-Host "PostgreSQL started successfully." -ForegroundColor Green
    } else {
        Write-Warning "PostgreSQL server start check timed out. Checking pg_server.log might help."
    }
}

# 4. Create taskmanager database if not exists
Write-Host "Checking 'taskmanager' database..." -ForegroundColor Cyan
$createdb = Join-Path $pgsqlDir "bin\createdb.exe"
$psql = Join-Path $pgsqlDir "bin\psql.exe"

# We run createdb and suppress error in case it already exists
& $createdb -U postgres -h localhost -p $port taskmanager 2>$null

# 5. Apply SQL database schema
Write-Host "Applying database schema..." -ForegroundColor Cyan
$schemaFile = Join-Path $rootDir "backend\database.sql"
if (Test-Path $schemaFile) {
    & $psql -U postgres -h localhost -p $port -d taskmanager -f $schemaFile
    Write-Host "Database schema verified/applied successfully." -ForegroundColor Green
} else {
    Write-Warning "Database schema file not found at $schemaFile!"
}

Write-Host "=== PostgreSQL Setup Complete ===" -ForegroundColor Green
Write-Host "You can connect to this database using connection string: postgresql://postgres@localhost:5432/taskmanager" -ForegroundColor Cyan
