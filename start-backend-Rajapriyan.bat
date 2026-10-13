@echo off
title ICU Central Command - Backend
cd /d "%~dp0backend"
echo ========================================================
echo Starting ICU Central Command Spring Boot Backend (Port 8080)
echo ========================================================
rem JWT_SECRET (32+ characters) can be set to stay logged in across restarts
if not defined DB_PASSWORD set /p DB_PASSWORD=Enter your MySQL password for user root: raja2207

java -jar target\icu-central-command-backend-1.0.0.jar
pause
