# Servora — Security & Privacy Architecture

## 1. Authentication & Password Security
- **Bcrypt Password Hashing:** All passwords are hashed with a salt factor of 10 prior to storage. Passwords are never logged or stored in plaintext.
- **Session Tokens:** Stateless JWT tokens stored in HTTP-Only, Secure, SameSite cookies to protect against Cross-Site Scripting (XSS) and Session Hijacking.
- **Role-Based Access Control (RBAC):** Strict authorization checks on all API endpoints (`CUSTOMER`, `PROVIDER`, `ADMIN`).

---

## 2. Input Sanitization & Data Protection
- **SQL Injection Prevention:** All database queries are executed via Prisma ORM parameterized statements.
- **XSS Mitigation:** Input strings are sanitized using React JSX default escaping and server-side validation.
- **CSRF Protection:** SameSite cookie enforcement and state validation on state-changing API endpoints.
- **Rate Limiting:** API routes (login, registration, request creation) enforce IP-based rate limiting to prevent spam and credential stuffing.

---

## 3. Privacy & Anti-Fraud Features
- **Phone Privacy:** Customer phone numbers are hidden from public view and only accessible to providers when a quote is accepted.
- **Review Moderation:** Reviews undergo validation to prevent duplicate or manufactured reviews.
- **File Upload Safeguards:** Restricts uploads strictly to `.jpg`, `.png`, and `.webp` under 5 MB. Files are validated by MIME type.
- **Audit Logging:** Administrative actions (provider verification, account suspension, review deletion) are immutably recorded in `AuditLog`.
