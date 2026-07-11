# ============================================================================
# AgentPass — Run Demo (Windows PowerShell)
# Starts all services + runs the 3-act agent demo
# ============================================================================

Write-Host ""
Write-Host "  [*] Starting AgentPass Demo..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Refresh PATH to pick up recently installed tools
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ── Start Backend ────────────────────────────────────────────────────────────
Write-Host "  [*] Starting FastAPI issuer service on port 8000..." -ForegroundColor Yellow

# Kill any existing instance on port 8000
$existing = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($existing) {
    $existing | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

$backendJob = Start-Process -FilePath "$ScriptDir\issuer-service\venv\Scripts\python.exe" `
    -ArgumentList "-m", "uvicorn", "main:app", "--port", "8000", "--log-level", "warning" `
    -WorkingDirectory "$ScriptDir\issuer-service" `
    -WindowStyle Hidden `
    -PassThru

Write-Host "  [+] Backend PID: $($backendJob.Id)" -ForegroundColor Green

# ── Start Frontend ───────────────────────────────────────────────────────────
Write-Host "  [*] Starting Next.js storefront on port 3000..." -ForegroundColor Yellow

# Kill any existing instance on port 3000
$existing3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($existing3000) {
    $existing3000 | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

# Run npm dev via cmd.exe since npm is a cmd script
$frontendJob = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm", "run", "dev", "--", "-p", "3000" `
    -WorkingDirectory "$ScriptDir\storefront" `
    -WindowStyle Hidden `
    -PassThru

Write-Host "  [+] Frontend PID: $($frontendJob.Id)" -ForegroundColor Green

# ── Wait for services ───────────────────────────────────────────────────────
Write-Host "  [*] Waiting for services to be ready..." -ForegroundColor Yellow

$maxWait = 30
for ($i = 0; $i -lt $maxWait; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
Write-Host "  [+] Backend ready" -ForegroundColor Green

for ($i = 0; $i -lt $maxWait; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
Write-Host "  [+] Frontend ready" -ForegroundColor Green

Write-Host ""
Write-Host "  [!] Open http://localhost:3000 to see the landing page" -ForegroundColor Cyan
Write-Host "  [!] Open http://localhost:3000/store to watch the activity log" -ForegroundColor Cyan
Write-Host ""

# ── Run Demo Agent ───────────────────────────────────────────────────────────
Write-Host "  [*] Running 3-act demo agent..." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

# Force UTF-8 mode for Python to prevent Unicode encoding errors
& "$ScriptDir\demo-agent\venv\Scripts\python.exe" "-X" "utf8" "$ScriptDir\demo-agent\demo_agent.py"

# ── Keep running ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Services are still running. Press Ctrl+C to stop." -ForegroundColor DimGray
Write-Host "  Backend: http://localhost:8000/docs" -ForegroundColor DimGray
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor DimGray
Write-Host ""

try {
    Wait-Process -Id $backendJob.Id
} finally {
    Write-Host "  [-] Stopping services..." -ForegroundColor Yellow
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
    # Also kill any node processes spawned by npm
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -gt (Get-Date).AddHours(-1) } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  [+] All services stopped" -ForegroundColor Green
}
