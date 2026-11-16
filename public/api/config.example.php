<?php
/**
 * Inquiry endpoint configuration — TEMPLATE.
 *
 * Copy to the server OUTSIDE the web root, next to public_html:
 *   ~/domains/nsbinvictus.tech/private/nsb-config.php
 *   (i.e. <public_html>/../private/nsb-config.php)
 * The endpoint reads no other location. Never commit the real file to Git.
 */
return [
    'site_name'      => 'NSB INVICTUS',
    'allowed_host'   => 'nsbinvictus.tech',
    'mail_to'        => ['inbox@yourdomain.com'],  // who receives inquiries
    'mail_from'      => 'website@nsbinvictus.tech', // Hostinger mailbox on the domain (create it in hPanel)
    'mail_from_name' => 'NSB INVICTUS Website',

    // Authenticated SMTP (recommended). Hostinger: smtp.hostinger.com, port 465 (SSL) or 587 (TLS).
    // Leave smtp_host empty to fall back to PHP mail().
    'smtp_host'      => 'smtp.hostinger.com',
    'smtp_port'      => 465,
    'smtp_user'      => 'website@nsbinvictus.tech',
    'smtp_pass'      => 'CHANGE_ME',

    // Optional Cloudflare Turnstile secret key (pair with PUBLIC_TURNSTILE_SITE_KEY at build time).
    'turnstile_secret' => '',

    // Local development only: log messages instead of sending email.
    'log_only' => false,

    // Free tools (api/tools.php): checks per hour per visitor. NEVER enable tools_allow_private in production.
    'tools_per_hour' => 30,
    'tools_per_day'  => 80,
    'tools_allow_private' => false,
    'allow_automation'    => false, // local testing only — keep false in production

    // "I'm not a robot" proof-of-work: difficulty in bits (16 ≈ 0.3–1 s in a browser). Optional own secret.
    'challenge_difficulty' => 16,
    'challenge_secret'     => 'CHANGE_ME_ANOTHER_RANDOM_STRING',

    // Rate limiting
    'rate_limit_per_hour' => 5,
    'rate_limit_salt'     => 'CHANGE_ME_RANDOM_STRING',
    'rate_limit_dir'      => null,                  // null = system temp dir
];
