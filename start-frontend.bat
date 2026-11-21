@echo off
title Customer Loan System - Frontend (Port 5173)
cd /d "%~dp0frontend"
echo ========================================================
echo  Customer Loan Eligibility System - React Vite Frontend
echo  Port: 5173 ^| Proxy to http://localhost:8080
echo ========================================================
npm.cmd run dev
pause
