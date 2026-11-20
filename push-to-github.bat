@echo off
setlocal
set PATH=C:\Users\syedr\tools\mingit\cmd;%PATH%
echo ======================================================================
echo  CUSTOMER LOAN ELIGIBILITY SYSTEM - GITHUB DEPLOYMENT PUSH
echo ======================================================================
echo Target Repository: https://github.com/syedmoulali-prog/customer-loan-eligibility-system-.git
echo Branch: main
echo.
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git push failed. If prompted, please enter your GitHub Personal Access Token (PAT).
    echo Generate a token at: https://github.com/settings/tokens (with 'repo' scope)
    echo.
) else (
    echo.
    echo [SUCCESS] Project successfully pushed to GitHub!
    echo View at: https://github.com/syedmoulali-prog/customer-loan-eligibility-system-
    echo.
)
pause
