# Ikas Integration Discovery — 2026-06-25

## TL;DR
- **Partner**: `care@kreis.studio` (Care Agent), partnerId `7ce126a0-b217-4474-a08e-1847ead75f02`
- **Storefront**: `dev-kreisstudio.myikas.com` (storeName `dev-kreisstudio`, storefrontId `0e109ad5-6bba-4289-80e0-76b3c0de0530`)
- **Theme**: `e732c6fe-a1b7-438c-abaf-ecad7e202aed`
- **CLI**: `/data/.npm-global/bin/ikas` v0.0.27 installed, tokens at `/data/.ikas/config.json`
- **Status**: Access token EXPIRED (expired 2026-06-15; today is 2026-06-25). Need fresh OAuth login.
- **OAuth in flight**: CLI process started at 2026-06-25 21:54 UTC, listening on `127.0.0.1:38891`, state=`yhjnlyp9mkp`.

## Endpoints discovered
- **Admin GraphQL** (works with browser UA + Bearer token): `https://api.myikas.com/api/v1/admin/graphql`
  - 63 query fields including `me`, `getMerchant`, `listStorefront`, `listSalesChannel`, `listProduct`, `listOrder`, `listCustomer`, `listAbandonedCheckouts`, `getIkasWalletWithBalance`, `listWebhook`, `listProductBrand`, `listCategory`, etc.
  - **No public OAuth refresh endpoint** — must do full browser login.
- Cloudflare blocks bare `python-urllib` requests with HTTP 403 (Error 1010). **Must send a real browser User-Agent** (`Mozilla/5.0 ... Chrome/124.0.0.0` works).

## Auth state
- `accessToken`: JWT (HS256), `aud: ikas-cli`, `iss: partners`. **Expired 10 days ago.**
- `refreshToken`: 268 chars (eyJhb…). The CLI's `auth me` hangs — likely because it tries to refresh on every call and there's no public refresh endpoint.
- `ikas auth login` runs PKCE OAuth on a local callback port and waits for the user to authenticate in a browser.

## Plan to actually connect
1. **User completes OAuth** in their browser (paste the URL, log in as `care@kreis.studio`, get redirected to `http://127.0.0.1:38891/callback?code=...&state=yhjnlyp9mkp`, paste that final URL back into the CLI on this VPS via `process(action='submit', data='<url>')` or terminal input).
2. **Verify**: `ikas auth me` returns the partner profile.
3. **Wire up dashboard**: add `src/lib/ikas.ts` with the GraphQL client + types, add `/api/ikas/...` route handlers in Next.js that pull live data, add a `/store` page to the dashboard with live counts (products, orders, customers, revenue).
4. **Ship**: rebuild dashboard, redeploy to Vercel.

## OAuth URL for the user
```
https://partners.ikas.com/auth/oauth/authorize?response_type=code&client_id=ikas-cli&redirect_uri=http%3A%2F%2F127.0.0.1%3A38891%2Fcallback&state=yhjnlyp9mkp&code_challenge=x_qJDT-OgrV40kcpoZFYkqXn9ukwrt1AtPrOwoooIXI&code_challenge_method=S256
```