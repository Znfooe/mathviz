# MathViz One-Click Start Script (PowerShell)
# Usage: .\start.ps1  (double-click start.bat)
# ASCII-only on purpose: Windows PowerShell 5.1 mis-reads UTF-8 without BOM.

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
Write-Host "[1/3] Checking dependencies..." -ForegroundColor Cyan

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
Write-Host "[2/3] Starting dev servers..." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001" -ForegroundColor White

# ------------------------------------------------------------------
# Background watcher: open the browser ONLY after the platform is warm
# (server up + two consecutive fast responses), so the first page you
# see always renders in about one second instead of spinning 10-30s.
# ------------------------------------------------------------------
Start-Job -ScriptBlock {
    $url = "http://localhost:5173/"
    $deadline = (Get-Date).AddMinutes(3)
    $started = $false

    function Test-WarmupMs {
        try {
            $t = Measure-Command {
                $script:resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
            }
            if ($resp.StatusCode -eq 200) { return [int]$t.TotalMilliseconds }
            return -1
        } catch { return -1 }
    }

    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 800
        $ms = Test-WarmupMs
        if (-not $started -and $ms -ge 0) {
            $started = $true
            continue
        }
        if ($started -and $ms -ge 0 -and $ms -lt 1500) {
            $ms2 = Test-WarmupMs
            if ($ms2 -ge 0 -and $ms2 -lt 1500) {
                Start-Process $url
                break
            }
        }
    }
} | Out-Null

Write-Host "[3/3] Dev servers are starting (logs below)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  The browser will open AUTOMATICALLY when the platform is ready." -ForegroundColor Green
Write-Host "  First launch compiles dependencies: usually 10~30 seconds." -ForegroundColor Gray
Write-Host "  Close this window (or Ctrl+C) to stop the platform." -ForegroundColor Gray
Write-Host ""

# Foreground: keep the original behavior (visible logs, Ctrl+C stops all)
npm run dev
