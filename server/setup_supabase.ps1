$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Mekaro Supabase Database Setup Script   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ask for the Supabase Database URL
Write-Host "Enter your Supabase PostgreSQL connection string." -ForegroundColor Yellow
Write-Host "It should look like: postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require" -ForegroundColor Gray
$dbUrl = Read-Host "Supabase Connection URI"

if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Error "Database URL cannot be empty."
    exit 1
}

# 2. Check and configure the .env file
$envFile = ".env"
$dbLine = "DATABASE_URL=$dbUrl"

if (Test-Path $envFile) {
    Write-Host "Updating existing .env file..." -ForegroundColor Yellow
    # Read all lines
    $lines = Get-Content $envFile
    # Check if DATABASE_URL already exists
    $found = $false
    $newLines = @()
    foreach ($line in $lines) {
        if ($line -like "DATABASE_URL=*") {
            $newLines += $dbLine
            $found = $true
        } else {
            $newLines += $line
        }
    }
    if (-not $found) {
        $newLines += $dbLine
    }
    $newLines | Set-Content $envFile
} else {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    $dbLine | Set-Content $envFile
}

# 3. Setup temporary env variable for the migrations run in this session
$env:DATABASE_URL = $dbUrl

$pythonPath = ".\venv\Scripts\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Error "Virtual environment not found at $pythonPath. Make sure to create it first."
    exit 1
}

# 4. Running migrations
Write-Host "Applying Django migrations to Supabase database..." -ForegroundColor Yellow
& $pythonPath manage.py migrate

# 5. Ask if user wants to create an admin superuser
$createAdmin = Read-Host "Do you want to create an admin superuser now? (y/n)"
if ($createAdmin.ToLower() -eq 'y' -or $createAdmin.ToLower() -eq 'yes') {
    Write-Host "Creating Django superuser..." -ForegroundColor Green
    & $pythonPath manage.py createsuperuser
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Supabase Setup Completed Successfully!  " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Your .env file has been configured with your Supabase database."
Write-Host "You can now run 'python manage.py runserver' or start your client."
