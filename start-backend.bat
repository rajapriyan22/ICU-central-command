@echo off
title ICU Central Command - Backend
cd /d "%~dp0backend"
echo ========================================================
echo Starting ICU Central Command Spring Boot Backend (Port 8080)
echo ========================================================
java -jar target\icu-central-command-backend-1.0.0.jar
pause
