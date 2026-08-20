# Environment Variables & Secrets Protection Rule

Prevent accidental credential leakage, unauthorized access, and broken deployment environments.

---

## 1. Zero Hardcoded Secrets

- **NEVER** commit API keys, database connection strings, JWT secrets, Cloudinary API secrets, Supabase service keys, or private certificates directly into source code files.
- Always access configuration via environment variables (e.g. `process.env.VAR_NAME` or NestJS `ConfigService`).

---

## 2. Mandatory `.env.example` Maintenance

Whenever a new environment variable is introduced:
1. Document the variable name and a non-sensitive dummy example value in `.env.example` in both `apps/api/.env.example` and `apps/web/.env.example` (or root `.env.example`).
2. Include brief comments explaining the variable's purpose and format.

---

## 3. Public vs Private Env Scoping

1. **Frontend**: Only prefix variables with `NEXT_PUBLIC_` if they are strictly required in browser JavaScript (e.g. `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`).
2. **Backend**: Never expose internal database passwords or private keys to the frontend.
