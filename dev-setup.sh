#!/bin/bash

echo "🚀 Setting up TelecomBilling for Development..."

# Check dependencies
command -v php >/dev/null 2>&1 || { echo "PHP is required but not installed."; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "Composer is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "NPM is required but not installed."; exit 1; }

# Setup Backend
echo "🔧 Setting up Laravel backend..."
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite
php artisan migrate
php artisan db:seed

echo "✅ Backend setup completed!"

# Setup Frontend
echo "🎨 Setting up Next.js frontend..."
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

echo "✅ Frontend setup completed!"

# Create CDR directory for testing
mkdir -p ../cdr/$(date +%Y)/$(date +%m)

echo ""
echo "🎉 Development setup completed!"
echo ""
echo "🚀 To start development servers:"
echo "   Backend:  cd backend && php artisan serve"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🔑 Test Accounts:"
echo "   GLO-2510-001 / pass001"
echo "   GLO-2510-002 / pass002"
echo "   GLO-2510-003 / pass003"