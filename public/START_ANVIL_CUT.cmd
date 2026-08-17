@echo off
setlocal
cd /d "%~dp0"
echo NOTE: START_ANVIL_CUT.cmd is a legacy launcher name.
echo The artifact manifest decides which owner gate is active.
echo.
call "%~dp0START_ANVIL.cmd"
endlocal
