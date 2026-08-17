# Servora — Technical System Architecture

## 1. Executive Technical Overview
Servora is built as a highly performant, low-bandwidth, mobile-first Progressive Web Application (PWA). It enables seamless local service discovery, structured request posting, quote matching, messaging, and provider verification in Tamale, Ghana.

```
                  +-----------------------------------+
                  |         Mobile / Web Client       |
                  |     (Next.js PWA + React + CSS)   |
                  +-----------------+-----------------+
                                    |
                            HTTPS / REST API
                                    |
                  +-----------------v-----------------+
                  |      Next.js App Server Engine    |
                  |  - Auth Middleware & RBAC         |
                  |  - Service Request & Quote API    |
                  |  - Trust & Verification Service   |
                  |  - Provider Discovery & Search    |
                  |  - Messaging & Notification Hub   |
                  +-----------------+-----------------+
                                    |
                       Prisma ORM Layer (TypeScript)
                                    |
                  +-----------------v-----------------+
                  |      PostgreSQL / SQLite Database |
                  |  (Users, Providers, Quotes, etc)  |
                  +-----------------------------------+
```

---

## 2. Technical Stack Specifications

| Layer | Technology | Selection Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) + React 18 | SSR for lightning-fast initial page loads on low-end Android devices in Ghana. Excellent SEO out of the box. |
| **Language** | TypeScript | Strong typing across client, API, database models, and trust badges. |
| **Styling & UI** | Tailwind CSS + Custom Design System | Atomic, zero-runtime CSS bundle. Mobile-first design system optimized for high contrast outdoors. |
| **Database & ORM** | Prisma ORM with SQLite (local) / PostgreSQL (prod) | Zero configuration needed for local dev; seamless migration to free-tier cloud PostgreSQL (Supabase / Neon / Render). |
| **Authentication** | Custom Session Auth / NextAuth with JWT | Secure HTTP-only cookies, password hashing with bcrypt, role-based access control (RBAC). |
| **PWA & Offline** | Web Manifest + Service Worker Shell | Installable on Android/iOS homescreens; caches shell for slow/intermittent connections. |
| **Image Storage** | Server-side local upload handler with canvas compression | Compress user photos client-side before upload to conserve user data and server disk. |

---

## 3. Core System Modules

1. **Auth & RBAC Module:**
   - Handles `CUSTOMER`, `PROVIDER`, and `ADMIN` user registration and authentication.
   - Manages role permissions, session tokens, and password resets.

2. **Provider Directory & Search Module:**
   - Multi-criteria filtering (category, neighborhood/zone, verification level, rating, availability).
   - Fast keyword matching with fuzzy search over service titles and business descriptions.

3. **Customer Service Request & Quote Engine:**
   - 7-step wizard: Category Selection -> Problem Description -> Image Upload -> Location Selection -> Urgency -> Budget -> Submission.
   - Intelligent matching: Automatically dispatches requests to providers operating in the selected service area.
   - Quote Submission: Providers reply with price estimate, turnaround time, availability, and note.

4. **Trust & Verification Engine:**
   - Calculates real-time Trust Scores (0-100%) based on phone verification, ID checks, completed jobs, rating average, and response rate.
   - Issues verified badges: `Phone Verified`, `Identity Verified`, `Business Verified`, `Top Rated`, `Fast Responder`.

5. **Messaging & Notification System:**
   - Lightweight customer-provider thread messaging with timestamps, unread tracking, and safety notices.
   - In-app notification center for new quote arrivals, request updates, and admin notices.
   - Direct WhatsApp integration triggers.

6. **Admin Dashboard & Zero-Capital Launch Mode:**
   - Platform metrics overview (North Star metric tracking: Weekly Connections).
   - Provider verification queue & approval controls.
   - Daily "Launch Mode" checklist tracker for the founder.
   - CSV Batch Artisan Importer.
