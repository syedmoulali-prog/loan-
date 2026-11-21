@echo off
setlocal
set "PATH=C:\Program Files\Git\cmd;C:\Users\syedr\tools\mingit\cmd;%PATH%"

echo ======================================================================
echo   CUSTOMER LOAN ELIGIBILITY SYSTEM - GITHUB PUSH & DEPLOYMENT TOOL
echo ======================================================================
echo.
echo Target Repository: https://github.com/syedmoulali-prog/loanin.git
echo Target Branch:     main
echo.
cd /d "%~dp0"

echo [1/3] Checking Git status...
git status -s

echo.
echo [2/3] Staging and committing changes...
git remote set-url origin https://github.com/syedmoulali-prog/loanin.git
git add .
git commit -m "feat: update customer loan system" 2>nul

echo.
echo [3/3] Pushing to https://github.com/syedmoulali-prog/loanin.git ...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git push encountered an issue.
) else (
    echo.
    echo [SUCCESS] Successfully uploaded to: https://github.com/syedmoulali-prog/loanin
)
echo.
pause
