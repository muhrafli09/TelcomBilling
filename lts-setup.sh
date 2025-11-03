#!/bin/bash

# Laravel 10 LTS Setup Script for TelecomBilling
echo "🚀 Setting up Laravel 10 LTS Backend..."

# Navigate to LTS backend
cd backend-lts

# Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Create database
echo "🗄️ Setting up database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS telecom_billing_lts;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'telecom'@'localhost' IDENTIFIED BY 'telecom123';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON telecom_billing_lts.* TO 'telecom'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Run migrations
echo "🔄 Running migrations..."
php artisan migrate --force

# Seed database
echo "🌱 Seeding database..."
php artisan db:seed --force

# Publish Sanctum config
echo "🔐 Publishing Sanctum configuration..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Clear and cache config
echo "🧹 Clearing and caching configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:cache

# Set permissions
echo "📁 Setting permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "✅ Laravel 10 LTS Backend setup complete!"
echo "🌐 Start server: php artisan serve --host=0.0.0.0 --port=8000"