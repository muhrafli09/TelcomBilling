# TelecomBilling Application

Customer portal untuk monitoring billing dan active calls berdasarkan AccountCode dari CDR Asterisk.

## Struktur Aplikasi

```
/var/www/telecom-billing/
├── backend/           # Laravel API
├── frontend/          # Next.js Customer Portal
├── nginx/            # Nginx configuration
└── setup.sh          # Installation script
```

## Fitur

### Customer Portal
- Login dengan AccountCode dan password
- Dashboard dengan ringkasan billing
- Monitoring active calls real-time
- History panggilan dengan biaya
- Responsive design

### Backend API
- Authentication dengan Laravel Sanctum
- Integrasi dengan CDR files
- Real-time data dari Asterisk CLI
- RESTful API endpoints

## Installation

1. Jalankan setup script:
```bash
cd /var/www/telecom-billing
./setup.sh
```

2. Tambahkan domain ke /etc/hosts:
```bash
echo "127.0.0.1 telecom-billing.local" >> /etc/hosts
```

## Test Accounts

| Account Code | Password | Rate (IDR/sec) |
|-------------|----------|----------------|
| GLO-2510-001 | pass001 | 7.5 |
| GLO-2510-002 | pass002 | 5.0 |
| GLO-2510-003 | pass003 | 6.0 |

## API Endpoints

### Customer API
- `POST /api/customer/login` - Login
- `GET /api/customer/dashboard` - Dashboard data
- `GET /api/customer/billing?days=30` - Billing history
- `GET /api/customer/active-calls` - Active calls

## Services

### Backend (Laravel)
```bash
cd /var/www/telecom-billing/backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend (Next.js)
```bash
cd /var/www/telecom-billing/frontend
npm run dev # Development
npm run build && npm start # Production
```

## Configuration

### Environment Variables
- Backend: `/var/www/telecom-billing/backend/.env`
- Frontend: `/var/www/telecom-billing/frontend/.env.local`

### CDR Integration
- CDR Path: `/root/cdr/YYYY/MM/CDR_YYYY-MM-DD.csv`
- Format: 27 fields dengan AccountCode di posisi pertama
- Real-time: Asterisk CLI commands

## Access URLs

- Customer Portal: http://telecom-billing.local/customer/login
- API Documentation: http://telecom-billing.local/api
- Admin Portal: http://telecom-billing.local/admin (future)