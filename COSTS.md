# Servora — Zero-Capital Cost Control & Infrastructure Budget

## Target Monthly Running Cost: GHS 0 / Month ($0 USD)

To keep Servora operating sustainably without initial venture capital or out-of-pocket developer expenditure, every service in the production architecture is selected for its generous free tier.

---

## 1. Cost Breakdown & Service Selection

| Infrastructure Component | Selected Provider | Free Tier Allowance | Initial Monthly Cost | Contingency / Scale Alternative |
| :--- | :--- | :--- | :--- | :--- |
| **Hosting & CDN** | Vercel Free / Netlify / Render Free | 100 GB bandwidth, unlimited SSG/SSR builds | **GHS 0** ($0.00) | Cloudflare Pages (Unlimited bandwidth) |
| **Database** | Supabase Free / Neon Serverless Postgres | 500 MB database, 50k monthly active users | **GHS 0** ($0.00) | Local SQLite on free Render instance |
| **Authentication** | NextAuth JWT (Self-hosted in Next.js) | Unlimited sessions/users | **GHS 0** ($0.00) | Supabase Auth (Free up to 50k MAU) |
| **Image & File Storage** | Client-side compression + Local / Supabase Storage | 1 GB free bucket storage | **GHS 0** ($0.00) | Cloudinary Free Tier (25 GB credits) |
| **Maps & Geo** | Text location zones (Tamale areas) | No paid Google Maps API calls | **GHS 0** ($0.00) | OpenStreetMap / Leaflet (Free open source) |
| **SMS & Messaging** | Direct WhatsApp Web links + In-app chat | Zero paid SMS gateways required | **GHS 0** ($0.00) | Hubtel / mNotify Ghana SMS when budget allows |
| **Domain Name** | `servora.vercel.app` (Free platform sub-domain) | Free SSL certificate included | **GHS 0** ($0.00) | `.com.gh` domain (approx GHS 120/year when profitable) |

---

## 2. Guardrails Against Unexpected Costs

1. **Client-Side Image Optimization:** Images are canvas-compressed to < 150 KB before transmission to prevent storage overflow.
2. **Serverless Cache Policies:** Static pages (`/services/electricians/tamale`, `/how-it-works`) are statically pre-rendered (ISR) to reduce database queries.
3. **No Heavy Background Workers:** Async jobs are handled inside light Next.js API routes without requiring paid Redis or Celery instances.
