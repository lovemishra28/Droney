# Cloudflare WAF & Edge Security Architecture

This document specifies the Layer 7 firewall policies and edge rate limiting rules configured on the Cloudflare Dashboard (**Security > WAF**) for the production domain `yourdronestore.in`.

---

## 1. Custom WAF Rules (**Security > WAF > Custom Rules**)

### Rule 1: International SMS Toll Fraud & OTP Shield
* **Objective**: Blocks automated botnets and foreign VoIP originators from exhausting Fast2SMS wallet credits via SMS bomb attacks.
* **Expression**:
  ```text
  (http.request.uri.path contains "/api/auth" or http.request.uri.path eq "/login") and (ip.geoip.country ne "IN")
  ```
* **Action**: `Managed Challenge` (Enforces silent Turnstile/proof-of-work challenge before reaching Next.js server actions).

### Rule 2: Catalog Scrape & Price Harvesting Mitigation
* **Objective**: Prevents competitor scraping bots from harvesting 500+ technical SKUs and real-time inventory levels during limited pre-owned drone drops.
* **Expression**:
  ```text
  (http.request.uri.path contains "/catalog" or http.request.uri.path contains "/product") and (cf.client.bot or cf.threat_score gt 25)
  ```
* **Action**: `Managed Challenge`.

### Rule 3: Admin Console Edge Shield
* **Objective**: Blocks unauthorized geographic probing and credential stuffing against `/admin/*` management portals before requests touch the application compute layer.
* **Expression**:
  ```text
  (http.request.uri.path starts_with "/admin") and (ip.geoip.country ne "IN" or cf.threat_score gt 10)
  ```
* **Action**: `Block` (Immediate 403 Forbidden).

---

## 2. Edge Rate Limiting Rules (**Security > WAF > Rate Limiting**)

| Target Route | Matching Criteria | Rate Threshold | Evaluation Period | Action | Mitigation Details |
|---|---|---|---|---|---|
| **Public API Endpoints** | `http.request.uri.path starts_with "/api/"` | 60 requests | 1 minute | Block (429) | Protects microservices and webhook endpoints |
| **Customer OTP Verification** | `http.request.uri.path eq "/login"` | 5 requests | 10 minutes | Managed Challenge | Prevents phone brute-force enumeration |
| **Catalog Search & Filtering** | `http.request.uri.path contains "/catalog"` | 120 requests | 1 minute | Managed Challenge | Protects Supabase DB connection budget |

---

## 3. Next.js Security Headers Implemented (`next.config.ts`)

* **Content-Security-Policy (CSP)**: Strict script, style, media, connect, and image origin policies.
* **Strict-Transport-Security (HSTS)**: `max-age=63072000; includeSubDomains; preload`.
* **X-Frame-Options**: `DENY` (Clickjacking mitigation).
* **X-Content-Type-Options**: `nosniff` (MIME-type sniffing defense).
* **Referrer-Policy**: `strict-origin-when-cross-origin`.
* **Permissions-Policy**: `camera=(), microphone=(), geolocation=(), payment=()`.
* **Powered-By Header**: Disabled (`poweredByHeader: false`) to prevent framework fingerprinting.
