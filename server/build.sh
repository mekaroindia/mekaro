#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--------------------------------------------------"
echo "Build Script Started"
echo "Current Directory: $(pwd)"
echo "--------------------------------------------------"

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
echo "Installing requirements from requirements.txt..."
python -m pip install -r requirements.txt

# Explicitly install critical package to be absolutely sure
echo "Force installing django-cloudinary-storage..."
python -m pip install django-cloudinary-storage

# Debug: Check if it's there
echo "Verifying installed packages (Cloudinary check):"
python -m pip list | grep cloudinary

# Collect Static
echo "--------------------------------------------------"
echo "Running collectstatic..."
python manage.py collectstatic --no-input

# Migrate
echo "--------------------------------------------------"
echo "Running migrations..."
python manage.py migrate

echo "--------------------------------------------------"
echo "Build Script Completed Successfully"
