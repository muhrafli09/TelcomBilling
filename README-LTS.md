# TelecomBilling LTS Stack

Upgrade to Long Term Support (LTS) versions for production stability.

## LTS Stack Components

### Backend
- **Laravel 10 LTS** (Support until 2026)
- **PHP 8.1+** (LTS support)
- **MySQL 8.0** (LTS support)
- **Laravel Sanctum** (API Authentication)

### Frontend
- **Next.js 14** (App Router stable)
- **Node.js 18 LTS** (Support until 2025)
- **Tailwind CSS** (Latest stable)
- **Radix UI** (Accessible components)

### Server
- **Nginx 1.24** (Stable branch)
- **Ubuntu 22.04 LTS** (Support until 2027)

## Installation

### Quick Setup
```bash
# Run LTS setup
./lts-setup.sh

# Start backend
cd backend-lts
php artisan serve --host=0.0.0.0 --port=8000

# Start frontend (existing)
cd frontend
npm run dev
```

### Manual Setup

#### Backend (Laravel 10 LTS)
```bash
cd backend-lts
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000
```

#### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```

## Features

### Security
- ✅ Laravel Sanctum authentication
- ✅ CORS protection
- ✅ Rate limiting
- ✅ SQL injection protection
- ✅ XSS protection

### Performance
- ✅ Optimized autoloader
- ✅ Config caching
- ✅ Route caching
- ✅ Database indexing
- ✅ API response caching

### Scalability
- ✅ Queue system ready
- ✅ Redis support
- ✅ Database clustering
- ✅ Load balancer ready
- ✅ Docker support

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Customer Portal
- `GET /api/customer/dashboard` - Dashboard data
- `GET /api/customer/billing` - Billing history
- `GET /api/customer/active-calls` - Active calls

## Environment Variables

### Backend (.env)
```env
APP_NAME="PBX.BIZ.ID"
APP_ENV=production
DB_DATABASE=telecom_billing_lts
DB_USERNAME=telecom
DB_PASSWORD=telecom123
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Production Deployment

### Requirements
- PHP 8.1+
- MySQL 8.0+
- Node.js 18 LTS
- Nginx 1.24+
- SSL Certificate

### Optimization
```bash
# Backend optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --no-dev --optimize-autoloader

# Frontend optimization
npm run build
npm start
```

## Migration from Old Backend

1. **Backup current data**
2. **Update API URLs** in frontend
3. **Test authentication flow**
4. **Migrate database** if needed
5. **Update deployment scripts**

## Support Timeline

- **Laravel 10**: Until February 2026
- **PHP 8.1**: Until November 2024
- **Node.js 18**: Until April 2025
- **MySQL 8.0**: Until April 2026
- **Ubuntu 22.04**: Until April 2027

## Benefits

### Stability
- Long-term security patches
- Predictable update cycle
- Enterprise-grade reliability

### Performance
- Latest optimizations
- Better memory usage
- Faster response times

### Security
- Regular security updates
- Modern encryption standards
- Advanced threat protection