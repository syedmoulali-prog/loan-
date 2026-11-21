@echo off
setlocal
set "PATH=C:\Program Files\Git\cmd;C:\Users\syedr\tools\mingit\cmd;%PATH%"

echo ======================================================================
echo   CUSTOMER LOAN ELIGIBILITY SYSTEM - GITHUB PUSH & DEPLOYMENT TOOL
echo ======================================================================
echo.
echo Target Repository: https://github.com/syedmoulali-prog/customer-loan-eligibility-system-.git
echo Target Branch:     main
echo.
echo NOTE: Browser drag-and-drop on GitHub limits to 100 files.
echo       This script uses Git CLI to upload ALL project files cleanly with
echo       automatic .gitignore exclusions (node_modules, target, etc.).
echo.
cd /d "%~dp0"

echo [1/3] Checking Git status...
git status -s

echo.
echo [2/3] Staging and committing any pending changes...
git add .
git commit -m "feat: complete customer loan system with VS Code configs, backup service, and deployment blueprints" 2>nul

echo.
echo [3/3] Pushing all files to GitHub (main branch)...
echo (If a GitHub sign-in window appears, click 'Sign in with browser' or enter your PAT)
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================================
    echo [ERROR] Git push encountered an issue.
    echo If authentication is needed:
    echo  1. Use your GitHub Personal Access Token (PAT) as password.
    echo  2. Or run: git push in VS Code / Git Bash to authenticate interactively.
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo [SUCCESS] All files successfully uploaded to GitHub!
    echo View repository: https://github.com/syedmoulali-prog/customer-loan-eligibility-system-
    echo ======================================================================
)
echo.
pause
