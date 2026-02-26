param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"
$venvDir = Join-Path $backendDir ".venv"
$venvPython = Join-Path $venvDir "Scripts\\python.exe"

Require-Command "python"
Require-Command "pnpm"

if (-not (Test-Path $backendDir)) {
    throw "Backend directory not found: $backendDir"
}

if (-not (Test-Path $frontendDir)) {
    throw "Frontend directory not found: $frontendDir"
}

if (-not (Test-Path $venvPython)) {
    Write-Host "Creating backend virtual environment..."
    Push-Location $backendDir
    python -m venv .venv
    Pop-Location
}

if (-not $SkipInstall) {
    Write-Host "Installing backend dependencies..."
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r (Join-Path $backendDir "requirements.txt")

    Write-Host "Installing frontend dependencies..."
    Push-Location $frontendDir
    pnpm install
    Pop-Location
} else {
    Write-Host "Skipping dependency installation."
}

Write-Host "Applying database migrations..."
Push-Location $backendDir
& $venvPython manage.py migrate
Pop-Location

Write-Host "Starting backend on http://localhost:8000 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendDir'; & '$venvPython' manage.py runserver 8000"
)

Write-Host "Starting frontend on http://localhost:3000 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendDir'; pnpm dev"
)

Write-Host "Done. Waiting for both servers to initialize..."
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:8000"
