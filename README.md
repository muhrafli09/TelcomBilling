# TelecomBilling Application

Customer portal untuk monitoring billing dan active calls berdasarkan AccountCode dari CDR Asterisk.

## Tech Stack (LTS)

### Backend
- **Laravel 10 LTS** (Support until 2026)
- **PHP 8.1+** (LTS support)
- **MySQL 8.0** (LTS support)
- **Laravel Sanctum** (API Authentication)

### Frontend
- **Next.js 16** (Latest stable)
- **React 19** (Latest)
- **TypeScript 5.9** (Latest)
- **Tailwind CSS** + **Radix UI**

## Struktur Aplikasi

```
/var/www/telecom-billing/
├── backend/           # Laravel 10 LTS API
├── frontend/          # Next.js 16 Customer Portal
├── nginx/            # Nginx configuration
└── cdr/              # CDR files storage
```

## Installation

### Development Setup
```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000

# Frontend
cd frontend
npm install
npm run dev
```

### Production Setup
```bash
# Run production setup (requires root)
sudo ./setup.sh

# Add domain to /etc/hosts
echo "127.0.0.1 telecom-billing.local" >> /etc/hosts
```

## Features

### Customer Portal
- Login dengan email dan password
- Dashboard dengan ringkasan billing
- Monitoring active calls real-time
- History panggilan dengan biaya
- Responsive pixel art design

### Backend API
- Authentication dengan Laravel Sanctum
- Integrasi dengan CDR files
- Real-time data dari Asterisk CLI
- RESTful API endpoints
- Role-based access (admin/customer)

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Customer Portal
- `GET /api/customer/dashboard` - Dashboard data
- `GET /api/customer/billing` - Billing history
- `GET /api/customer/active-calls` - Active calls

## Access URLs

### Development
- Customer Portal: http://localhost:3000/login
- API: http://localhost:8000/api
- Backend: http://localhost:8000

### Production
- Customer Portal: http://telecom-billing.local/login
- API Documentation: http://telecom-billing.local/api
- Admin Portal: http://telecom-billing.local/admin

## Admin Setup

Create first admin user:
```bash
cd backend
php artisan tinker
User::create(['name' => 'Admin', 'email' => 'admin@company.com', 'password' => Hash::make('secure_password'), 'role' => 'admin']);
```

## Security Features

- Laravel Sanctum authentication
- CORS protection
- Rate limiting
- SQL injection protection
- XSS protection
- No dummy data in production

## Support Timeline

- **Laravel 10**: Until February 2026
- **PHP 8.1**: Until November 2024
- **Next.js 16**: Latest stable
- **React 19**: Latest stable