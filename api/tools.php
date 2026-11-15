<?php
/**
 * NSB INVICTUS — free tools endpoint.
 *
 * POST JSON { "tool": "audit|ai-crawlers|headers|email|tracking", "url": "...", "domain": "..." }
 * Returns JSON. Runs on standard PHP hosting (curl + DOM + dns_get_record).
 *
 * Security:
 *  - Only http/https on ports 80/443; host must resolve to PUBLIC IPs only (SSRF protection).
 *  - The resolved IP is pinned for the request (no DNS rebinding); redirects are followed
 *    manually and re-validated (max 4).
 *  - Size (2.5 MB) and time (10 s) limits; rate limit per hashed IP.
 *  - Same-origin requests only.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header_remove('X-Powered-By');
header('X-Robots-Tag: noindex, nofollow');

const UA = 'Mozilla/5.0 (compatible; NSB-INVICTUS-SiteCheck/1.0; +https://nsbinvictus.tech/tools/)';
const MAX_BYTES = 2_500_000;

function out(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function fail(string $msg, int $status = 400): void { out(['ok' => false, 'error' => $msg], $status); }


/* ---------- Bot & abuse filter ---------- */
function nsb_is_bot(): bool
{
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua === '' || strlen($ua) < 20) return true;
    return (bool) preg_match('/(bot|crawl|spider|scrapy|python|curl|wget|httpclient|go-http|aiohttp|libwww|java\/|headless|phantom|selenium|puppeteer|playwright)/i', $ua);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Method not allowed.', 405);
// Requests must come from our own pages: JSON body + custom header (blocks cross-site forms and simple scripts).
if (($_SERVER['HTTP_X_NSB_CLIENT'] ?? '') !== 'web' || stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) fail('Invalid request.', 400);


$config = [];
$configFile = dirname(__DIR__, 2) . '/private/nsb-config.php';
if (is_file($configFile)) $config = require $configFile;
if (!is_array($config)) $config = [];
// Bot filter (the local-only 'allow_automation' flag lets automated browser tests run).
if (nsb_is_bot() && empty($config['allow_automation'])) fail('Automated requests are not allowed.', 403);

// Same-origin only
$host = preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($origin === '' || parse_url($origin, PHP_URL_HOST) !== ($config['allowed_host'] ?? $host)) fail('Invalid request origin.', 403);

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) fail('Invalid request.');
$tool = (string) ($input['tool'] ?? '');

/* ---------- Rate limit ---------- */
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim($config['rate_limit_dir'] ?? sys_get_temp_dir(), '/') . '/nsb-tools-' . hash('sha256', $ip . ($config['rate_limit_salt'] ?? 'nsb')) . '.json';
$now = time();
$hits = is_file($rateFile) ? (json_decode((string) @file_get_contents($rateFile), true) ?: []) : [];
$hits = array_values(array_filter($hits, static function ($t) use ($now) { return $now - (int) $t < 86400; }));
$lastHour = count(array_filter($hits, static function ($t) use ($now) { return $now - (int) $t < 3600; }));
if ($lastHour >= (int) ($config['tools_per_hour'] ?? 30)) fail('Hourly limit reached. Please try again later — or contact us for a full analysis.', 429);
if (count($hits) >= (int) ($config['tools_per_day'] ?? 80)) fail('Daily limit reached. Contact us for a full analysis with our professional tools.', 429);
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

/* ---------- Helpers ---------- */
function normalize_url(string $raw): string
{
    $raw = trim($raw);
    if ($raw === '' || strlen($raw) > 2048) throw new RuntimeException('Please enter a website address.');
    if (!preg_match('#^https?://#i', $raw)) $raw = 'https://' . $raw;
    $p = parse_url($raw);
    if (!$p || empty($p['host'])) throw new RuntimeException('That does not look like a valid website address.');
    $scheme = strtolower($p['scheme'] ?? 'https');
    if (!in_array($scheme, ['http', 'https'], true)) throw new RuntimeException('Only http and https addresses are supported.');
    if (isset($p['port']) && !in_array((int) $p['port'], [80, 443], true) && empty($GLOBALS['allowPrivate'])) throw new RuntimeException('Only standard web ports are supported.');
    if (isset($p['user']) || isset($p['pass'])) throw new RuntimeException('Addresses with credentials are not supported.');
    $hostName = strtolower($p['host']);
    if (!preg_match('/^[a-z0-9.-]+$/', $hostName) || (strpos($hostName, '.') === false && empty($GLOBALS['allowPrivate']))) throw new RuntimeException('Please enter a public domain name.');
    return $scheme . '://' . $hostName . (isset($p['port']) ? ':' . $p['port'] : '') . ($p['path'] ?? '/') . (isset($p['query']) ? '?' . $p['query'] : '');
}

function public_ips(string $hostName, bool $allowPrivate): array
{
    $ips = @gethostbynamel($hostName) ?: [];
    if (!$ips) throw new RuntimeException('The domain could not be resolved. Check the spelling.');
    foreach ($ips as $ipAddr) {
        $public = filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
        if (!$public && !$allowPrivate) throw new RuntimeException('This address is not publicly reachable.');
    }
    return $ips;
}

/** Fetch a URL safely. Returns status, headers, body, final URL, timing and redirect chain. */
function safe_fetch(string $url, bool $allowPrivate, int $maxRedirects = 4, bool $bodyNeeded = true): array
{
    $chain = [];
    $start = microtime(true);
    for ($i = 0; $i <= $maxRedirects; $i++) {
        $p = parse_url($url);
        $hostName = strtolower($p['host'] ?? '');
        $scheme = strtolower($p['scheme'] ?? 'https');
        if (!in_array($scheme, ['http', 'https'], true)) throw new RuntimeException('Redirected to an unsupported address.');
        $port = (int) ($p['port'] ?? ($scheme === 'https' ? 443 : 80));
        if (!in_array($port, [80, 443], true) && !$allowPrivate) throw new RuntimeException('Redirected to a non-standard port.');
        $ips = public_ips($hostName, $allowPrivate);

        $headers = [];
        $body = '';
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RESOLVE => [$hostName . ':' . $port . ':' . $ips[0]],
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_NOBODY => !$bodyNeeded,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => UA,
            CURLOPT_ENCODING => '',
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5', 'Accept-Language: en'],
            CURLOPT_HEADERFUNCTION => static function ($c, $line) use (&$headers) {
                $len = strlen($line);
                $parts = explode(':', $line, 2);
                if (count($parts) === 2) {
                    $k = strtolower(trim($parts[0]));
                    $headers[$k] = isset($headers[$k]) ? $headers[$k] . ', ' . trim($parts[1]) : trim($parts[1]);
                }
                return $len;
            },
            CURLOPT_WRITEFUNCTION => static function ($c, $chunk) use (&$body) {
                $body .= $chunk;
                return strlen($body) > MAX_BYTES ? 0 : strlen($chunk);
            },
        ]);
        curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_errno($ch);
        $ttfb = (float) curl_getinfo($ch, CURLINFO_STARTTRANSFER_TIME);
        curl_close($ch);
        if ($err && $err !== CURLE_WRITE_ERROR) {
            throw new RuntimeException('The website did not respond (timeout or connection error).', 502);
        }
        $chain[] = ['url' => $url, 'status' => $status];
        if ($status >= 300 && $status < 400 && !empty($headers['location'])) {
            $loc = $headers['location'];
            if (!preg_match('#^https?://#i', $loc)) {
                $base = $scheme . '://' . $hostName . ($port !== 80 && $port !== 443 ? ':' . $port : '');
                $loc = $loc[0] === '/' ? $base . $loc : $base . rtrim(dirname($p['path'] ?? '/'), '/') . '/' . $loc;
            }
            $url = $loc;
            continue;
        }
        return [
            'status' => $status, 'headers' => $headers, 'body' => $body, 'url' => $url,
            'time' => round((microtime(true) - $start) * 1000), 'ttfb' => round($ttfb * 1000),
            'bytes' => strlen($body), 'chain' => $chain, 'truncated' => strlen($body) > MAX_BYTES,
        ];
    }
    throw new RuntimeException('Too many redirects.');
}

function check(string $id, string $cat, string $label, string $status, string $detail): array
{
    return ['id' => $id, 'category' => $cat, 'label' => $label, 'status' => $status, 'detail' => $detail];
}

/** Free tier: keep full detail for the first $free findings; the rest only reveal that they exist. */
function lock_after(array $checks, int $free): array
{
    $order = ['fail' => 0, 'warn' => 1, 'info' => 2, 'pass' => 3];
    usort($checks, static function ($a, $b) use ($order) { return $order[$a['status']] <=> $order[$b['status']]; });
    $outList = [];
    foreach ($checks as $i => $c) {
        $outList[] = $i < $free ? $c : ['id' => 'locked-' . $i, 'category' => $c['category'], 'label' => 'Locked finding', 'status' => 'locked', 'detail' => '', 'locked' => true];
    }
    return $outList;
}

function score(array $checks): int
{
    $w = ['pass' => 1, 'warn' => 0.5, 'fail' => 0];
    $scored = array_filter($checks, static function ($c) { return $c['status'] !== 'info'; });
    if (!$scored) return 0;
    $sum = 0;
    foreach ($scored as $c) $sum += $w[$c['status']];
    return (int) round($sum / count($scored) * 100);
}

/* ---------- AI crawler / robots.txt analysis ---------- */
const AI_BOTS = [
    'GPTBot' => 'OpenAI (training)', 'OAI-SearchBot' => 'ChatGPT search', 'ChatGPT-User' => 'ChatGPT browsing',
    'ClaudeBot' => 'Anthropic (training)', 'Claude-SearchBot' => 'Claude search', 'Claude-User' => 'Claude browsing',
    'PerplexityBot' => 'Perplexity search', 'Google-Extended' => 'Google Gemini (training)', 'Googlebot' => 'Google Search',
    'Bingbot' => 'Bing & Copilot', 'Applebot-Extended' => 'Apple Intelligence', 'CCBot' => 'Common Crawl',
    'Meta-ExternalAgent' => 'Meta AI', 'Amazonbot' => 'Amazon', 'Bytespider' => 'ByteDance',
];

function parse_robots(string $txt): array
{
    $groups = [];
    $current = null;
    $lastWasAgent = false;
    foreach (preg_split('/\r?\n/', $txt) as $line) {
        $line = trim(preg_replace('/#.*/', '', $line));
        if ($line === '' || strpos($line, ':') === false) continue;
        [$k, $v] = array_map('trim', explode(':', $line, 2));
        $k = strtolower($k);
        if ($k === 'user-agent') {
            if (!$lastWasAgent || $current === null) { $groups[] = ['agents' => [], 'rules' => []]; $current = count($groups) - 1; }
            $groups[$current]['agents'][] = strtolower($v);
            $lastWasAgent = true;
        } elseif (($k === 'allow' || $k === 'disallow') && $current !== null) {
            $groups[$current]['rules'][] = [$k, $v];
            $lastWasAgent = false;
        } else {
            $lastWasAgent = false;
        }
    }
    return $groups;
}

function bot_access(array $groups, string $bot): string
{
    $b = strtolower($bot);
    $match = null;
    foreach ($groups as $g) if (in_array($b, $g['agents'], true)) { $match = $g; break; }
    if ($match === null) foreach ($groups as $g) if (in_array('*', $g['agents'], true)) { $match = $g; break; }
    if ($match === null) return 'allowed';
    $rootBlocked = false; $partial = false; $rootAllowed = false;
    foreach ($match['rules'] as [$type, $path]) {
        if ($type === 'disallow' && $path === '/') $rootBlocked = true;
        elseif ($type === 'disallow' && $path !== '') $partial = true;
        elseif ($type === 'allow' && ($path === '/' || $path === '')) $rootAllowed = true;
    }
    if ($rootBlocked && !$rootAllowed) return 'blocked';
    return $partial ? 'partial' : 'allowed';
}

function robots_report(string $origin, bool $allowPrivate): array
{
    $r = safe_fetch($origin . '/robots.txt', $allowPrivate);
    $exists = $r['status'] === 200 && stripos($r['headers']['content-type'] ?? 'text/plain', 'html') === false;
    $txt = $exists ? substr($r['body'], 0, 500000) : '';
    $groups = parse_robots($txt);
    $bots = [];
    foreach (AI_BOTS as $name => $owner) $bots[] = ['bot' => $name, 'owner' => $owner, 'access' => $exists ? bot_access($groups, $name) : 'allowed'];
    preg_match_all('/^\s*sitemap:\s*(\S+)/im', $txt, $m);
    return ['exists' => $exists, 'status' => $r['status'], 'bots' => $bots, 'sitemaps' => array_slice($m[1] ?? [], 0, 10)];
}

/* ---------- Security headers ---------- */
function security_checks(array $h, string $finalUrl): array
{
    $c = [];
    $https = stripos($finalUrl, 'https://') === 0;
    $c[] = check('https', 'security', 'HTTPS', $https ? 'pass' : 'fail', $https ? 'The page is served over an encrypted connection.' : 'The page is not served over HTTPS.');
    $hsts = $h['strict-transport-security'] ?? '';
    $c[] = check('hsts', 'security', 'Strict-Transport-Security (HSTS)', $hsts ? 'pass' : 'fail', $hsts ? $hsts : 'Missing. Browsers may connect over insecure HTTP first.');
    $csp = $h['content-security-policy'] ?? '';
    $c[] = check('csp', 'security', 'Content-Security-Policy', $csp ? 'pass' : 'warn', $csp ? 'Present.' : 'Missing. A CSP limits the damage of injected scripts (XSS).');
    $xfo = $h['x-frame-options'] ?? '';
    $fa = stripos($csp, 'frame-ancestors') !== false;
    $c[] = check('clickjacking', 'security', 'Clickjacking protection', ($xfo || $fa) ? 'pass' : 'warn', ($xfo || $fa) ? 'X-Frame-Options or frame-ancestors is set.' : 'Missing X-Frame-Options / frame-ancestors.');
    $xcto = strtolower($h['x-content-type-options'] ?? '');
    $c[] = check('xcto', 'security', 'X-Content-Type-Options', $xcto === 'nosniff' ? 'pass' : 'warn', $xcto === 'nosniff' ? 'nosniff' : 'Missing. Set to "nosniff".');
    $rp = $h['referrer-policy'] ?? '';
    $c[] = check('referrer', 'security', 'Referrer-Policy', $rp ? 'pass' : 'warn', $rp ?: 'Missing. Controls how much URL information is shared with other sites.');
    $pp = $h['permissions-policy'] ?? '';
    $c[] = check('permissions', 'security', 'Permissions-Policy', $pp ? 'pass' : 'warn', $pp ? 'Present.' : 'Missing. Restricts access to camera, microphone, geolocation and more.');
    $server = ($h['server'] ?? '') . ' ' . ($h['x-powered-by'] ?? '');
    $leak = preg_match('/\d+\.\d+/', $server) === 1;
    $c[] = check('leak', 'security', 'Server version disclosure', $leak ? 'warn' : 'pass', $leak ? 'Software versions are exposed: ' . trim($server) : 'No software versions exposed in headers.');
    return $c;
}

/* ---------- Tracking detection ---------- */
function tracking_detect(string $html): array
{
    $found = [];
    if (preg_match_all('/GTM-[A-Z0-9]{4,10}/', $html, $m)) $found[] = ['name' => 'Google Tag Manager', 'ids' => array_values(array_unique($m[0]))];
    if (preg_match_all('/\bG-[A-Z0-9]{6,12}\b/', $html, $m)) $found[] = ['name' => 'Google Analytics 4', 'ids' => array_values(array_unique($m[0]))];
    if (preg_match_all('/\bUA-\d{4,10}-\d{1,4}\b/', $html, $m)) $found[] = ['name' => 'Universal Analytics (discontinued)', 'ids' => array_values(array_unique($m[0]))];
    if (preg_match_all('/\bAW-\d{6,12}\b/', $html, $m)) $found[] = ['name' => 'Google Ads', 'ids' => array_values(array_unique($m[0]))];
    $sigs = [
        'Meta Pixel' => '/fbq\(|connect\.facebook\.net\/[^"\']*fbevents/i', 'LinkedIn Insight' => '/snap\.licdn\.com|_linkedin_partner_id/i',
        'TikTok Pixel' => '/analytics\.tiktok\.com/i', 'Microsoft Clarity' => '/clarity\.ms/i', 'Hotjar' => '/static\.hotjar\.com|hjid/i',
        'Matomo' => '/matomo|piwik/i', 'Plausible' => '/plausible\.io\/js/i',
    ];
    foreach ($sigs as $name => $re) if (preg_match($re, $html)) $found[] = ['name' => $name, 'ids' => []];
    $cmps = [
        'Cookiebot' => '/consent\.cookiebot\.com/i', 'OneTrust' => '/cdn\.cookielaw\.org|onetrust/i', 'CookieYes' => '/cookieyes/i',
        'Complianz' => '/complianz/i', 'iubenda' => '/iubenda/i', 'Usercentrics' => '/usercentrics/i', 'Termly' => '/termly\.io/i',
        'Osano' => '/osano\.com/i', 'Didomi' => '/didomi/i', 'Custom consent banner' => '/cookie[-_ ]?(consent|banner|notice)/i',
    ];
    $consent = [];
    foreach ($cmps as $name => $re) if (preg_match($re, $html)) $consent[] = $name;
    $consentMode = (bool) preg_match('/gtag\(\s*[\'"]consent[\'"]\s*,\s*[\'"]default[\'"]/i', $html);
    return ['tags' => $found, 'consent' => $consent, 'consentMode' => $consentMode];
}

/* ---------- Tools ---------- */
$allowPrivate = !empty($config['tools_allow_private']); // local development only
$GLOBALS['allowPrivate'] = $allowPrivate;

try {
switch ($tool) {
    case 'audit': {
        $url = normalize_url((string) ($input['url'] ?? ''));
        $r = safe_fetch($url, $allowPrivate);
        $h = $r['headers'];
        $html = $r['body'];
        $origin = preg_replace('#^(https?://[^/]+).*$#i', '$1', $r['url']);
        $origin = (string) $origin;
        $checks = [];

        // Technical
        $checks[] = check('status', 'technical', 'Page responds successfully', $r['status'] === 200 ? 'pass' : 'fail', 'HTTP status ' . $r['status'] . (count($r['chain']) > 1 ? ' after ' . (count($r['chain']) - 1) . ' redirect(s)' : '') . '.');
        $checks[] = check('speed', 'technical', 'Server response time', $r['ttfb'] < 600 ? 'pass' : ($r['ttfb'] < 1500 ? 'warn' : 'fail'), 'Time to first byte: ' . $r['ttfb'] . ' ms.');
        $kb = round($r['bytes'] / 1024);
        $checks[] = check('size', 'technical', 'HTML size', $kb < 300 ? 'pass' : ($kb < 1000 ? 'warn' : 'fail'), 'HTML document: ' . $kb . ' KB.');
        $enc = $h['content-encoding'] ?? '';
        $checks[] = check('compression', 'technical', 'Compression', $enc ? 'pass' : 'warn', $enc ? 'Enabled (' . $enc . ').' : 'No gzip/brotli compression detected.');

        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="utf-8"?>' . $html, LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR);
        $xp = new DOMXPath($dom);
        $meta = static function (string $q) use ($xp): string { $n = $xp->query($q); return $n && $n->length ? trim((string) $n->item(0)->getAttribute('content')) : ''; };

        // On-page SEO
        $titleNode = $xp->query('//title');
        $title = $titleNode && $titleNode->length ? trim($titleNode->item(0)->textContent) : '';
        $tl = mb_strlen($title);
        $checks[] = check('title', 'seo', 'Title tag', !$title ? 'fail' : (($tl >= 30 && $tl <= 65) ? 'pass' : 'warn'), $title ? "\"$title\" ($tl characters; aim for 30–65)." : 'Missing title tag.');
        $desc = $meta('//meta[@name="description"]');
        $dl = mb_strlen($desc);
        $checks[] = check('description', 'seo', 'Meta description', !$desc ? 'fail' : (($dl >= 70 && $dl <= 160) ? 'pass' : 'warn'), $desc ? "$dl characters (aim for 70–160)." : 'Missing meta description.');
        $h1 = $xp->query('//h1');
        $h1c = $h1 ? $h1->length : 0;
        $checks[] = check('h1', 'seo', 'H1 heading', $h1c === 1 ? 'pass' : ($h1c === 0 ? 'fail' : 'warn'), $h1c === 1 ? '"' . mb_substr(trim($h1->item(0)->textContent), 0, 90) . '"' : "$h1c H1 headings found (use exactly one).");
        $h2c = $xp->query('//h2')->length;
        $checks[] = check('h2', 'seo', 'Subheadings (H2)', $h2c > 0 ? 'pass' : 'warn', "$h2c H2 headings found.");
        $canon = $xp->query('//link[@rel="canonical"]');
        $checks[] = check('canonical', 'seo', 'Canonical URL', $canon && $canon->length ? 'pass' : 'warn', $canon && $canon->length ? $canon->item(0)->getAttribute('href') : 'No canonical link — duplicate URLs may compete.');
        $robotsMeta = strtolower($meta('//meta[@name="robots"]'));
        $noindex = strpos($robotsMeta, 'noindex') !== false || stripos($h['x-robots-tag'] ?? '', 'noindex') !== false;
        $checks[] = check('indexable', 'seo', 'Indexable by search engines', $noindex ? 'fail' : 'pass', $noindex ? 'The page is set to noindex.' : 'No noindex directive found.');
        $lang = $dom->documentElement ? $dom->documentElement->getAttribute('lang') : '';
        $htmlEl = $xp->query('//html');
        if (!$lang && $htmlEl && $htmlEl->length) $lang = $htmlEl->item(0)->getAttribute('lang');
        $checks[] = check('lang', 'seo', 'Language declared', $lang ? 'pass' : 'warn', $lang ? "lang=\"$lang\"" : 'Missing lang attribute on <html>.');
        $checks[] = check('viewport', 'seo', 'Mobile viewport', $meta('//meta[@name="viewport"]') ? 'pass' : 'fail', $meta('//meta[@name="viewport"]') ? 'Viewport meta tag present.' : 'Missing viewport meta tag — poor mobile rendering.');
        $imgs = $xp->query('//img');
        $noAlt = 0;
        foreach ($imgs as $img) if (!$img->hasAttribute('alt')) $noAlt++;
        $checks[] = check('alt', 'seo', 'Image alt text', $noAlt === 0 ? 'pass' : ($noAlt <= 3 ? 'warn' : 'fail'), $imgs->length . " images, $noAlt without alt text.");
        $bodyNode = $xp->query('//body');
        $text = $bodyNode && $bodyNode->length ? preg_replace('/\s+/', ' ', $bodyNode->item(0)->textContent) : '';
        $words = str_word_count((string) $text);
        $checks[] = check('content', 'seo', 'Content depth', $words >= 300 ? 'pass' : ($words >= 120 ? 'warn' : 'fail'), "About $words words of text.");
        $og = $meta('//meta[@property="og:title"]') && $meta('//meta[@property="og:image"]');
        $checks[] = check('og', 'seo', 'Social sharing (Open Graph)', $og ? 'pass' : 'warn', $og ? 'og:title and og:image present.' : 'Missing og:title or og:image — links share poorly.');

        // AEO / GEO readiness
        $types = [];
        foreach ($xp->query('//script[@type="application/ld+json"]') as $s) {
            $j = json_decode($s->textContent, true);
            $stack = is_array($j) ? [$j] : [];
            while ($stack) {
                $n = array_pop($stack);
                if (isset($n['@type'])) foreach ((array) $n['@type'] as $t) $types[] = (string) $t;
                foreach (['@graph', 'mainEntity', 'itemListElement'] as $k) if (!empty($n[$k]) && is_array($n[$k])) foreach ($n[$k] as $x) if (is_array($x)) $stack[] = $x;
                if (array_is_list_compat($n)) foreach ($n as $x) if (is_array($x)) $stack[] = $x;
            }
        }
        $types = array_values(array_unique($types));
        $checks[] = check('schema', 'aeo', 'Structured data (schema.org)', $types ? 'pass' : 'fail', $types ? 'Found: ' . implode(', ', array_slice($types, 0, 8)) : 'No JSON-LD structured data — harder for search and AI engines to understand the page.');
        $hasOrg = (bool) array_intersect($types, ['Organization', 'LocalBusiness', 'ProfessionalService', 'Corporation']);
        $checks[] = check('entity', 'aeo', 'Brand entity markup', $hasOrg ? 'pass' : 'warn', $hasOrg ? 'Organization / business entity is described.' : 'No Organization or LocalBusiness schema — AI assistants may misrepresent your brand.');
        $faq = in_array('FAQPage', $types, true);
        $questions = 0;
        foreach ($xp->query('//h2|//h3') as $hn) if (preg_match('/\?\s*$/', trim($hn->textContent))) $questions++;
        $checks[] = check('answers', 'aeo', 'Answer-ready content (FAQ / questions)', ($faq || $questions >= 2) ? 'pass' : 'warn', $faq ? 'FAQPage schema found.' : "$questions question-style headings found. Answer-format content wins snippets and AI citations.");
        try { $rb = robots_report($origin, $allowPrivate); } catch (Throwable $e) { $rb = ['exists' => false, 'bots' => [], 'sitemaps' => []]; }
        $blockedAi = array_values(array_filter($rb['bots'], static function ($b) { return $b['access'] === 'blocked' && $b['bot'] !== 'Googlebot' && $b['bot'] !== 'Bingbot'; }));
        $searchBlocked = array_values(array_filter($rb['bots'], static function ($b) { return in_array($b['bot'], ['Googlebot', 'Bingbot'], true) && $b['access'] === 'blocked'; }));
        $checks[] = check('robots', 'technical', 'robots.txt', $rb['exists'] ? ($searchBlocked ? 'fail' : 'pass') : 'warn', $rb['exists'] ? ($searchBlocked ? 'Search engines are blocked in robots.txt!' : 'Found and allows search engines.') : 'No robots.txt file found.');
        $checks[] = check('sitemap', 'technical', 'XML sitemap declared', $rb['sitemaps'] ? 'pass' : 'warn', $rb['sitemaps'] ? implode(', ', $rb['sitemaps']) : 'No sitemap referenced in robots.txt.');
        $checks[] = check('ai-crawlers', 'aeo', 'AI assistant crawler access (GEO)', $blockedAi ? 'warn' : 'pass', $blockedAi ? count($blockedAi) . ' AI crawlers blocked: ' . implode(', ', array_column($blockedAi, 'bot')) : 'AI crawlers can access the site.');
        try { $llms = safe_fetch($origin . '/llms.txt', $allowPrivate, 2); $hasLlms = $llms['status'] === 200 && stripos($llms['headers']['content-type'] ?? '', 'html') === false; } catch (Throwable $e) { $hasLlms = false; }
        $checks[] = check('llms', 'aeo', 'llms.txt for AI models', $hasLlms ? 'pass' : 'info', $hasLlms ? 'llms.txt found.' : 'No llms.txt — an emerging standard that guides AI models to your key pages.');

        // Security & tracking
        foreach (security_checks($h, $r['url']) as $sc) if (in_array($sc['id'], ['https', 'hsts', 'csp', 'xcto'], true)) $checks[] = $sc;
        $tr = tracking_detect($html);
        $hasAnalytics = (bool) array_filter($tr['tags'], static function ($t) { return in_array($t['name'], ['Google Tag Manager', 'Google Analytics 4'], true); });
        $checks[] = check('analytics', 'tracking', 'Analytics installed', $hasAnalytics ? 'pass' : 'info', $hasAnalytics ? implode(', ', array_column($tr['tags'], 'name')) : 'No GA4 or GTM detected in the page source (they may load after consent).');
        $checks[] = check('consent', 'tracking', 'Cookie consent', ($tr['consent'] || $tr['consentMode']) ? 'pass' : 'warn', ($tr['consent'] || $tr['consentMode']) ? 'Consent mechanism detected' . ($tr['consentMode'] ? ' (Google Consent Mode).' : '.') : 'No consent banner or Consent Mode detected in the page source.');

        $cats = [];
        foreach (['seo' => 'On-page SEO', 'aeo' => 'AEO & GEO readiness', 'technical' => 'Technical', 'security' => 'Security', 'tracking' => 'Tracking & consent'] as $k => $label) {
            $sub = array_values(array_filter($checks, static function ($c) use ($k) { return $c['category'] === $k; }));
            $cats[] = ['id' => $k, 'label' => $label, 'score' => score($sub), 'count' => count($sub)];
        }

        // Free version: only the 3 most important findings in full; everything else is locked.
        $public = lock_after($checks, 3);
        $issues = count(array_filter($checks, static function ($c) { return $c['status'] === 'fail' || $c['status'] === 'warn'; }));
        out(['ok' => true, 'url' => $r['url'], 'score' => score($checks), 'issues' => $issues, 'total' => count($checks), 'categories' => $cats, 'checks' => $public, 'fetchedMs' => $r['time']]);
    }

    case 'ai-crawlers': {
        $url = normalize_url((string) ($input['url'] ?? ''));
        $origin = preg_replace('#^(https?://[^/]+).*$#i', '$1', $url);
        $rb = robots_report($origin, $allowPrivate);
        $total = count($rb['bots']);
        $blocked = count(array_filter($rb['bots'], static function ($b) { return $b['access'] === 'blocked'; }));
        $rb['bots'] = array_slice($rb['bots'], 0, 6); // free: the six most important crawlers
        out(['ok' => true, 'url' => $origin, 'robots' => $rb, 'totalBots' => $total, 'blockedTotal' => $blocked]);
    }

    case 'headers': {
        $url = normalize_url((string) ($input['url'] ?? ''));
        $r = safe_fetch($url, $allowPrivate, 4, false);
        $checks = security_checks($r['headers'], $r['url']);
        $s = score($checks);
        $grade = $s >= 90 ? 'A' : ($s >= 75 ? 'B' : ($s >= 60 ? 'C' : ($s >= 40 ? 'D' : 'F')));
        out(['ok' => true, 'url' => $r['url'], 'score' => $s, 'grade' => $grade, 'checks' => lock_after($checks, 4)]);
    }

    case 'tracking': {
        $url = normalize_url((string) ($input['url'] ?? ''));
        $r = safe_fetch($url, $allowPrivate);
        out(['ok' => true, 'url' => $r['url'], 'tracking' => tracking_detect($r['body'])]);
    }

    case 'email': {
        $d = strtolower(trim((string) ($input['domain'] ?? '')));
        $d = preg_replace('#^https?://#', '', $d);
        $d = preg_replace('#[/:].*$#', '', $d);
        $d = preg_replace('/^www\./', '', $d);
        if (!preg_match('/^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/', $d)) fail('Please enter a valid domain, e.g. example.com');
        $checks = [];
        $mx = @dns_get_record($d, DNS_MX) ?: [];
        $checks[] = check('mx', 'email', 'Mail servers (MX)', $mx ? 'pass' : 'fail', $mx ? implode(', ', array_slice(array_map(static function ($r) { return $r['target']; }, $mx), 0, 4)) : 'No MX records — this domain cannot receive email.');
        $txt = @dns_get_record($d, DNS_TXT) ?: [];
        $spf = '';
        foreach ($txt as $t) { $v = $t['txt'] ?? implode('', $t['entries'] ?? []); if (stripos($v, 'v=spf1') === 0) $spf = $v; }
        $spfStatus = !$spf ? 'fail' : (preg_match('/[-~]all\b/', $spf) ? 'pass' : 'warn');
        $checks[] = check('spf', 'email', 'SPF record', $spfStatus, $spf ?: 'No SPF record — others can more easily spoof your domain.');
        $dm = @dns_get_record('_dmarc.' . $d, DNS_TXT) ?: [];
        $dmarc = '';
        foreach ($dm as $t) { $v = $t['txt'] ?? implode('', $t['entries'] ?? []); if (stripos($v, 'v=DMARC1') === 0) $dmarc = $v; }
        $policy = preg_match('/\bp=(\w+)/i', $dmarc, $pm) ? strtolower($pm[1]) : '';
        $checks[] = check('dmarc', 'email', 'DMARC policy', !$dmarc ? 'fail' : ($policy === 'none' ? 'warn' : 'pass'), $dmarc ? "Policy: p=$policy — $dmarc" : 'No DMARC record — Gmail and Yahoo require DMARC for bulk senders.');
        $bimi = @dns_get_record('default._bimi.' . $d, DNS_TXT) ?: [];
        $checks[] = check('bimi', 'email', 'BIMI (brand logo in inbox)', $bimi ? 'pass' : 'info', $bimi ? 'BIMI record found.' : 'No BIMI record (optional).');
        out(['ok' => true, 'domain' => $d, 'score' => score($checks), 'checks' => $checks]);
    }

    default:
        fail('Unknown tool.');
}
} catch (RuntimeException $e) {
    fail($e->getMessage(), $e->getCode() >= 400 ? $e->getCode() : 400);
} catch (Throwable $e) {
    error_log('[tools] ' . $e->getMessage());
    fail('The check could not be completed. Please try again.', 500);
}

/** array_is_list for PHP < 8.1 */
function array_is_list_compat(array $a): bool
{
    $i = 0;
    foreach ($a as $k => $_) { if ($k !== $i++) return false; }
    return true;
}
