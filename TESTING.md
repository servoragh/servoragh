# Servora — Automated & Browser QA Testing Strategy

## 1. Overview
Servora enforces strict automated testing and browser verification before deployment.

---

## 2. Test Suites & Coverage

1. **Unit & API Endpoint Tests:**
   - Auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
   - Service Request API (`/api/requests`).
   - Quote Submission API (`/api/quotes`).
   - Provider Search API (`/api/providers`).
   - Admin Verification & Moderation API (`/api/admin/verify`).

2. **Integration Flow Tests:**
   - Complete customer request wizard submission.
   - Provider quote response & status update.
   - Admin verification badge assignment.

3. **Browser Automation QA (Playwright / Antigravity Subagent):**
   - Homepage responsiveness & mobile layout.
   - Provider registration & profile completeness widget.
   - Customer request wizard steps 1 through 7.
   - Search filtering by neighborhood (Sakasaka, Nyohini) & category.
   - Admin dashboard revenue & North Star metrics visualization.
