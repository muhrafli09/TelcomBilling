# Asterisk Live Monitoring Setup

## Asterisk Manager Interface (AMI) Configuration

### 1. Configure AMI in `/etc/asterisk/manager.conf`:

```ini
[general]
enabled = yes
port = 5038
bindaddr = 127.0.0.1
displayconnects = yes

[admin]
secret = admin123
deny = 0.0.0.0/0.0.0.0
permit = 127.0.0.1/255.255.255.0
read = system,call,log,verbose,command,agent,user,config,cdr,dialplan,originate
write = system,call,log,verbose,command,agent,user,config,cdr,dialplan,originate
```

### 2. Add to Laravel `.env`:

```env
ASTERISK_AMI_HOST=127.0.0.1
ASTERISK_AMI_PORT=5038
ASTERISK_AMI_USERNAME=admin
ASTERISK_AMI_SECRET=admin123
```

## Live Monitoring Features

### 1. **Active Calls Monitoring**
- Real-time display of ongoing calls
- Call state tracking (RINGING, ANSWERED, HANGUP)
- Duration counter for active calls
- Tenant-based filtering

### 2. **Call Statistics**
- Active calls count
- Ringing vs Answered calls
- Today's call statistics
- Success rate calculation

### 3. **Call Control**
- Hangup active calls via AMI
- Channel management
- Call transfer (future feature)

## AMI Events Monitoring

### Key Events to Monitor:

1. **Newchannel** - New call initiated
2. **Hangup** - Call ended
3. **Bridge** - Call answered/connected
4. **Dial** - Outbound call attempt
5. **NewCallerid** - Caller ID updates

### Event Processing Flow:

```
Asterisk → AMI Events → Laravel Service → Database → WebSocket → Frontend
```

## Database Tables

### Active Calls Table:
```sql
CREATE TABLE active_calls (
    id BIGINT PRIMARY KEY,
    uniqueid VARCHAR(255) UNIQUE,
    channel VARCHAR(255),
    src VARCHAR(255),
    dst VARCHAR(255),
    context VARCHAR(255),
    accountcode VARCHAR(255),
    state ENUM('RINGING', 'ANSWERED', 'HANGUP'),
    start_time TIMESTAMP,
    answer_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    duration INT DEFAULT 0,
    tenant_id BIGINT,
    INDEX (accountcode, state),
    INDEX (start_time)
);
```

## Background Service Setup

### 1. Create AMI Monitor Service:

```bash
# Create systemd service
sudo nano /etc/systemd/system/asterisk-monitor.service
```

```ini
[Unit]
Description=Asterisk AMI Monitor
After=network.target asterisk.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/telecom-billing/backend
ExecStart=/usr/bin/php artisan ami:monitor
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 2. Create Artisan Command:

```bash
php artisan make:command AmiMonitorCommand
```

### 3. Enable and Start Service:

```bash
sudo systemctl enable asterisk-monitor
sudo systemctl start asterisk-monitor
sudo systemctl status asterisk-monitor
```

## WebSocket Integration (Optional)

For real-time updates without polling:

### 1. Install Laravel WebSockets:

```bash
composer require pusher/pusher-php-server
composer require laravel/reverb
```

### 2. Configure Broadcasting:

```php
// In AMI Service
use Illuminate\Support\Facades\Broadcast;

private function broadcastCallUpdate($call)
{
    Broadcast::channel('live-monitoring', function () {
        return true; // Add auth logic
    });
    
    broadcast(new CallUpdateEvent($call));
}
```

### 3. Frontend WebSocket:

```javascript
// In React component
useEffect(() => {
    const channel = pusher.subscribe('live-monitoring');
    
    channel.bind('call-update', (data) => {
        setActiveCalls(prev => {
            // Update call in real-time
            return prev.map(call => 
                call.uniqueid === data.uniqueid ? data : call
            );
        });
    });
    
    return () => pusher.unsubscribe('live-monitoring');
}, []);
```

## Testing AMI Connection

### Test AMI connectivity:

```bash
# Test telnet connection
telnet 127.0.0.1 5038

# Login
Action: Login
Username: admin
Secret: admin123

# Get active channels
Action: CoreShowChannels

# Logout
Action: Logoff
```

### Test with PHP:

```php
$ami = new AsteriskAmiService();
try {
    $ami->connect();
    echo "AMI Connected successfully\n";
    $calls = $ami->getActiveCalls();
    print_r($calls);
    $ami->disconnect();
} catch (Exception $e) {
    echo "AMI Error: " . $e->getMessage() . "\n";
}
```

## Security Considerations

1. **AMI Access Control**:
   - Bind AMI to localhost only
   - Use strong passwords
   - Limit permissions per user

2. **Network Security**:
   - Firewall rules for AMI port
   - VPN access for remote monitoring
   - SSL/TLS for web interface

3. **Authentication**:
   - Laravel Sanctum for API access
   - Role-based permissions
   - Session management

## Performance Optimization

1. **Database Indexing**:
   - Index on accountcode, state, start_time
   - Cleanup old active_calls records

2. **Caching**:
   - Redis for active calls cache
   - Rate limiting for API calls

3. **Background Processing**:
   - Queue AMI events processing
   - Batch database updates

## Troubleshooting

### Common Issues:

1. **AMI Connection Failed**:
   - Check Asterisk AMI configuration
   - Verify network connectivity
   - Check firewall rules

2. **Events Not Received**:
   - Verify AMI permissions
   - Check event mask settings
   - Monitor Asterisk logs

3. **Database Performance**:
   - Add missing indexes
   - Clean up old records
   - Optimize queries

### Debug Commands:

```bash
# Check AMI status
sudo asterisk -rx "manager show connected"

# Check active channels
sudo asterisk -rx "core show channels"

# Monitor AMI events
sudo asterisk -rx "manager show events"
```