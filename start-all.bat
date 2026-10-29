@echo off
title ICU Central Command - Launcher
echo ========================================================
echo Starting ICU Central Command Workspace (Backend + Frontend)
echo ========================================================

rem Default to user password if not explicitly set
if not defined DB_PASSWORD set DB_PASSWORD=raja2207

start "ICU Backend [Port 8080]" cmd /k "cd /d "%~dp0backend" && java -jar target\icu-central-command-backend-1.0.0.jar"
timeout /t 4 /nobreak >nul
start "ICU Frontend [Port 5173]" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo Both servers have been launched in separate command windows.
echo Frontend URL: http://localhost:5173
echo Backend API:  http://localhost:8080/api
echo ========================================================
