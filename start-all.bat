@echo off
title ICU Central Command - Launcher
echo ========================================================
echo Starting ICU Central Command Workspace (Backend + Frontend)
echo ========================================================
start "ICU Backend [Port 8080]" "%~dp0start-backend.bat"
timeout /t 5 /nobreak >nul
start "ICU Frontend [Port 5173]" "%~dp0start-frontend.bat"
echo.
echo Both servers have been launched in separate command windows.
echo Frontend URL: http://localhost:5173
echo Backend API:  http://localhost:8080/api
echo.
