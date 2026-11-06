---
name: security
description: Use whenever writing or reviewing code that handles user input, logins, passwords, sessions, permissions, API keys or secrets, databases, file uploads, APIs, payments, personal data, or third-party packages. Applies OWASP Top 10 practices to prevent common vulnerabilities. Also use when asked to "check security", "is this safe", or "review for vulnerabilities".
---

# Security

Goal: the application protects its users' data and cannot be easily misused, following the OWASP Top 10 risk categories.

Security rules are never optional. If a request would require breaking one (for example, "just hard-code the API key"), refuse that part, explain the risk, and show the safe alternative.

## 1. Secrets

- Never put API keys, passwords, tokens, or connection strings in source code, comments, or commit history.
- Load secrets from environment variables (`process.env.X`); keep `.env` files in `.gitignore` and commit a `.env.example` with placeholder values only.
- Never send server secrets to the browser. In front-end frameworks, only variables explicitly marked public (for example `NEXT_PUBLIC_`) reach the client; never put secrets in them.
- If a secret is ever committed, treat it as leaked: rotate it immediately, even after deleting it.

## 2. Access control (most common risk)

- Check on the **server**, on **every request**, that the user is logged in and allowed to do this specific action on this specific record. Hiding a button is not security.
- Deny by default; grant the minimum permissions needed (least privilege).
- Never trust IDs from the client: confirm the record belongs to the current user before reading or changing it.

## 3. Input and injection

- Treat all input as untrusted: form fields, URL parameters, headers, cookies, file uploads, and data from other APIs.
- Validate on the server with an allow-list (type, length, format, range), even if the client also validates.
- Databases: always use parameterized queries or an ORM. Never build SQL by joining strings.
- Output: let the framework escape output; avoid `dangerouslySetInnerHTML`, `innerHTML`, and `eval`. Sanitize any HTML you must render.
- Never pass user input into shell commands or file paths without strict validation.
- File uploads: check type and size, rename the file, store outside the web root or in object storage.

## 4. Authentication and sessions

- Use a proven auth library or provider; never write your own password hashing or crypto.
- Hash passwords with a slow algorithm (bcrypt, scrypt, or Argon2). Never store or log plain-text passwords.
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`).
- Rate-limit login, sign-up, and password-reset endpoints. Support multi-factor authentication where possible.
- Login errors stay generic ("Email or password is incorrect") so attackers cannot discover which accounts exist.

## 5. Data protection and configuration

- HTTPS everywhere; never send sensitive data over plain HTTP.
- Collect and keep only the personal data you need. Never log passwords, tokens, or full card numbers.
- Set security headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options: nosniff, and a restrictive CORS policy (no `*` with credentials).
- Error pages and API errors show a friendly message to users; stack traces and internal details go only to server logs.
- Turn off debug mode and remove default accounts in production.

## 6. Dependencies and supply chain

- Prefer well-maintained, widely used packages; check before adding a new one.
- Commit the lock file (`package-lock.json` or equivalent) and keep dependencies updated.
- Run `npm audit` (or the ecosystem's equivalent) and fix high and critical issues.

## 7. Logging and monitoring

- Log security events (failed logins, permission denials, password changes) without sensitive data.
- Handle errors explicitly; never fail "open" (an error must not grant access).

## Checklist before finishing

Report the result for each item in your answer:

- [ ] No secrets in code; secrets come from environment variables; `.env` is git-ignored
- [ ] Every protected action checks authentication and authorization on the server
- [ ] All input validated on the server; queries are parameterized
- [ ] No unsafe HTML rendering, `eval`, or shell commands with user input
- [ ] Passwords hashed with bcrypt/scrypt/Argon2; cookies are HttpOnly, Secure, SameSite
- [ ] Errors shown to users reveal no internal details
- [ ] Dependencies checked (`npm audit` or equivalent)
- [ ] Any remaining risk is stated plainly to the user

## Reference

OWASP Top 10 (latest edition) and the OWASP Cheat Sheet Series, Open Worldwide Application Security Project.
