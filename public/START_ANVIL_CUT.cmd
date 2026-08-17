@echo off
setlocal
cd /d "%~dp0"
title PROJECT ANVIL - CUT owner validation
echo PROJECT ANVIL - ANVIL-01 / CUT
echo Starting the validated local browser artifact...
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-anvil.ps1"
if errorlevel 1 (
  echo.
  echo ANVIL launcher stopped with an error.
  pause
)
endlocal
