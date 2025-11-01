@echo off
echo ========================================
echo Techspert Production Server Setup
echo ========================================
echo.
echo This script will set up Techspert to run continuously
echo on a production server with PM2 process management.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2 globally...
    call npm install -g pm2
    if errorlevel 1 (
        echo ERROR: Failed to install PM2
        pause
        exit /b 1
    )
    echo ✓ PM2 installed
) else (
    echo ✓ PM2 is already installed
)

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MongoDB is not installed or not in PATH
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo ✓ Node.js, PM2, and MongoDB are ready
echo.

REM Set project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo ========================================
echo Setting up Production Environment...
echo ========================================
echo.

REM Create production environment file
if not exist .env.production (
    echo Creating production environment file...
    copy env.example .env.production >nul
    
    REM Update for production
    powershell -Command "(Get-Content .env.production) -replace 'NODE_ENV=development', 'NODE_ENV=production' | Set-Content .env.production"
    powershell -Command "(Get-Content .env.production) -replace 'PORT=5000', 'PORT=5000' | Set-Content .env.production"
    
    echo ✓ Production .env created
) else (
    echo Production .env already exists
)

REM Install dependencies
echo Installing dependencies...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    call npm install --production
    if errorlevel 1 (
        echo ERROR: Failed to install server dependencies
        pause
        exit /b 1
    )
) else (
    echo Server dependencies already installed
)
cd ..

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

REM Build frontend for production
echo Building frontend for production...
cd client
echo Building React application...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)
cd ..

echo ✓ Frontend built for production
echo.

REM Create PM2 ecosystem file
echo Creating PM2 configuration...
echo {
echo   "apps": [
echo     {
echo       "name": "techspert-backend",
echo       "script": "server/src/index.js",
echo       "cwd": "%PROJECT_DIR%",
echo       "env": {
echo         "NODE_ENV": "production",
echo         "PORT": 5000
echo       },
echo       "env_file": ".env.production",
echo       "instances": "max",
echo       "exec_mode": "cluster",
echo       "watch": false,
echo       "max_memory_restart": "1G",
echo       "error_file": "./logs/backend-error.log",
echo       "out_file": "./logs/backend-out.log",
echo       "log_file": "./logs/backend-combined.log",
echo       "time": true
echo     },
echo     {
echo       "name": "techspert-frontend",
echo       "script": "serve",
echo       "args": "-s client/dist -l 3000",
echo       "cwd": "%PROJECT_DIR%",
echo       "env": {
echo         "NODE_ENV": "production"
echo       },
echo       "instances": 1,
echo       "exec_mode": "fork",
echo       "watch": false,
echo       "max_memory_restart": "500M",
echo       "error_file": "./logs/frontend-error.log",
echo       "out_file": "./logs/frontend-out.log",
echo       "log_file": "./logs/frontend-combined.log",
echo       "time": true
echo     }
echo   ]
echo } > ecosystem.config.js

echo ✓ PM2 configuration created
echo.

REM Install serve globally for frontend
echo Installing serve for frontend hosting...
call npm install -g serve
if errorlevel 1 (
    echo ERROR: Failed to install serve
    pause
    exit /b 1
)

echo ✓ Serve installed
echo.

REM Create logs directory
if not exist logs mkdir logs

REM Start MongoDB service
echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting MongoDB manually...
    start "MongoDB" mongod --dbpath C:\data\db
    timeout /t 3 /nobreak >nul
)

echo ✓ MongoDB started
echo.

REM Seed the database
echo Seeding database...
cd server
npm run seed
if %errorlevel% neq 0 (
    echo WARNING: Database seeding failed, but continuing...
)
cd ..

echo ✓ Database seeded
echo.

echo ========================================
echo Starting Production Services with PM2...
echo ========================================
echo.

REM Stop any existing PM2 processes
echo Stopping existing PM2 processes...
pm2 delete all >nul 2>&1

REM Start services with PM2
echo Starting backend service...
pm2 start ecosystem.config.js --only techspert-backend

echo Starting frontend service...
pm2 start ecosystem.config.js --only techspert-frontend

echo ✓ All services started with PM2
echo.

REM Save PM2 configuration
echo Saving PM2 configuration...
pm2 save

REM Setup PM2 startup
echo Setting up PM2 startup...
pm2 startup
echo.
echo NOTE: Run the command shown above as Administrator to enable auto-startup
echo.

echo ========================================
echo 🚀 Techspert Production Server Ready!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo Admin Panel: http://localhost:3000/admin
echo Health Check: http://localhost:5000/health
echo.
echo Default Admin Login:
echo Email: admin@techspert.com
echo Password: admin123456
echo.
echo PM2 Status:
pm2 status
echo.
echo ========================================
echo Production Management Commands
echo ========================================
echo.
echo To view logs:
echo   pm2 logs
echo   pm2 logs techspert-backend
echo   pm2 logs techspert-frontend
echo.
echo To restart services:
echo   pm2 restart all
echo   pm2 restart techspert-backend
echo   pm2 restart techspert-frontend
echo.
echo To stop services:
echo   pm2 stop all
echo   pm2 stop techspert-backend
echo   pm2 stop techspert-frontend
echo.
echo To monitor:
echo   pm2 monit
echo.
echo To view status:
echo   pm2 status
echo.
echo To delete services:
echo   pm2 delete all
echo.

echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo ========================================
echo Production Setup Complete!
echo ========================================
echo.
echo Your Techspert application is now running in production mode
echo with PM2 process management for high availability and auto-restart.
echo.
pause
