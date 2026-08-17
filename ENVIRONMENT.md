# Servora — Environment Configuration Guide

## Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | SQLite file path or PostgreSQL connection URI | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Yes | Secret key for JWT signing | `servora-secret-key-change-in-prod-12345` |
| `NEXTAUTH_URL` | Yes | Base URL of the application | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | No | Display name of the platform | `Servora` |
| `NEXT_PUBLIC_CITY_NAME` | No | Primary launch city | `Tamale` |
