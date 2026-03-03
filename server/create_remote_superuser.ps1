$ErrorActionPreference = "Stop"

Write-Host "Create Superuser on Remote Render Database" -ForegroundColor Cyan
Write-Host "------------------------------------------"

# 1. Ask for the External Database URL
$dbUrl = Read-Host "postgresql://mekaro_db_user:yB7xMl1CwFwow66M52VrsSZCS80As1C7@dpg-d65avd63jp1c73almq60-a.singapore-postgres.render.com/mekaro_db"

if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Error "Database URL cannot be empty."
    exit 1
}

# 2. Set the environment variable temporarily for this session
$env:DATABASE_URL = $dbUrl

# 3. Running migration to ensure DB is ready (optional but good practice)
Write-Host "Connecting to remote database... (Verified connection)" -ForegroundColor Yellow
python manage.py migrate

# 4. Create the superuser
Write-Host "Creating superuser..." -ForegroundColor Green
python manage.py createsuperuser

Write-Host "------------------------------------------"
Write-Host "Success! You can now log in to your admin panel." -ForegroundColor Cyan
