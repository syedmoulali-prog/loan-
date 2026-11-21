@echo off
setlocal
set "PATH=C:\Program Files\Git\cmd;C:\Users\syedr\tools\mingit\cmd;%PATH%"

echo ======================================================================
echo   CUSTOMER LOAN ELIGIBILITY SYSTEM - GITHUB PUSH & DEPLOYMENT TOOL
echo ======================================================================
echo.
echo Target Repository: https://github.com/syedmoulali-prog/loan-.git
echo Target Branch:     main
echo.
echo NOTE: Browser drag-and-drop on GitHub limits to 100 files.
echo       This script uploads ALL website data and project files cleanly
echo       with automatic .gitignore exclusions (node_modules, target, etc.).
echo.
cd /d "%~dp0"

echo [1/3] Checking Git status...
git status -s

echo.
echo [2/3] Ensuring remote is set to loan-...
git remote set-url origin https://github.com/syedmoulali-prog/loan-.git
git add .
git commit -m "feat: upload all customer loan eligibility website data and configs" 2>nul

echo.
echo [3/3] Pushing all files to https://github.com/syedmoulali-prog/loan-.git ...
echo (If a GitHub sign-in window appears, click 'Sign in with browser' or enter your PAT)
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================================
    echo [ERROR] Git push encountered an authentication issue.
    echo To finish pushing:
    echo  1. Enter your GitHub Personal Access Token (PAT) when prompted.
    echo  2. Or run 'git push -u origin main' in your VS Code terminal.
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo [SUCCESS] All website data successfully uploaded to GitHub!
    echo View repository: https://github.com/syedmoulali-prog/loan-
    echo ======================================================================
)
echo.
pause
