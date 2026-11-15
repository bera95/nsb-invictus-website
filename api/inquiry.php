<?php
/**
 * NSB INVICTUS — project inquiry endpoint.
 *
 * Runs on standard PHP hosting (Hostinger Premium). Receives the contact form,
 * validates it, applies spam protection and sends an email notification.
 *
 * Configuration (secrets) is loaded ONLY from outside the web root:
 *   <public_html>/../private/nsb-config.php
 * On Hostinger: ~/domains/nsbinvictus.tech/private/nsb-config.php
 * See config.example.php for the template.
 *
 * Compatible with PHP 7.4+ (Hostinger runs PHP 8.x).
 */
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos((string) $_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond(bool $ok, string $error = '', int $status = 200): void
{
    global $wantsJson;
    http_response_code($status);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    } else {
        header('Location: /contact/?' . ($ok ? 'sent=1' : 'error=1'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Method not allowed.', 405);
}

/* ---------- Configuration ---------- */
$config = [];
$configFile = dirname(__DIR__, 2) . '/private/nsb-config.php';
if (is_file($configFile)) {
    $config = require $configFile;
}
if (!is_array($config) || empty($config['mail_to'])) {
    error_log('[inquiry] Missing configuration.');
    respond(false, 'The inquiry service is not configured yet. Please email us directly.', 503);
}

/* ---------- Origin check (basic CSRF mitigation) ---------- */
$allowedHost = $config['allowed_host'] ?? preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== $allowedHost) {
    respond(false, 'Invalid request origin.', 403);
}

/* ---------- Helpers ---------- */
function field(string $key, int $max): string
{
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    $v = str_replace("\0", '', $v);
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}
function oneLine(string $v): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
}

/* ---------- Spam protection ---------- */
// 1. Honeypot: silently accept so bots learn nothing.
if (field('website', 200) !== '') {
    respond(true);
}
// 2. Timing: forms submitted in under 3 seconds are almost certainly automated.
$started = (int) field('started', 20);
if ($started > 0 && (microtime(true) * 1000 - $started) < 3000) {
    respond(true);
}
// 3. Rate limit per IP (hashed; no raw IPs stored).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateDir = rtrim($config['rate_limit_dir'] ?? sys_get_temp_dir(), '/');
$rateFile = $rateDir . '/nsb-inquiry-' . hash('sha256', $ip . ($config['rate_limit_salt'] ?? 'nsb')) . '.json';
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $hits = json_decode((string) @file_get_contents($rateFile), true) ?: [];
    $hits = array_values(array_filter($hits, static function ($t) use ($now) { return $now - (int) $t < 3600; }));
}
if (count($hits) >= (int) ($config['rate_limit_per_hour'] ?? 5)) {
    respond(false, 'Too many inquiries from this connection. Please try again later or email us directly.', 429);
}
// 4. Cloudflare Turnstile (optional).
if (!empty($config['turnstile_secret'])) {
    $token = field('cf-turnstile-response', 4096);
    $payload = http_build_query(['secret' => $config['turnstile_secret'], 'response' => $token, 'remoteip' => $ip]);
    $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => $payload, 'timeout' => 8]]);
    $result = json_decode((string) @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $ctx), true);
    if (empty($result['success'])) {
        respond(false, 'Spam verification failed. Please try again.', 400);
    }
}

/* ---------- Validation ---------- */
$name = oneLine(field('name', 120));
$email = oneLine(field('email', 160));
$company = oneLine(field('company', 160));
$topic = oneLine(field('topic', 60));
$budget = oneLine(field('budget', 60));
$timeline = oneLine(field('timeline', 60));
$product = oneLine(field('product', 80));
$message = field('message', 5000);
$consent = field('consent', 5) === 'yes';

$errors = [];
if ($name === '') $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (strlen($message) < 20) $errors[] = 'message';
if (!$consent) $errors[] = 'consent';
if (!preg_match('/^[a-z0-9-]{0,60}$/', $topic)) $topic = 'other';
if ($errors) {
    respond(false, 'Please complete the required fields: ' . implode(', ', $errors) . '.', 422);
}

/* ---------- Compose ---------- */
$subject = sprintf('[%s] New inquiry — %s%s', $config['site_name'] ?? 'NSB INVICTUS', $name, $company !== '' ? " ($company)" : '');
$lines = [
    "New inquiry from the website",
    str_repeat('-', 40),
    "Name:      $name",
    "Email:     $email",
    "Company:   " . ($company ?: '—'),
    "Topic:     $topic" . ($product !== '' ? " / product: $product" : ''),
    "Budget:    " . ($budget ?: '—'),
    "Timeline:  " . ($timeline ?: '—'),
    str_repeat('-', 40),
    $message,
    str_repeat('-', 40),
    'Submitted: ' . gmdate('Y-m-d H:i') . ' UTC',
    'Consent to processing: yes',
];
$body = implode("\n", $lines);

/* ---------- Send ---------- */
$sent = false;
if (!empty($config['log_only'])) {
    // Local development: write the message to a file instead of sending email.
    $sent = (bool) @file_put_contents(rtrim(sys_get_temp_dir(), '/') . '/nsb-inquiries.log', $subject . "\n" . $body . "\n\n", FILE_APPEND | LOCK_EX);
    if ($sent) { $hits[] = $now; @file_put_contents($rateFile, json_encode($hits), LOCK_EX); respond(true); }
}
$autoload = __DIR__ . '/vendor/autoload.php';
if (!empty($config['smtp_host']) && is_file($autoload)) {
    require $autoload;
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->Port = (int) ($config['smtp_port'] ?? 587);
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_user'];
        $mail->Password = $config['smtp_pass'];
        $mail->SMTPSecure = ((int) $mail->Port === 465) ? 'ssl' : 'tls';
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($config['mail_from'], $config['mail_from_name'] ?? 'NSB INVICTUS Website');
        foreach ((array) $config['mail_to'] as $to) {
            $mail->addAddress($to);
        }
        $mail->addReplyTo($email, $name);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $sent = $mail->send();
    } catch (Throwable $e) {
        error_log('[inquiry] SMTP error: ' . $e->getMessage());
    }
} elseif (empty($config['smtp_host'])) {
    // Fallback: PHP mail() — subject to host limits; SMTP is strongly recommended.
    $headers = [
        'From: ' . ($config['mail_from_name'] ?? 'NSB INVICTUS Website') . ' <' . $config['mail_from'] . '>',
        'Reply-To: ' . $name . ' <' . $email . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: NSB-Inquiry',
    ];
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $sent = @mail(implode(',', (array) $config['mail_to']), $encodedSubject, $body, implode("\r\n", $headers));
} else {
    error_log('[inquiry] SMTP configured but PHPMailer is not installed (api/vendor).');
}

if (!$sent) {
    respond(false, 'Your inquiry could not be sent right now. Please email us directly.', 502);
}

$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);
respond(true);
