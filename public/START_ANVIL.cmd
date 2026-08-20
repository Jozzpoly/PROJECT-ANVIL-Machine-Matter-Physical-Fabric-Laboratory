@echo off
setlocal
cd /d "%~dp0"
title PROJECT ANVIL - Browser artifact
echo PROJECT ANVIL - Browser artifact
echo Reading provenance and entry point from this exact artifact...
echo No scientific owner gate is active by default.
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-anvil.ps1"
if errorlevel 1 (
  echo.
  echo ANVIL launcher stopped with an error.
  pause
)
endlocal
