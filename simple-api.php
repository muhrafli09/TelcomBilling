<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple users database
$users = [
    'm.rafli.a09@gmail.com' => [
        'password' => 'password',
        'name' => 'M. Rafli Admin',
        'role' => 'admin',
        'account_codes' => []
    ],
    'm.rafli.a9@gmail.com' => [
        'password' => 'password123',
        'name' => 'M. Rafli',
        'role' => 'customer',
        'account_codes' => ['GLO-2510-001', 'GLO-2510-002']
    ],
    'user@example.com' => [
        'password' => 'pass123',
        'name' => 'Test User',
        'role' => 'customer',
        'account_codes' => ['GLO-2510-003']
    ]
];

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/api/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        exit;
    }
    
    $email = $input['email'];
    $password = $input['password'];
    
    if (isset($users[$email]) && $users[$email]['password'] === $password) {
        $token = base64_encode($email . ':' . time());
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => 1,
                'name' => $users[$email]['name'],
                'email' => $email,
                'role' => $users[$email]['role'],
                'account_codes' => $users[$email]['account_codes']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);