# Servora — Monetization Strategy & Feature Flags

## 1. Zero-Capital Launch Strategy
During the launch phase, Servora operates on **0% platform commission and 100% free provider profiles**. The goal is liquidity: connecting 50+ real customers with 100+ verified artisans in Tamale.

---

## 2. Dynamic Feature-Flagged Revenue Streams

| Monetization Model | Description | Feature Flag | Expected Revenue | Activation Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **Verified Artisan Badge** | One-off fee for admin identity vetting & physical location verification badge | `verification_badge_fee_enabled` | GHS 20 - 50 per provider | 50 active providers verified |
| **Promoted Listings** | Top category search placement with transparent "Sponsored" badge | `featured_listing_enabled` | GHS 10 - 30 / week | High artisan search competition |
| **Pro Subscriptions** | Pro tier for artisans (unlimited quotes, SMS lead notifications, priority badge) | `provider_subscription_enabled` | GHS 30 - 50 / month | > 200 monthly customer requests |
| **Lead Purchase Credits** | Micro-payment per qualified customer lead response | `lead_fee_enabled` | GHS 2 - 5 per lead quote | High provider conversion rate |
| **Escrow & Commission** | 3-5% transaction fee on completed jobs via MoMo | `commission_enabled` | 5% per completed job | Integrated Paystack Ghana payment gateway |

---

## 3. Database Feature Flags
Feature flags are managed dynamically via the Admin Panel and stored in the `FeatureFlag` table.
