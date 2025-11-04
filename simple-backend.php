<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$customers = [
    'GLO-2510-001' => ['password' => 'pass001', 'name' => 'Customer Premium', 'rate' => 7.5],
    'GLO-2510-002' => ['password' => 'pass002', 'name' => 'Customer Standard', 'rate' => 5.0],
    'GLO-2510-003' => ['password' => 'pass003', 'name' => 'Customer Basic', 'rate' => 6.0]
];

function getActiveCalls() {
    $output = shell_exec('asterisk -rx "core show channels concise" 2>/dev/null');
    $calls = [];
    if ($output) {
        foreach (explode("\n", trim($output)) as $line) {
            if (strpos($line, '!') !== false) {
                $parts = explode('!', $line);
                if (count($parts) >= 8) {
                    $calls[] = [
                        'channel' => $parts[0],
                        'extension' => $parts[2],
                        'state' => $parts[4],
                        'duration' => $parts[7]
                    ];
                }
            }
        }
    }
    return $calls;
}

function getBillingData($accountCode) {
    $billingData = [];
    $totalCost = 0;
    
    for ($i = 0; $i < 30; $i++) {
        $date = date('Y-m-d', strtotime("-{$i} days"));
        $yearMonth = date('Y/m', strtotime("-{$i} days"));
        $filename = "/root/cdr/{$yearMonth}/CDR_{$date}.csv";
        
        if (file_exists($filename)) {
            $handle = fopen($filename, 'r');
            $headers = fgetcsv($handle);
            
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($headers, $row);
                
                if ($data['AccountCode'] === $accountCode) {
                    $cost = floatval($data['Total_Cost'] ?? 0);
                    $totalCost += $cost;
                    
                    $billingData[] = [
                        'date' => $data['Call_Date'],
                        'time' => $data['Call_Time'],
                        'destination' => $data['Destination'],
                        'duration' => $data['Duration'],
                        'cost' => $cost,
                        'status' => $data['Status']
                    ];
                }
            }
            fclose($handle);
        }
    }
    
    return [
        'calls' => array_slice($billingData, 0, 20),
        'total_cost' => $totalCost,
        'call_count' => count($billingData)
    ];
}

$uri = $_SERVER['REQUEST_URI'];

if (strpos($uri, '/api/customer/login') !== false && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $accountCode = $input['account_code'] ?? '';
    $password = $input['password'] ?? '';
    
    if (isset($customers[$accountCode]) && $customers[$accountCode]['password'] === $password) {
        echo json_encode([
            'token' => base64_encode($accountCode . ':' . time()),
            'customer' => [
                'account_code' => $accountCode,
                'name' => $customers[$accountCode]['name'],
                'rate_per_second' => $customers[$accountCode]['rate']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid credentials']);
    }
    exit;
}

if (strpos($uri, '/api/customer/dashboard') !== false && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    $decoded = base64_decode($token);
    $accountCode = explode(':', $decoded)[0] ?? '';
    
    if (isset($customers[$accountCode])) {
        $billing = getBillingData($accountCode);
        $activeCalls = getActiveCalls();
        
        echo json_encode([
            'customer' => [
                'account_code' => $accountCode,
                'name' => $customers[$accountCode]['name']
            ],
            'billing' => $billing,
            'active_calls' => $activeCalls
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Unauthorized']);
    }
    exit;
}

if (strpos($uri, '/api/customer/active-calls') !== false) {
    echo json_encode(['calls' => getActiveCalls()]);
    exit;
}

echo json_encode(['error' => 'Not found']);
?>