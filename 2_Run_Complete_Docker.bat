@echo off
echo ========================================
echo Techspert Complete Docker Setup
echo ========================================
echo.
echo This script will start the complete Techspert project using Docker
echo with Frontend, Backend, Database, and Nginx all containerized.
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo Make sure Docker Desktop is running before proceeding.
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker daemon is not running
    echo Please start Docker Desktop application
    echo Waiting for Docker Desktop to start...
    timeout /t 3 /nobreak >nul
    
    REM Try again
    docker ps >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Docker daemon is still not running
        echo Please start Docker Desktop manually and try again
        pause
        exit /b 1
    )
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    echo Please update Docker Desktop to the latest version
    pause
    exit /b 1
)

echo ✓ Docker and Docker Compose are available
echo.

REM Set project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo ========================================
echo Setting up Docker Environment...
echo ========================================
echo.

REM Create environment files if they don't exist
if not exist .env (
    echo Creating main environment file...
    copy env.example .env >nul
    echo ✓ Main .env created
) else (
    echo Main .env already exists
)

REM Update .env for Docker
echo Updating environment for Docker...
powershell -Command "(Get-Content .env) -replace 'MONGO_URI=mongodb://localhost:27017/techspert', 'MONGO_URI=mongodb://mongodb:27017/techspert' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'CLIENT_URL=http://localhost:5173', 'CLIENT_URL=http://localhost' | Set-Content .env"

echo ✓ Environment configured for Docker
echo.

echo ========================================
echo Building and Starting Docker Containers...
echo ========================================
echo.

REM Stop any existing containers
echo Stopping existing containers...
docker compose down >nul 2>&1

REM Build and start all services
echo Building Docker images...
docker compose build --no-cache

if errorlevel 1 (
    echo ERROR: Failed to build Docker images
    pause
    exit /b 1
)

echo ✓ Docker images built successfully
echo.

echo Starting all services...
docker compose up -d

if errorlevel 1 (
    echo ERROR: Failed to start Docker containers
    pause
    exit /b 1
)

echo ✓ All services started
echo.

echo ========================================
echo Waiting for services to be ready...
echo ========================================
echo.

REM Wait for services to be ready
echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo Waiting for backend to be ready...
timeout /t 15 /nobreak >nul

echo Waiting for frontend to be ready...
timeout /t 10 /nobreak >nul

echo ✓ All services are ready
echo.

REM Check if services are running
echo Checking service status...
docker compose ps

echo.
echo ========================================
echo 🚀 Techspert Docker Environment Ready!
echo ========================================
echo.
echo Application: http://localhost
echo Admin Panel: http://localhost/admin
echo Backend API: http://localhost/api
echo Health Check: http://localhost/api/health
echo.
echo Default Admin Login:
echo Email: admin@techspert.com
echo Password: admin123456
echo.
echo Docker Services:
echo - Frontend (React): Port 80
echo - Backend (Node.js): Port 5000
echo - Database (MongoDB): Port 27017
echo - Nginx (Reverse Proxy): Port 80
echo.

REM Seed the database
echo Seeding database...
docker compose exec backend npm run seed

echo.
echo ========================================
echo Opening Application...
echo ========================================
echo.

echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost

echo.
echo ========================================
echo Docker Environment Commands
echo ========================================
echo.
echo To view logs:
echo   docker compose logs -f
echo.
echo To stop all services:
echo   docker compose down
echo.
echo To restart services:
echo   docker compose restart
echo.
echo To rebuild and restart:
echo   docker compose up --build -d
echo.
echo To access backend container:
echo   docker compose exec backend bash
echo.
echo To access database:
echo   docker compose exec mongodb mongosh
echo.
pause
