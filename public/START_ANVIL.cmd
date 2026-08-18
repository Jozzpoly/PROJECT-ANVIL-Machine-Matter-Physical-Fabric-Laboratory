@echo off
setlocal
cd /d "%~dp0"
title PROJECT ANVIL - Forge owner validation
echo PROJECT ANVIL - Forge owner validation
echo Reading the active gate from this exact artifact...
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-anvil.ps1"
if errorlevel 1 (
  echo.
  echo ANVIL launcher stopped with an error.
  pause
)
endlocal
