# MathViz One-Click Start Script (PowerShell)
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    MathViz - One-Click Start" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "Working directory: $ScriptDir" -ForegroundColor Gray

# Check Node.js
$nodeVersion = node --version 2>&1
if (-not $?) {
    Write-Host "[FAIL] Node.js not found! Please install Node.js 20+" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Node.js detected: $nodeVersion" -ForegroundColor Green

Write-Host ""
Write-Host "[1/2] Checking dependencies..." -ForegroundColor Cyan

# Install root deps if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Root node_modules missing, installing..." -ForegroundColor Yellow
    npm install
    if (-not $?) {
        Write-Host "[FAIL] Root dependency install failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[OK] Root dependencies installed" -ForegroundColor Green
}

# Install client deps if missing
if (-not (Test-Path "client\node_modules")) {
    Write-Host "client/node_modules missing, installing..." -ForegroundColor Yellow
    Push-Location client
    npm install --registry https://registry.npmjs.org/
    if (-not $?) {
        Write-Host "[FAIL] Client dependency install failed" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
} else {
    Write-Host "[OK] Client dependencies installed" -ForegroundColor Green
}

# Install server deps if missing
if (-not (Test-Path "server\node_modules")) {
    Write-Host "server/node_modules missing, installing..." -ForegroundColor Yellow
    Push-Location server
    npm install --registry https://registry.npmjs.org/
    if (-not $?) {
        Write-Host "[FAIL] Server dependency install failed" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
} else {
    Write-Host "[OK] Server dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/2] Starting dev servers..." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
