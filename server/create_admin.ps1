$ErrorActionPreference = "Stop"

# Database URL provided by user
$env:DATABASE_URL = "postgresql://mekaro_db_user:yB7xMl1CwFwow66M52VrsSZCS80As1C7@dpg-d65avd63jp1c73almq60-a.singapore-postgres.render.com/mekaro_db"

Write-Host "Using Database: postgresql://.../mekaro_db" -ForegroundColor Cyan

# Use the virtual environment python directly
$pythonPath = ".\venv\Scripts\python.exe"

if (-not (Test-Path $pythonPath)) {
    Write-Error "Virtual environment not found at $pythonPath"
    exit 1
}

Write-Host "Installing ALL required packages..." -ForegroundColor Yellow
& $pythonPath -m pip install -r requirements.txt

Write-Host "Running migrations..." -ForegroundColor Yellow
& $pythonPath manage.py migrate

Write-Host "Creating superuser..." -ForegroundColor Green
& $pythonPath manage.py createsuperuser

Write-Host "------------------------------------------"
Write-Host "Success! Login at https://mekaro-backend.onrender.com/admin/" -ForegroundColor Cyan
