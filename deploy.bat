@echo off
echo ========================================
echo Firebase Hosting Deployment
echo ========================================
echo.

echo [1/3] Building application for production...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Build failed!
    echo Please check the errors above and fix them.
    pause
    exit /b 1
)

echo.
echo ✓ Build completed successfully!
echo.

echo [2/3] Verifying build output...
if not exist "dist\index.html" (
    echo ❌ ERROR: Build output not found in dist/ folder
    pause
    exit /b 1
)

echo ✓ Build output verified!
echo.

echo [3/3] Deploying to Firebase Hosting...
firebase deploy --only hosting
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Deployment failed!
    echo Please check:
    echo   1. You are logged in: firebase login
    echo   2. Correct project is selected: firebase use techspert-4270a
    echo   3. Firebase CLI is installed: npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ Deployment successful!
echo ========================================
echo.
echo Your site is live at:
echo   https://techspert-4270a.web.app
echo   https://techspert-4270a.firebaseapp.com
echo.
pause




