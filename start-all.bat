@echo off
title Customer Loan Eligibility System Launcher
echo ======================================================================
echo Launching Customer Loan Eligibility System (Backend + Frontend)
echo ======================================================================
start "Backend - Spring Boot (8080)" "%~dp0start-backend.bat"
timeout /t 5 /nobreak >nul
start "Frontend - React Vite (5173)" "%~dp0start-frontend.bat"
echo System launching... Open http://localhost:5173 in your browser.
