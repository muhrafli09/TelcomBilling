# Asterisk CDR Integration Guide

## Database Configuration

### 1. Configure Asterisk to use MySQL CDR

Edit `/etc/asterisk/cdr_mysql.conf`:

```ini
[global]
hostname=127.0.0.1
dbname=laravel
table=cdr
password=laravel123
user=laravel
port=3306
sock=/var/lib/mysql/mysql.sock
userfield=1
```

### 2. Configure CDR in `/etc/asterisk/cdr.conf`:

```ini
[general]
enable=yes
unanswered=yes
congestion=yes
endbeforehexten=yes
initiatedseconds=yes
```

### 3. Load CDR modules in `/etc/asterisk/modules.conf`:

```ini
load => cdr_mysql.so
load => cdr_csv.so
```

## Tenant Configuration

### 1. Set accountcode per tenant in dialplan

In `/etc/asterisk/extensions.conf`:

```ini
[company-a]
exten => _X.,1,Set(CDR(accountcode)=company-a)
same => n,Set(CDR(userfield)=tenant_1)
same => n,Dial(SIP/trunk/${EXTEN})

[company-b]
exten => _X.,1,Set(CDR(accountcode)=company-b)
same => n,Set(CDR(userfield)=tenant_2)
same => n,Dial(SIP/trunk/${EXTEN})
```

### 2. Set accountcode in SIP peers

In `/etc/asterisk/sip.conf`:

```ini
[1001]
type=friend
secret=SecurePass123
host=dynamic
context=company-a
accountcode=company-a

[2001]
type=friend
secret=SecurePass321
host=dynamic
context=company-b
accountcode=company-b
```

## CDR Table Structure

The CDR table matches Asterisk's standard CDR format:

```sql
CREATE TABLE cdr (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    calldate VARCHAR(255) NOT NULL,
    clid VARCHAR(255),
    src VARCHAR(255) NOT NULL,
    dst VARCHAR(255) NOT NULL,
    dcontext VARCHAR(255),
    channel VARCHAR(255),
    dstchannel VARCHAR(255),
    lastapp VARCHAR(255),
    lastdata VARCHAR(255),
    duration INT DEFAULT 0,
    billsec INT DEFAULT 0,
    disposition VARCHAR(255),
    amaflags INT DEFAULT 0,
    accountcode VARCHAR(255) NOT NULL, -- Tenant identifier
    uniqueid VARCHAR(255) UNIQUE NOT NULL,
    userfield VARCHAR(255),
    cost DECIMAL(10,4) DEFAULT 0,
    tenant_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_calldate_accountcode (calldate, accountcode),
    INDEX idx_src_dst (src, dst),
    INDEX idx_accountcode (accountcode),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

## API Endpoints

### Get CDR Records
```
GET /api/cdr
Parameters:
- tenant_id: Filter by tenant
- accountcode: Filter by account code
- start_date: Start date (YYYY-MM-DD)
- end_date: End date (YYYY-MM-DD)
- src: Source number filter
- dst: Destination number filter
```

### Get CDR Reports
```
GET /api/cdr/reports
Parameters:
- tenant_id: Filter by tenant
- period: Days to look back (default: 30)
```

### Get Tenant CDRs
```
GET /api/tenants/{tenant_id}/cdr
Parameters:
- start_date: Start date
- end_date: End date
```

## Cost Calculation

CDR costs can be calculated using:

1. **Rate tables** - Create rate tables for different destinations
2. **Time-based billing** - Different rates for peak/off-peak hours
3. **Duration rounding** - Round up to nearest minute/second
4. **Minimum billing** - Minimum charge per call

Example cost calculation in CDR trigger:

```sql
DELIMITER $$
CREATE TRIGGER calculate_cdr_cost 
BEFORE INSERT ON cdr 
FOR EACH ROW 
BEGIN
    DECLARE rate DECIMAL(10,4) DEFAULT 0.05;
    
    -- Get rate based on destination
    IF NEW.dst LIKE '+628%' THEN
        SET rate = 0.03; -- Mobile rate
    ELSEIF NEW.dst LIKE '+6221%' THEN
        SET rate = 0.02; -- Local rate
    END IF;
    
    -- Calculate cost (rate per second)
    SET NEW.cost = NEW.billsec * rate;
END$$
DELIMITER ;
```

## Restart Asterisk

After configuration changes:

```bash
sudo systemctl restart asterisk
# or
sudo asterisk -rx "core reload"
sudo asterisk -rx "module reload cdr_mysql.so"
```

## Verify CDR Logging

Check if CDR is working:

```bash
# Check Asterisk CLI
sudo asterisk -rx "cdr show status"

# Check database
mysql -u laravel -p laravel -e "SELECT COUNT(*) FROM cdr;"

# Check recent calls
mysql -u laravel -p laravel -e "SELECT calldate, src, dst, disposition, accountcode FROM cdr ORDER BY calldate DESC LIMIT 10;"
```