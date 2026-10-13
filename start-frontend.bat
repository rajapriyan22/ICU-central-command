@echo off
title ICU Central Command - Frontend
cd /d "%~dp0frontend"
echo ========================================================
echo Starting ICU Central Command React + Vite Frontend (Port 5173)
echo ========================================================
call npm.cmd run dev
pause
