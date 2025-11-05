# Real Data Setup Guide

## Overview
This guide explains how to set up the telecom billing system to work with real Asterisk CDR data instead of mock/seeded data.

## Database Setup

### 1. Clean Database (Remove Mock Data)
```bash
# Clear all seeded/mock data
cd /var/www/telecom-billing/backend
php artisan tinker --execute="
use App\Models\{Tenant, Cdr, Extension, ActiveCall};
ActiveCall::query()->delete();
Cdr::query()->delete();
Extension::query()->delete();
Tenant::query()->delete();
"
```

### 2. Auto-Create Tenants from CDR Data
```bash
# Sync tenants from existing CDR accountcodes
php artisan tenants:sync-from-cdr --create-missing
```

This command will:
- Scan CDR table for unique accountcodes
- Auto-create tenants for missing accountcodes
- Map existing CDR records to tenants

## Asterisk CDR Integration

### 1. Configure Asterisk CDR to MySQL
Edit `/etc/asterisk/cdr_mysql.conf`:
```ini
[global]
hostname=127.0.0.1
dbname=laravel
table=cdr
password=laravel123
user=laravel
port=3306
userfield=1
```

### 2. SIP Configuration with AccountCode
Edit `/etc/asterisk/sip.conf`:
```ini
[GLO1122]
type=friend
context=internal
host=dynamic
secret=TRi5sL63alx$fKF3
accountcode=GLO-2510-001  ; This will appear in CDR
```

### 3. Restart Asterisk
```bash
sudo systemctl restart asterisk
# or
sudo asterisk -rx "core reload"
sudo asterisk -rx "module reload cdr_mysql.so"
```

## Tenant Management

### 1. Manual Tenant Creation
Via Admin Panel:
- Go to `/admin/tenants`
- Click "ADD TENANT"
- Fill in:
  - Name: "Glories Company"
  - Domain: "glories.pbx.local"
  - Account Code: "GLO-2510-001" (must match sip.conf)
  - Context: "internal"

### 2. API Tenant Creation
```bash
curl -X POST https://sip.pbx.biz.id/api/tenants \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Glories Company",
    "domain": "glories.pbx.local", 
    "accountcode": "GLO-2510-001",
    "context": "internal",
    "active": true
  }'
```

## Real-Time Data Processing

### 1. CDR Processing Job
The system includes a job to automatically map CDR records to tenants:
```bash
# Process CDR tenant mapping
php artisan queue:work
```

### 2. Scheduled Tasks
Add to crontab for automatic processing:
```bash
# Process CDR mapping every 5 minutes
*/5 * * * * cd /var/www/telecom-billing/backend && php artisan queue:work --once

# Sync tenants daily
0 2 * * * cd /var/www/telecom-billing/backend && php artisan tenants:sync-from-cdr --create-missing
```

## Live Monitoring Setup

### 1. Configure AMI
Edit `/etc/asterisk/manager.conf`:
```ini
[general]
enabled = yes
port = 5038
bindaddr = 127.0.0.1

[monitoring]
secret = monitor123
read = call,cdr,system
write = call,system
```

### 2. Environment Variables
Add to `.env`:
```env
ASTERISK_AMI_HOST=127.0.0.1
ASTERISK_AMI_PORT=5038
ASTERISK_AMI_USERNAME=monitoring
ASTERISK_AMI_SECRET=monitor123
```

### 3. Start AMI Monitor (Optional)
```bash
# Create systemd service for AMI monitoring
sudo systemctl enable asterisk-monitor
sudo systemctl start asterisk-monitor
```

## Customer Portal Access

### 1. User-Tenant Mapping
Link users to tenants via accountcodes:
```sql
-- Option 1: Use existing account_codes table
INSERT INTO account_codes (user_id, account_code) VALUES 
(2, 'GLO-2510-001');  -- customer user gets GLO tenant access

-- Option 2: Direct user update (if using single tenant per user)
UPDATE users SET account_codes = '["GLO-2510-001"]' WHERE id = 2;
```

### 2. Customer Login
- Customer logs in with their credentials
- System maps user to tenant via accountcode
- Dashboard shows real CDR data for their tenant

## Data Verification

### 1. Check CDR Data
```sql
-- Verify CDR records have accountcode
SELECT calldate, src, dst, accountcode, disposition 
FROM cdr 
WHERE accountcode IS NOT NULL 
ORDER BY calldate DESC 
LIMIT 10;
```

### 2. Check Tenant Mapping
```sql
-- Verify tenants are created with correct accountcodes
SELECT id, name, accountcode, active FROM tenants;

-- Check CDR-tenant relationship
SELECT c.calldate, c.src, c.dst, c.accountcode, t.name as tenant_name
FROM cdr c
LEFT JOIN tenants t ON c.accountcode = t.accountcode
LIMIT 10;
```

### 3. Test Customer API
```bash
# Login as customer
TOKEN=$(curl -X POST https://sip.pbx.biz.id/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@pbx.biz.id","password":"password"}' \
  | jq -r '.token')

# Get customer dashboard (should show real data)
curl -H "Authorization: Bearer $TOKEN" \
  https://sip.pbx.biz.id/api/customer/dashboard
```

## Troubleshooting

### 1. No CDR Data
- Check Asterisk CDR configuration
- Verify MySQL connection from Asterisk
- Check CDR table permissions

### 2. Tenant Mapping Issues
```bash
# Re-run tenant sync
php artisan tenants:sync-from-cdr --create-missing

# Process CDR mapping
php artisan tinker --execute="App\Jobs\ProcessCdrTenantMapping::dispatch()"
```

### 3. Customer Portal Shows No Data
- Verify user has correct accountcode mapping
- Check tenant exists with matching accountcode
- Verify CDR records have tenant_id populated

### 4. Live Monitoring Not Working
- Check AMI configuration and connectivity
- Verify AMI credentials in .env
- Test AMI connection manually

## Production Checklist

- [ ] Asterisk CDR configured to write to MySQL
- [ ] SIP peers have correct accountcode
- [ ] Tenants created with matching accountcodes
- [ ] CDR records mapped to tenants
- [ ] Users mapped to correct tenants
- [ ] AMI configured for live monitoring
- [ ] Background jobs running for data processing
- [ ] Customer portal tested with real data

This setup ensures the system works with real Asterisk data instead of mock/seeded data.