@echo off
:loop
echo Starting Elite...
node main/index.js
echo Elite Restarting...
timeout /t 1 /nobreak >nul
goto loop
