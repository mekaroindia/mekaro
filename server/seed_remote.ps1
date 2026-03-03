$ErrorActionPreference = "Stop"

# Database URL (Same as create_admin.ps1)
$env:DATABASE_URL = "postgresql://mekaro_db_user:yB7xMl1CwFwow66M52VrsSZCS80As1C7@dpg-d65avd63jp1c73almq60-a.singapore-postgres.render.com/mekaro_db"

Write-Host "Connecting to Remote Database..." -ForegroundColor Cyan

# Use the virtual environment python directly
$pythonPath = ".\venv\Scripts\python.exe"

if (-not (Test-Path $pythonPath)) {
    Write-Error "Virtual environment not found at $pythonPath"
    exit 1
}

Write-Host "Seeding Categories..." -ForegroundColor Yellow
& $pythonPath seed_categories.py

Write-Host "------------------------------------------"
Write-Host "Success! Categories seeded." -ForegroundColor Green
