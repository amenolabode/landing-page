# Scan website

The public site at ottoafrica.com. It explains Scan to customers and businesses, hosts the developer docs, and is where links from the apps, SMS and email land (pay links, gift cards, referrals).

Code layout: [ARCHITECTURE.md](ARCHITECTURE.md).

## Pages

| Area | Pages |
| --- | --- |
| Marketing | Home, business and personal solutions, about (QR payments, gift cards, loyalty), pricing, contact, security |
| Legal | Privacy policy and terms (redirect to the FCL PDFs), investment terms, cookie policy, account deletion |
| Developer docs (`/docs`) | Getting started, authentication, payments, transfers, funding flows, PIN, identity, gift cards, investment certificates, transactions, loyalty, QR codes, settlements, user management, webhooks, errors, rate limits, accounting, Cosmo (LLM), SDKs (JS, Flutter, Android, iOS), testing, support |
| FCL docs (`/fcl`) | Architecture, gateway and quickstart, core banking. Hidden on the production site |
| Link landings | `/pay/:qrId` (opens the app or the store), `/gift-cards/receive` and `/investment-gift/receive` (`?token=` from SMS or email), `/gift-cards/:id` share page, referral invite, checkout |

Link landings try to open the customer app first and fall back to the App Store or Google Play for the visitor's phone.

## Run it

```bash
npm install
cp .env.example .env     # APP_ENV=local|test|staging|prod
npm start                # http://localhost:3003
npm run build
```

## Deploy

Vercel (`vercel.json`): legal redirects, single-page rewrite, and security headers on every response (HSTS, nosniff, frame and referrer policy).
