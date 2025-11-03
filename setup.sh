#!/bin/bash

echo "🚀 Setting up TelecomBilling Application..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./setup.sh)"
    exit 1
fi

# Create application directory
APP_DIR="/var/www/telecom-billing"
mkdir -p $APP_DIR

# Copy project files
echo "📁 Copying project files..."
cp -r /home/rafli/VisualStudioCode/TelcomBilling/* $APP_DIR/
chown -R www-data:www-data $APP_DIR

# Install system dependencies
echo "📦 Installing system dependencies..."
apt update
apt install -y nginx php8.1-fpm php8.1-mysql php8.1-xml php8.1-curl php8.1-mbstring php8.1-zip composer nodejs npm

# Setup Backend (Laravel)
echo "🔧 Setting up Laravel backend..."
cd $APP_DIR/backend

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Create .env file
cat > .env << EOF
APP_NAME="TelecomBilling"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://telecom-billing.local

DB_CONNECTION=sqlite
DB_DATABASE=$APP_DIR/backend/database/database.sqlite

CDR_PATH=/root/cdr
ASTERISK_CLI_PATH=/usr/sbin/asterisk
EOF

# Generate app key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite
php artisan migrate --force
php artisan db:seed --force

# Setup Frontend (Next.js)
echo "🎨 Setting up Next.js frontend..."
cd $APP_DIR/frontend

# Install Node dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://telecom-billing.local/api
EOF

# Build production
npm run build

# Setup Nginx
echo "🌐 Configuring Nginx..."
cp $APP_DIR/nginx/telecom-billing.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/telecom-billing.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Create CDR directory
mkdir -p /root/cdr/$(date +%Y)/$(date +%m)

# Set permissions
chown -R www-data:www-data $APP_DIR
chmod +x $APP_DIR/setup.sh

# Start services
echo "🔄 Starting services..."
systemctl restart nginx
systemctl restart php8.1-fpm
systemctl enable nginx
systemctl enable php8.1-fpm

# Add to hosts file
echo "127.0.0.1 telecom-billing.local" >> /etc/hosts

echo "✅ Setup completed!"
echo ""
echo "🌍 Access URLs:"
echo "   Customer Portal: http://telecom-billing.local/customer/login"
echo "   API: http://telecom-billing.local/api"
echo ""
echo "🔑 Test Accounts:"
echo "   GLO-2510-001 / pass001"
echo "   GLO-2510-002 / pass002" 
echo "   GLO-2510-003 / pass003"
echo ""
echo "📝 To start development servers manually:"
echo "   Backend: cd $APP_DIR/backend && php artisan serve --host=0.0.0.0 --port=8000"
echo "   Frontend: cd $APP_DIR/frontend && npm run dev"