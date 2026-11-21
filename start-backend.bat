@echo off
title Customer Loan System - Backend (Port 8080)
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12.1"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0backend"
echo ========================================================
echo  Customer Loan Eligibility System - Spring Boot Backend
echo  Port: 8080 ^| MySQL / H2 Storage ^| JWT Auth
echo ========================================================
call mvnw.cmd spring-boot:run
pause
