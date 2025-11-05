# Asterisk AccountCode Mapping Guide

## SIP Configuration Mapping

### Current SIP.conf Format:
```ini
[GLO1122]
type=friend
context=internal
host=dynamic
secret=TRi5sL63alx$fKF3
insecure=invite
transport=wss
disallow=all
allow=ulaw
allow=alaw
allow=gsm
dtmfmode=rfc2833
qualify=yes
nat=force_rport,comedia
directmedia=no
encryption=yes
avpf=yes
rtcp_mux=yes
icesupport=yes
dtlsenable=yes
dtlsverify=no
dtlsautogeneratecert=yes
dtlssetup=actpass
accountcode=GLO-2510-001  # This maps to tenant
```

## Database Tenant Mapping

### Tenants Table Structure:
```sql
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),           -- "Glories Company"
    domain VARCHAR(255),         -- "glories.pbx.local"
    accountcode VARCHAR(255),    -- "GLO-2510-001" (from sip.conf)
    context VARCHAR(255),        -- "internal"
    active BOOLEAN,
    settings JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    UNIQUE KEY (accountcode),
    INDEX (accountcode)
);
```

### Sample Data:
```sql
INSERT INTO tenants (name, domain, accountcode, context, active) VALUES
('Glories Company', 'glories.pbx.local', 'GLO-2510-001', 'internal', 1),
('ABC Company', 'abc.pbx.local', 'ABC-2510-002', 'internal', 1),
('XYZ Company', 'xyz.pbx.local', 'XYZ-2510-003', 'internal', 1);
```

## CDR Integration

### CDR Table with AccountCode:
```sql
-- CDR records will have accountcode from SIP peer
SELECT 
    calldate,
    src,
    dst,
    duration,
    billsec,
    disposition,
    accountcode,  -- "GLO-2510-001"
    cost
FROM cdr 
WHERE accountcode = 'GLO-2510-001'
ORDER BY calldate DESC;
```

### Tenant-CDR Relationship:
```php
// In Laravel, CDR records are linked to tenants via accountcode
$tenant = Tenant::where('accountcode', 'GLO-2510-001')->first();
$cdrs = Cdr::where('accountcode', 'GLO-2510-001')->get();

// Or via relationship
$cdrs = $tenant->cdrs; // if relationship is set up
```

## Customer Portal Access

### User-Tenant Mapping:
```php
// Option 1: Via account_codes table (existing)
$user = User::with('accountCodes')->find(1);
$accountCodes = $user->accountCodes->pluck('account_code'); // ['GLO-2510-001']
$tenants = Tenant::whereIn('accountcode', $accountCodes)->get();

// Option 2: Direct user-tenant relationship (future)
$user->tenants; // Direct relationship
```

### Customer Dashboard API:
```php
// GET /api/customer/dashboard
{
    "user": {
        "id": 1,
        "name": "Customer Name",
        "tenants": [
            {
                "id": 1,
                "name": "Glories Company",
                "accountcode": "GLO-2510-001"
            }
        ]
    },
    "stats": {
        "today_calls": 15,
        "month_calls": 450,
        "total_cost": 125.50,
        "active_calls": 2
    },
    "recent_calls": [...]
}
```

## Live Monitoring Integration

### Active Calls with AccountCode:
```sql
CREATE TABLE active_calls (
    id BIGINT PRIMARY KEY,
    uniqueid VARCHAR(255),
    channel VARCHAR(255),
    src VARCHAR(255),
    dst VARCHAR(255),
    context VARCHAR(255),
    accountcode VARCHAR(255),    -- From AMI events
    state ENUM('RINGING', 'ANSWERED', 'HANGUP'),
    start_time TIMESTAMP,
    tenant_id BIGINT,
    
    INDEX (accountcode),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

### AMI Event Processing:
```php
// When processing AMI Newchannel event
$accountCode = $eventData['AccountCode'] ?? '';  // "GLO-2510-001"
$tenant = Tenant::where('accountcode', $accountCode)->first();

ActiveCall::create([
    'uniqueid' => $eventData['Uniqueid'],
    'channel' => $eventData['Channel'],
    'src' => $eventData['CallerIDNum'],
    'dst' => $eventData['Exten'],
    'accountcode' => $accountCode,
    'tenant_id' => $tenant ? $tenant->id : null,
    'state' => 'RINGING',
    'start_time' => now()
]);
```

## Asterisk Configuration Updates

### 1. Extensions.conf Context Mapping:
```ini
[internal]
; Set accountcode for all calls in this context
exten => _X.,1,Set(CDR(accountcode)=${CHANNEL(accountcode)})
same => n,Dial(SIP/${EXTEN})

; Or set based on caller
exten => _X.,1,Set(CDR(accountcode)=${DB(accountcode/${CALLERID(num)})})
same => n,Dial(SIP/${EXTEN})
```

### 2. SIP Peers with AccountCode:
```ini
; Template for all Glories extensions
[glories-template](!)
type=friend
context=internal
accountcode=GLO-2510-001
host=dynamic
nat=force_rport,comedia
dtmfmode=rfc2833
disallow=all
allow=ulaw,alaw

; Specific extensions
[GLO1122](glories-template)
secret=TRi5sL63alx$fKF3

[GLO1123](glories-template)
secret=AnotherSecret123

; ABC Company extensions
[abc-template](!)
type=friend
context=internal
accountcode=ABC-2510-002
host=dynamic
nat=force_rport,comedia

[ABC2001](abc-template)
secret=AbcSecret123
```

### 3. Manager.conf for AMI:
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

## Customer Portal Features

### 1. Dashboard (/dashboard):
- Today's call statistics
- Monthly call summary
- Total costs for the month
- Active calls count
- Recent call history (last 10 calls)

### 2. Active Calls (/customer/active-calls):
- Real-time active calls for customer's accountcode
- Call duration counters
- Call states (RINGING, ANSWERED)

### 3. CDR History (/customer/cdr-history):
- Paginated call history
- Date range filtering
- Source/destination filtering
- Cost breakdown

## API Endpoints

### Customer APIs:
```
GET /api/customer/dashboard
GET /api/customer/active-calls
GET /api/customer/cdr-history?start_date=2025-11-01&end_date=2025-11-30
```

### Admin APIs (existing):
```
GET /api/tenants                    # List all tenants
POST /api/tenants                   # Create tenant with accountcode
GET /api/cdr?accountcode=GLO-2510-001  # Filter CDR by accountcode
GET /api/live/active-calls?tenant_id=1  # Live monitoring per tenant
```

## Security Considerations

### 1. User Access Control:
```php
// Ensure users can only see their own tenant data
$userAccountCodes = auth()->user()->accountCodes->pluck('account_code');
$allowedTenants = Tenant::whereIn('accountcode', $userAccountCodes)->pluck('id');

// Filter all queries by allowed tenants
$cdrs = Cdr::whereIn('tenant_id', $allowedTenants)->get();
```

### 2. API Rate Limiting:
```php
// In routes/api.php
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/customer/dashboard', [CustomerController::class, 'dashboard']);
});
```

## Testing

### 1. Test AccountCode Mapping:
```bash
# Check tenant-accountcode mapping
mysql -u laravel -p laravel -e "SELECT name, accountcode FROM tenants;"

# Check CDR with accountcode
mysql -u laravel -p laravel -e "SELECT calldate, src, dst, accountcode FROM cdr WHERE accountcode = 'GLO-2510-001' LIMIT 5;"
```

### 2. Test Customer API:
```bash
# Login as customer
curl -X POST https://sip.pbx.biz.id/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@pbx.biz.id","password":"password"}'

# Get customer dashboard
curl -H "Authorization: Bearer TOKEN" \
  https://sip.pbx.biz.id/api/customer/dashboard
```

This mapping ensures that each SIP extension's `accountcode` in Asterisk directly corresponds to a tenant in the billing system, enabling proper call tracking and customer portal access.