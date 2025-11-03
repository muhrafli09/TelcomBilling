<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (!$email) {
    echo json_encode(['exists' => false]);
    exit;
}

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=telecom_billing', 'telecom', 'telecom123');
    $stmt = $pdo->prepare('SELECT name FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    echo json_encode([
        'exists' => $user ? true : false,
        'name' => $user ? $user['name'] : null
    ]);
} catch (Exception $e) {
    echo json_encode(['exists' => false]);
}
?>