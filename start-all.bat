@echo off
title Customer Loan Eligibility System - Master Launcher
echo ========================================================
echo  Customer Loan Eligibility System - Starting All Services
echo ========================================================
echo.
echo [1/2] Starting Spring Boot Backend on http://localhost:8080 ...
start "Loan System Backend" cmd /k "call "%~dp0start-backend.bat""

echo Waiting 6 seconds for backend initialization...
timeout /t 6 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "Loan System Frontend" cmd /k "call "%~dp0start-frontend.bat""

echo.
echo ========================================================
echo  All services launched!
echo  Backend:  http://localhost:8080/api
echo  Frontend: http://localhost:5173
echo ========================================================
