#!/bin/bash

echo "Setting up TelecomBilling Application..."

# Backend setup
cd /var/www/telecom-billing/backend

# Install Composer if not exists
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
fi

# Install Laravel dependencies
composer install --no-dev --optimize-autoloader

# Generate app key
php artisan key:generate

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS telecom_billing;"

# Run migrations and seeders
php artisan migrate --force
php artisan db:seed --class=CustomerSeeder

# Frontend setup
cd /var/www/telecom-billing/frontend

# Install Node.js if not exists
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install dependencies
npm install

# Build production
npm run build

# Nginx setup
cp /var/www/telecom-billing/nginx/telecom-billing.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/telecom-billing.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Set permissions
chown -R www-data:www-data /var/www/telecom-billing
chmod -R 755 /var/www/telecom-billing

echo "Setup completed!"
echo "Access: http://telecom-billing.local"
echo "Customer login: http://telecom-billing.local/customer/login"
echo ""
echo "Test accounts:"
echo "GLO-2510-001 / pass001"
echo "GLO-2510-002 / pass002"
echo "GLO-2510-003 / pass003"