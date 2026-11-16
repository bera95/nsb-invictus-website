<?php
/**
 * Verifies the proof-of-work submitted with a form. Included by inquiry.php.
 * Returns true only for a valid, unexpired, correctly signed and not-yet-used challenge.
 */
declare(strict_types=1);

function nsb_pow_verify(array $config): bool
{
    $salt = isset($_POST['pow_salt']) ? (string) $_POST['pow_salt'] : '';
    $expires = (int) ($_POST['pow_expires'] ?? 0);
    $difficulty = (int) ($_POST['pow_difficulty'] ?? 0);
    $sig = isset($_POST['pow_sig']) ? (string) $_POST['pow_sig'] : '';
    $nonce = isset($_POST['pow_nonce']) ? (string) $_POST['pow_nonce'] : '';
    if (!preg_match('/^[a-f0-9]{32}$/', $salt) || !preg_match('/^[0-9]{1,12}$/', $nonce)) return false;
    if ($expires < time() || $expires > time() + 900) return false;

    $secret = (string) ($config['challenge_secret'] ?? hash('sha256', ($config['rate_limit_salt'] ?? 'nsb') . '|nsb-pow|' . __DIR__));
    $minDifficulty = (int) ($config['challenge_difficulty'] ?? 16);
    if ($difficulty < $minDifficulty) return false;
    if (!hash_equals(hash_hmac('sha256', $salt . '|' . $expires . '|' . $difficulty, $secret), $sig)) return false;

    // Leading zero bits of sha256(salt + nonce)
    $hash = hash('sha256', $salt . $nonce, true);
    $bits = 0;
    for ($i = 0; $i < strlen($hash) && $bits < $difficulty; $i++) {
        $byte = ord($hash[$i]);
        if ($byte === 0) { $bits += 8; continue; }
        for ($m = 0x80; $m > 0 && !($byte & $m); $m >>= 1) $bits++;
        break;
    }
    if ($bits < $difficulty) return false;

    // One-time use: remember used challenges until they expire.
    $file = rtrim($config['rate_limit_dir'] ?? sys_get_temp_dir(), '/') . '/nsb-pow-used.json';
    $used = is_file($file) ? (json_decode((string) @file_get_contents($file), true) ?: []) : [];
    $now = time();
    $used = array_filter($used, static function ($exp) use ($now) { return (int) $exp > $now; });
    if (isset($used[$salt])) return false;
    $used[$salt] = $expires;
    @file_put_contents($file, json_encode($used), LOCK_EX);
    return true;
}
