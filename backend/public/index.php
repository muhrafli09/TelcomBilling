<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Handle email check before Laravel routing
if ($_SERVER['REQUEST_METHOD'] === 'GET' && preg_match('/\/api\/check-email\/(.+)/', $_SERVER['REQUEST_URI'], $matches)) {
    require_once __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    
    $email = urldecode($matches[1]);
    
    try {
        $pdo = new PDO('mysql:host=127.0.0.1;dbname=telecom_billing', 'telecom', 'telecom123');
        $stmt = $pdo->prepare('SELECT name FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        echo json_encode([
            'exists' => $user ? true : false,
            'name' => $user ? $user['name'] : null
        ]);
        exit;
    } catch (Exception $e) {
        header('Content-Type: application/json');
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Database error']);
        exit;
    }
}

require_once __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);