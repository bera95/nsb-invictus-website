# Deployment — Hostinger Premium Web Hosting

Production domain: **https://nsbinvictus.tech** (www redirects to the apex domain)

The production site is **static files + one PHP endpoint**. There is no Node.js runtime, database or VPS.

## How it fits together

```
GitHub: nsb-invictus-website (private)
├── main          ← complete source code (you work here)
│     └─ every push runs CI: type check → build → verify. Nothing is published.
└── production    ← ONLY the contents of public_html (created on first manual publish)
      └─ updated by the manual "Publish production" workflow

Hostinger: ~/domains/nsbinvictus.tech/
├── public_html/          ← Git deployment of the `production` branch
│   ├── index.html, capabilities/, industries/, … (pre-rendered pages)
│   ├── _assets/          (fingerprinted CSS/JS/fonts)
│   ├── api/inquiry.php   (contact form endpoint)
│   ├── api/vendor/       (PHPMailer, installed by the workflow)
│   └── .htaccess         (HTTPS, www→apex, security headers, caching)
└── private/
    └── nsb-config.php    ← SMTP credentials. Created by hand. NEVER in Git or public_html.
```

The endpoint loads its configuration **only** from `<public_html>/../private/nsb-config.php`. A config file placed inside `public_html` is ignored.

## Step 1 — Configure GitHub (once)

1. The repository already contains the workflows `CI` and `Publish production`.
2. *(Optional)* Settings → Secrets and variables → Actions → **Variables** → `PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare Turnstile site key).
3. Make sure Actions can write to the repository: Settings → Actions → General → Workflow permissions → **Read and write permissions**.

## Step 2 — Create the production branch

1. GitHub → **Actions** → **Publish production** → **Run workflow** (branch `main`) → type `publish` → Run.
2. When it finishes, the repository has a `production` branch containing only the website files.

This step does **not** deploy anything to Hostinger yet. Hostinger only deploys once you connect it in Step 4.

## Step 3 — Prepare Hostinger (once)

1. **Domain & SSL:** in hPanel, add `nsbinvictus.tech` as a website and point the domain's DNS to Hostinger. Enable the free SSL certificate and wait until HTTPS works.
2. **PHP version:** hPanel → Advanced → PHP Configuration → choose PHP **8.2 or newer**.
3. **Mailbox:** hPanel → Emails → create `website@nsbinvictus.tech`. This is the sending address for form notifications.
4. **Email authentication:** hPanel → Emails → check that **SPF, DKIM and DMARC** are active for the domain. Without them, notifications to Gmail may land in spam.
5. **Private config (outside public_html):**
   - hPanel → Files → File Manager → open `domains/nsbinvictus.tech/` (the folder that *contains* `public_html`).
   - Create a folder `private`, then a file `nsb-config.php` inside it.
   - Paste the contents of `public/api/config.example.php` from the repository and set:
     - `smtp_pass` → the password of `website@nsbinvictus.tech`
     - `rate_limit_salt` → any long random string
     - `turnstile_secret` → only if you use Turnstile
   - Resulting path: `~/domains/nsbinvictus.tech/private/nsb-config.php`
   - If your account shows a different layout (e.g. `public_html` directly in your home folder), create `private/` next to `public_html` — the rule is always `<public_html>/../private/nsb-config.php`.
6. **Empty public_html:** Git deployment requires an empty target directory. Back up and delete Hostinger's default files (`default.php`, etc.) from `public_html`. **Do not delete the `private/` folder.**

## Step 4 — Connect Hostinger Git deployment (first real deployment)

1. hPanel → Websites → nsbinvictus.tech → **Advanced → GIT**.
2. Repository: `git@github.com:<your-username>/nsb-invictus-website.git` (or connect via the Hostinger GitHub app if offered).
   - Because the repository is **private**, add the SSH key shown by Hostinger as a **read-only Deploy key**: GitHub → repository → Settings → Deploy keys → Add deploy key (leave "Allow write access" **unchecked**).
3. Branch: **`production`** · Directory: **`public_html`** (leave the install path empty if hPanel installs into `public_html` by default).
4. Click **Create**, then **Deploy**.
5. *(Optional)* Enable **Auto deployment**, and add the webhook URL that Hostinger shows to GitHub → Settings → Webhooks (content type `application/json`, push events). From then on, every successful **Publish production** run goes live automatically. Without it, click **Deploy** in hPanel after each publish.

## Step 5 — Verify the live site

- `https://nsbinvictus.tech/` loads, and `http://` and `https://www.` redirect to it.
- `https://nsbinvictus.tech/api/config.example.php` → 403 · `/api/vendor/` → 404/403.
- Submit a test inquiry on `/contact/` and confirm the email arrives at inbox@yourdomain.com, with Reply-To set to the sender.
- Google Search Console: add the domain property and submit `https://nsbinvictus.tech/sitemap-index.xml`.
- Run through `docs/QA-CHECKLIST.md`.

## Free tools endpoint (`api/tools.php`)

- Works on Hostinger Premium as is. It needs the PHP `curl`, `dom` and `mbstring` extensions, which are enabled by default.
- Optional settings in `nsb-config.php`: `tools_per_hour` (default 30 checks per visitor per hour).
- **Never** set `tools_allow_private` in production. It is only for local testing; with it off, the tools refuse internal and private addresses (SSRF protection).
- "Full report" requests arrive as normal inquiry emails with topic `free-audit` and the audit results attached.

## Everyday workflow

1. Change content or code, check with `npm run dev` / `npm run build && npm run verify && npm run preview`.
2. Push to `main`. CI verifies it, but nothing goes live.
3. When ready: Actions → **Publish production** → type `publish`.
4. Hostinger deploys (automatically if the webhook is set, otherwise click **Deploy**).

## Rollback

`production` keeps every release as a commit. To roll back, either:
- run **Publish production** from an earlier state of `main` (revert the commit on `main` first), or
- in GitHub, revert the latest commit on `production`, then deploy in hPanel.

## Secrets policy

- No secret is stored in Git. `.env*`, `private/`, `public/api/config.php` and `api/vendor/` are git-ignored.
- `npm run verify` fails the build if `.env`, `api/config.php`, `private/`, source files or `node_modules` appear in the production payload.
- `public/api/.htaccess` denies web access to config, JSON, lock, Markdown and vendor files.
- Never paste passwords or tokens into issues, commits or chat. SMTP credentials live only in `~/domains/nsbinvictus.tech/private/nsb-config.php`.
