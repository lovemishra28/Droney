# AeroStore Production Domain Cutover, DLT Compliance & Launch Checklist

This runbook defines the production cutover procedure, Indian regulatory DLT SMS registration parameters, DNS edge routing configuration, synthetic stress-testing commands, and pre-flight launch verification matrix for **AeroStore India**.

---

## 1. Pre-Flight Configuration Matrix

| Infrastructure Layer | Operational Requirement | Verification Procedure | Launch Status |
| :--- | :--- | :--- | :--- |
| **Domain & DNS** | Cloudflare Full (Strict) SSL, apex CNAME flattening to Vercel (`cname.vercel-dns.com`) | Validate HTTPS handshake, HTTP/3 QUIC negotiation, and automated edge HTTP-to-HTTPS redirect (`curl -I https://yourdronestore.in`). | **Ready** |
| **TRAI / DLT SMS** | Fast2SMS DLT Entity ID, approved Header (`AEROIN`), and active registered templates | Send test OTP to live Airtel, Jio, and Vi numbers in India; verify delivery within $\le 5$ seconds. | **Ready** |
| **Email Protocol** | Resend custom domain DNS records (SPF `v=spf1`, DKIM CNAMEs, DMARC `p=reject`) | Execute `dig TXT _dmarc.yourdronestore.in` and confirm 10/10 deliverability without spam flags. | **Ready** |
| **Database Pooler** | Supabase Supavisor Transaction Pool on port `6543` with `prepare: false` | Verify `max_connections: 15` in client config; ensure zero pool starvation warnings under load. | **Ready** |
| **Media Delivery** | Cloudflare R2 bucket with custom domain and Bunny.net Stream HLS encoding | Upload test 4K flight video; verify automated HLS multi-bitrate delivery (1080p, 720p, 480p). | **Ready** |
| **Direct UPI Payment** | Valid merchant VPA (`aerostore@icici`), correct payee business name, unique UTR constraints | Run end-to-end checkout; scan dynamic QR, verify order enters `awaiting_verification`, and approve. | **Ready** |
| **Security Auditing** | `next.config.ts` CSP headers, Cloudflare WAF bot challenges, admin RBAC | Confirm `X-Frame-Options: DENY`, non-admin redirect on `/admin`, and foreign IP challenge on OTP. | **Ready** |

---

## 2. TRAI / DLT Indian SMS Template Compliance

Telecom Regulatory Authority of India (TRAI) regulations require all transactional SMS messages sent to Indian mobile subscribers to route via registered Distributed Ledger Technology (DLT) entities (VilPower, Jio DLT, Airtel DLT). Dispatched strings must character-match approved templates.

### Primary DLT Identifiers
* **Principal Entity ID (PE ID)**: `1701159827103847291` *(AeroStore Drones Private Limited)*
* **Registered Sender ID (Header)**: `AEROIN`
* **DLT Telemarketer ID**: Fast2SMS Registered Route

### Approved Templates

#### A. Authentication & Verification OTP (`AEROSTORE_OTP_VERIFY`)
* **DLT Template ID**: `1107168920194827192`
* **Message Type**: Service Implicit / Transactional
* **Approved Template Text**:
```text
Your verification code for AeroStore India is {#var#}. Valid for 5 minutes. Never share your OTP with anyone. - AEROSTORE
```

#### B. Order Confirmation & Air Dispatch (`AEROSTORE_ORDER_CONFIRM`)
* **DLT Template ID**: `1107168920194827193`
* **Message Type**: Service Implicit / Transactional
* **Approved Template Text**:
```text
Your AeroStore order #{#var#} is confirmed and being prepared for air dispatch. Track updates in your account. - AEROSTORE
```

---

## 3. Synthetic Stress Testing Execution (`k6`)

Run the synthetic stress test suites against your staging or pre-production deployment before public DNS cutover:

### 1. Catalog & Edge Cache Stress (100 – 2,500 VUs)
Validates that Cloudflare edge micro-caching maintains a p95 latency under 400ms:
```bash
k6 run tests/load/catalog-stress.js
```
* **Success Criteria**: `http_req_failed < 1%`, `p(95) < 400ms`, `edge_cache_hit_rate > 85%`.

### 2. Flash Drop Inventory Race Condition (300 Concurrent VUs)
Simulates 300 simultaneous virtual users competing to reserve a single-unit pre-owned drone listing:
```bash
k6 run tests/load/flash-drop-reservation.js
```
* **Success Criteria**: `successful_inventory_locks == 1`, with remaining 299 users receiving controlled 409 Conflict responses and zero inventory overselling.

### 3. OTP Flood & Sliding-Window Rate-Limiter Abuse (50 req/s)
Fires 50 requests per second to verify Upstash Redis sliding-window limiters throttle toll fraud:
```bash
k6 run tests/load/otp-abuse.js
```
* **Success Criteria**: `rate_limited_429_responses > 200`, protecting Fast2SMS credits from automated exhaustion.

---

## 4. Production Cutover Execution Runbook

Follow these sequential steps during launch day:

### Step 1: DNS Apex Routing & Cloudflare SSL
1. Set DNS records in Cloudflare:
   - `CNAME @ cname.vercel-dns.com` (Proxied: Orange Cloud active)
   - `CNAME www cname.vercel-dns.com` (Proxied: Orange Cloud active)
   - `CNAME cdn <your-r2-public-domain>` (Proxied: Orange Cloud active)
   - `CNAME video <your-bunny-pullzone>` (DNS Only / Gray Cloud)
2. Set SSL/TLS encryption mode to **Full (Strict)**.
3. Enable **Always Use HTTPS**, **Automatic HTTPS Rewrites**, and **HTTP/3 (with QUIC)**.

### Step 2: Database Migration Sync
Deploy database schemas and indexes to production Supabase via direct connection (port 5432):
```bash
pnpm drizzle-kit push:pg
```
Ensure all tables (`users`, `products`, `drone_specifications`, `second_hand_details`, `product_media`, `orders`, `order_items`, `stock_reservations`, `audit_logs`) and indexes are active.

### Step 3: 500+ SKU Catalog Ingestion
1. Authenticate as super-admin and navigate to `https://yourdronestore.in/admin/import`.
2. Upload the master `products-seed.csv` spreadsheet.
3. Verify client-side PapaParse row validation (all 500+ SKUs parsed with valid categories, paise prices, and technical specs).
4. Execute batch import; verify atomic batch upsert and audit trail creation in `/admin/products`.

### Step 4: End-to-End Payment & Order Verification
1. Open an incognito browser window at `https://yourdronestore.in`.
2. Sign in using a real Indian mobile number (+91 98XXXXXXXX); verify OTP receipt within 5 seconds.
3. Add a drone to the cart and proceed to checkout.
4. Scan the dynamic NPCI UPI QR code with BHIM, Google Pay, PhonePe, or Paytm.
5. Enter test UTR `123456789012` and upload the payment confirmation screenshot.
6. Check the customer order status page (`/order/ORD-XXXXX`).
7. In the admin portal (`/admin/payments`), inspect the pending transaction and click **Approve Payment**.
8. Confirm order state transition to `paid` and physical inventory decrement.

### Step 5: Activate Cloudflare WAF Protection
In Cloudflare Dashboard > Security > WAF:
1. Switch WAF rule **Block Non-Indian Traffic on OTP Endpoints** to **Interactive Challenge**.
2. Switch WAF rule **Enforce Strict Rate Limits on Admin Login & UTR Submission** to **Block**.
3. Enable Cloudflare Bot Management **Super Bot Fight Mode** (Block Definitely Automated, Challenge Likely Automated).

---

## 5. Post-Launch Telemetry & Monitoring

1. **Supavisor Pool Health**: Monitor Supabase dashboard metrics to ensure client connection count stays comfortably within the 15-connection serverless budget.
2. **Upstash Redis Hit Ratio**: Confirm catalog cache hits exceed 85% under organic user browsing.
3. **UTR Verification Queue SLA**: Maintain an internal target of reviewing and approving manual UPI transactions within 15 minutes of receipt.
