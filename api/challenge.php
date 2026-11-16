<?php
/**
 * Issues a signed proof-of-work challenge for the "I'm not a robot" check.
 * The browser must find a nonce so that sha256(salt + nonce) starts with N zero bits.
 * Stateless: the challenge is HMAC-signed and expires after 10 minutes.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header_remove('X-Powered-By');

$config = [];
$configFile = dirname(__DIR__, 2) . '/private/nsb-config.php';
if (is_file($configFile)) $config = require $configFile;
if (!is_array($config)) $config = [];

$secret = (string) ($config['challenge_secret'] ?? hash('sha256', ($config['rate_limit_salt'] ?? 'nsb') . '|nsb-pow|' . __DIR__));
$difficulty = (int) ($config['challenge_difficulty'] ?? 16);
$salt = bin2hex(random_bytes(16));
$expires = time() + 600;
$sig = hash_hmac('sha256', $salt . '|' . $expires . '|' . $difficulty, $secret);
echo json_encode(['salt' => $salt, 'expires' => $expires, 'difficulty' => $difficulty, 'sig' => $sig]);
