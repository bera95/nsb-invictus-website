---
title: "Why Your Emails Go to Spam: SPF, DKIM and DMARC Explained"
description: "Why business emails land in spam and how SPF, DKIM and DMARC fix it. A clear explanation, the records you need, a safe rollout plan and a free checker for your domain."
date: 2026-11-16
category: "Security & Cloud"
capability: cloud-platform
tool: email-deliverability
keywords: ["emails going to spam", "SPF DKIM DMARC", "DMARC setup", "email deliverability"]
faq:
  - q: "Do I need SPF, DKIM and DMARC?"
    a: "Yes. Major mailbox providers such as Gmail and Yahoo expect authenticated email, and require all three for bulk senders. Without them, your messages are far more likely to be filtered or rejected."
  - q: "Which DMARC policy should I use?"
    a: "Start with p=none to collect reports, fix every legitimate sender, then move to p=quarantine and finally p=reject to stop spoofing completely."
  - q: "Can I have more than one SPF record?"
    a: "No. A domain must have exactly one SPF record. Combine all sending services into a single record."
---

**Short answer:** emails land in spam when receiving servers cannot verify that you are allowed to send for your domain. **SPF** lists approved sending servers, **DKIM** signs each message, and **DMARC** tells receivers what to do when checks fail. Set up all three, then tighten DMARC step by step.

## SPF — who may send for your domain

A single DNS TXT record such as `v=spf1 include:_spf.yourprovider.com ~all` lists the services allowed to send your email: your mailbox provider, website, CRM or newsletter tool.

- Only **one** SPF record per domain.
- Keep it under the 10-DNS-lookup limit.
- End with `~all` (soft fail) or `-all` (fail).

## DKIM — a signature on every message

Your email provider gives you a public key to publish in DNS. Every outgoing message is signed with the matching private key, so receivers can verify it was not altered and really comes from you. Enable DKIM in *every* service that sends on your behalf.

## DMARC — the policy and the reports

A DMARC record at `_dmarc.yourdomain.com` ties SPF and DKIM to your visible “From” address and sets a policy:

- `p=none` — monitor only, receive reports
- `p=quarantine` — send failing messages to spam
- `p=reject` — refuse failing messages

Add a reporting address (`rua=`) to receive daily summaries of who sends email using your domain.

## A safe rollout plan

1. Publish SPF and enable DKIM for every sending service.
2. Add DMARC with `p=none` and collect reports for a few weeks.
3. Fix any legitimate service that fails.
4. Move to `p=quarantine`, then to `p=reject`.

## Other deliverability factors

- Send from your **own domain**, not a free mailbox.
- Keep lists clean and make **unsubscribing** easy.
- Warm up new domains gradually.
- Avoid misleading subject lines and link-heavy messages.

Check your domain right now with our [free email deliverability checker](/tools/email-deliverability/) — or let our [security team](/capabilities/cloud-platform/) configure it for you.
