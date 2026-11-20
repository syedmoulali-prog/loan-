@echo off
title Customer Loan Eligibility Frontend (Port 5173)
cd /d "%~dp0frontend"
echo ========================================================
echo Starting Customer Loan Eligibility Frontend on Port 5173...
echo ========================================================
call npm.cmd run dev
pause
