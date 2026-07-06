@echo off
chcp 65001 >nul

:: Beauty Touch - Build & Start Script (Windows)
:: Usage: double-click or run: start.bat

echo ========================================
echo     Beauty Touch - Build & Start
echo ========================================
echo.

:: Step 1: Build frontend
echo [1/3] Installing frontend dependencies...
call npm install

echo [1/3] Building frontend...
call npm run build

:: Step 2: Install server dependencies
echo [2/3] Installing server dependencies...
cd server
call npm install
cd ..

:: Step 3: Start server
echo [3/3] Starting server...
echo.
echo ========================================
echo   App ready at: http://localhost:3001
echo   Admin login:  http://localhost:3001/#/admin/login
echo   Password:     medical2025
echo ========================================
echo.
echo Press Ctrl+C to stop
echo.

cd server
node server.js
