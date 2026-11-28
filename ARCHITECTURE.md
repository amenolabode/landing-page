# Website architecture

Feature overview: [README.md](README.md).

## Stack

| Concern | Choice |
| --- | --- |
| App | React 18 (JavaScript), Create React App with CRACO, React Router 6 |
| Styling | Tailwind with the Scan design system (`vendor/scan-design-system`, its `dist` tokens feed `tailwind.config.js`); Material Tailwind and antd for a few widgets |
| Docs code samples | `react-syntax-highlighter` through `CodeBlock` / `MultiLanguageCodeBlock` |
| Hosting | Vercel |

## Layout

```text
src/
  App.js                  every route: marketing, legal, /docs, /fcl (gated), link landings
  pages/                  marketing and landing pages; pages/docs/ developer docs; pages/about/
  layout/                 site header/footer layout and DocsLayout (docs sidebar)
  components/             Header, Footer, Hero, CTA, SEO, CookieConsent, InternalDocsGate,
                          DocsFclRedirect, ReferralQueryHandler, code blocks
  config/env.js           APP_ENV → API and business portal hosts; showInternalDocs()
  config/legalDocuments.js links to FCL legal PDFs
  utils/                  routes.js (paths), openCustomerApp (deep link then store),
                          store URLs, structured data
vendor/scan-design-system design tokens and Tailwind preset (vendored for Vercel)
```

## Patterns and decisions

| Decision | Why |
| --- | --- |
| Links try the app, then the store | `openCustomerApp` detects iOS or Android and falls back to the right store, so a pay or gift link always goes somewhere useful |
| Tokens stay in the query string, not the path | Gift and investment-gift receive links carry `?token=`; the page hands it to the app and never stores it |
| FCL provider docs hidden in production | `InternalDocsGate` sends production visitors from `/fcl` to `/docs` |
| Legal text lives with FCL | Privacy and terms redirect to FCL's published PDFs, so there is one source of truth |
| No demo bank | The demo bank page and its docs mentions were removed (Nov 2026); docs describe the real test environment |
| Security headers at the edge | Set once in `vercel.json` for every response |
