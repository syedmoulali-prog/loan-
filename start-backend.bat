@echo off
title Customer Loan Eligibility Backend (Port 8080)
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12.1"
set "PATH=%JAVA_HOME%\bin;C:\Users\syedr\tools\apache-maven-3.9.16\bin;%PATH%"
cd /d "%~dp0backend"
echo ========================================================
echo Starting Customer Loan Eligibility Backend on Port 8080...
echo ========================================================
call mvn.cmd spring-boot:run
pause
