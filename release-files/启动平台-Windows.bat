@echo off
chcp 65001 >nul
title MathViz - Interactive Math Visualization Platform
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERROR] Node.js was not found on this computer.
  echo.
  echo  Please install Node.js ^(LTS version^) from:
  echo      https://nodejs.org/
  echo.
  echo  After installation, double-click this file again.
  echo.
  pause
  exit /b 1
)

node server.js
echo.
pause
