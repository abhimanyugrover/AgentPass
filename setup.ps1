# ============================================================================
# AgentPass — One-Command Setup (Windows PowerShell)
# ============================================================================

Write-Host ""
Write-Host "  +--------------------------------------------------+" -ForegroundColor Cyan
Write-Host "  |          AgentPass Setup                         |" -ForegroundColor Cyan
Write-Host "  +--------------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Python Backend ───────────────────────────────────────────────────────────
Write-Host "  [*] Setting up Python backend..." -ForegroundColor Yellow
Set-Location "$ScriptDir\issuer-service"

if (-not (Test-Path "venv")) {
    python -m venv venv
}
& "$ScriptDir\issuer-service\venv\Scripts\pip.exe" install -r requirements.txt --quiet
Write-Host "  [+] Backend dependencies installed" -ForegroundColor Green

# ── Demo Agent ───────────────────────────────────────────────────────────────
Write-Host "  [*] Setting up demo agent..." -ForegroundColor Yellow
Set-Location "$ScriptDir\demo-agent"

if (-not (Test-Path "venv")) {
    python -m venv venv
}
& "$ScriptDir\demo-agent\venv\Scripts\pip.exe" install -r requirements.txt --quiet
Write-Host "  [+] Demo agent dependencies installed" -ForegroundColor Green

# ── Node.js Frontend ────────────────────────────────────────────────────────
Write-Host "  [*] Setting up Next.js storefront..." -ForegroundColor Yellow
Set-Location "$ScriptDir\storefront"
# Run npm install via cmd.exe since npm is a cmd script
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "install", "--silent" -WorkingDirectory "$ScriptDir\storefront" -NoNewWindow -Wait
Write-Host "  [+] Storefront dependencies installed" -ForegroundColor Green

# ── Done ─────────────────────────────────────────────────────────────────────
Set-Location $ScriptDir
Write-Host ""
Write-Host "  +--------------------------------------------------+" -ForegroundColor Green
Write-Host "  |  [+] Setup complete!                             |" -ForegroundColor Green
Write-Host "  |                                                  |" -ForegroundColor Green
Write-Host "  |  Optional: set LLM_API_KEY env var for AI        |" -ForegroundColor Green
Write-Host "  |  narration in the demo agent.                    |" -ForegroundColor Green
Write-Host "  |                                                  |" -ForegroundColor Green
Write-Host "  |  Run:  .\run_demo.ps1                            |" -ForegroundColor Green
Write-Host "  +--------------------------------------------------+" -ForegroundColor Green
