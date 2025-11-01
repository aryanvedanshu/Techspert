@echo off
echo ========================================
echo Techspert Complete Local Development Setup
echo ========================================
echo.
echo This script will start the complete Techspert project locally
echo with Frontend, Backend, Database, and all services running
echo on your local machine without Docker.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MongoDB is not installed or not in PATH
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo ✓ Node.js and MongoDB are installed
echo.

REM Set project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting MongoDB manually...
    start "MongoDB" mongod --dbpath C:\data\db
    timeout /t 3 /nobreak >nul
)

echo ✓ MongoDB started
echo.

echo Installing dependencies...
echo.

REM Install backend dependencies
echo [1/4] Installing backend dependencies...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install server dependencies
        pause
        exit /b 1
    )
) else (
    echo Server dependencies already installed
)
cd ..

REM Install frontend dependencies
echo [2/4] Installing frontend dependencies...
cd client
if not exist node_modules (
    echo Installing client dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install client dependencies
        pause
        exit /b 1
    )
) else (
    echo Client dependencies already installed
)
cd ..

echo ✓ Dependencies installed
echo.

REM Create environment files if they don't exist
echo [3/4] Setting up environment configuration...

if not exist server\.env (
    echo Creating server environment file...
    copy env.example server\.env >nul
    echo ✓ Server .env created
) else (
    echo Server .env already exists
)

if not exist client\.env.local (
    echo Creating client environment file...
    echo VITE_API_URL=http://localhost:5000/api > client\.env.local
    echo ✓ Client .env.local created
) else (
    echo Client .env.local already exists
)

echo ✓ Environment configured
echo.

REM Seed the database
echo [4/4] Seeding database...
cd server
echo Running database seed...
call npm run seed
cd ..
echo ✓ Database seeding completed
echo.

echo ========================================
echo Starting All Services...
echo ========================================
echo.

REM Start backend server
echo Starting Backend Server (Port 5000)...
start "Techspert Backend" cmd /k "cd server && npm run dev"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend server
echo Starting Frontend Server (Port 5173)...
start "Techspert Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo 🚀 Techspert is now running!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo Admin Panel: http://localhost:5173/admin
echo Health Check: http://localhost:5000/health
echo.
echo Default Admin Login:
echo Email: admin@techspert.com
echo Password: admin123456
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:5173

echo.
echo ========================================
echo Development Environment Ready!
echo ========================================
echo.
echo To stop all services:
echo 1. Close the command windows for Frontend and Backend
echo 2. Stop MongoDB service: net stop MongoDB
echo.
echo To restart: Run this batch file again
echo.
pause
