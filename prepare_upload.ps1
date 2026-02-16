# Prepare "Clean" Upload Folder for GitHub
$source = "d:\ecomm-django-react"
$dest = "d:\mekaro_clean_upload"

Write-Host "Preparing clean folder at $dest..."

# Clean up previous run
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null

# 1. Copy Server (Exc: venv, pycache, db, .env)
Write-Host "Copying Server..."
# robocopy returns bitmap exit codes. < 8 is success. We suppress output for cleanliness.
robocopy "$source\server" "$dest\server" /E /XD venv __pycache__ .git env /XF db.sqlite3 .env *.pyc *.log /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { Write-Error "Robocopy failed for Server"; exit 1 }

# 2. Copy Client (Exc: node_modules, build, .env)
Write-Host "Copying Client..."
robocopy "$source\client" "$dest\client" /E /XD node_modules build .git /XF .env /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { Write-Error "Robocopy failed for Client"; exit 1 }

# 3. Copy Docs
Write-Host "Copying Docs..."
robocopy "$source\docs" "$dest\docs" /E /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { Write-Error "Robocopy failed for Docs"; exit 1 }

# 4. Copy Root Files (.gitignore)
Copy-Item "$source\.gitignore" "$dest\.gitignore"

Write-Host "--------------------------------------------------------"
Write-Host "SUCCESS! Clean files are ready in: $dest"
Write-Host "--------------------------------------------------------"
exit 0
