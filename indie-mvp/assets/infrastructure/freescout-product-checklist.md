# FreeScout Product Mailbox Manifest — {{PRODUCT}}

## Product

- Product ID: {{PRODUCT_ID}}
- Support hostname/route: {{SUPPORT_ROUTE}}
- Locales: {{LOCALES}}
- Public sender identity: {{SENDER}}
- Owner: {{OWNER}}

## Owner setup

- [ ] Create the product mailbox in the shared FreeScout service.
- [ ] Configure inbound IMAP/OAuth or approved mail ingestion.
- [ ] Configure outbound SMTP identity.
- [ ] Verify SPF, DKIM, DMARC, replies, bounces, and threading.
- [ ] Assign least-privilege agents and mailbox permissions.
- [ ] Install/license only approved compatible modules.
- [ ] Create and brand the End-User Portal.
- [ ] Configure email-link customer access.
- [ ] Verify every product locale.
- [ ] Configure attachment limits, malware policy, retention, deletion/export, and privacy wording.
- [ ] Keep the native-email fallback working.

## Safe product handoff

Allow only:

- product identifier;
- app version and build;
- platform;
- locale.

Do not place user identity, email, content, analytics identifiers, tokens, secrets, or diagnostics in support URLs. Diagnostics require a separate preview-and-consent action.

## API handoff

After owner setup:

- Mailbox ID: {{NON_SECRET_MAILBOX_ID}}
- Portal URL: {{PORTAL_URL}}
- API module/version: {{API_MODULE_VERSION}}
- Webhook IDs: {{NON_SECRET_WEBHOOK_IDS}}
- Secret location/owner: {{REFERENCE_ONLY}}

Verify only documented API operations. Do not create/update mailboxes, mail credentials, permissions, modules, or portal branding through undocumented endpoints, direct database writes, browser automation, or container execution.

## Acceptance evidence

- [ ] Portal submission
- [ ] Email-link login
- [ ] Ticket view/status/reply
- [ ] Inbound and outbound mail
- [ ] Threading and bounce behavior
- [ ] Locale
- [ ] Attachment policy
- [ ] API/webhook signature and event
- [ ] Native-email fallback
- [ ] Backup inclusion and restore evidence

## Plain-English summary

This checklist gives one product an isolated support mailbox and portal without reinstalling the shared support platform.
