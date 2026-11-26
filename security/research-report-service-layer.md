# Securing the Service Layer: attacks, challenges and OWASP defences

*Security research report · Week 6, AI Development Residency · Preeti Anubolu, written with Claude · November 2026. Examples come from the FirstStep PenTest (commit `579c1ab`); see [pentest-report.md](pentest-report.md) and the FirstStep Security Requirement Specs in Notion. Slides: [service-layer-slides.pdf](service-layer-slides.pdf).*

## Introduction

Web applications are split into layers so each part has one job: the **presentation layer** draws the screens, the **service layer** receives requests and coordinates the work, the **domain layer** holds the business rules, the **data source layer** talks to storage, and the **database layer** keeps the data. This report focuses on the service layer because every request from the outside world passes through it. Whatever an attacker types, clicks or scripts arrives here as an HTTP request.

That makes the service layer the application's front door and security checkpoint. If it trusts the wrong thing (a field in a request, a hidden button, a cookie, an AI model's reply), every layer behind it inherits the mistake. Broken access control, injection, weak authentication and missing rate limits, all service-layer failures, rank near the top of the OWASP Top 10 (2025) and the OWASP API Security Top 10.

The report explains what the layer does and the network around it, the vulnerabilities that can happen there, why it is hard to protect completely, and the OWASP principles teams should follow. Real results from the penetration test of **FirstStep**, a Next.js onboarding chat on Vercel with a Supabase database and Anthropic's Claude, show what these risks look like in practice.

## Layer

### What happens at the service layer

The service layer is the application's public interface: the operations the outside world may ask for. It is made of **API endpoints**, **authentication routes** (sign-in, sign-out, OAuth callbacks), **server actions or controllers**, and **adapters** that call other services. For each request it:

1. **Receives and parses** the method, path, headers, cookies and body.
2. **Authenticates**: works out who is calling from a session cookie or token.
3. **Authorizes**: decides whether this caller may do this action on this specific data.
4. **Validates** the input against what is allowed.
5. **Orchestrates** the domain rules, the data source layer and outside services (email, payments, AI).
6. **Shapes the response**: only the data the caller should see, the right status and headers, plain error messages.
7. **Records** what happened, without secrets or personal data.

Its job is to enforce **who may do what, with which input, how often**, then hand off to the domain layer. In FirstStep it is six API routes (`/api/session`, `/api/chat`, `/api/events`, `/api/feedback`, `/api/handoff`, `/api/account`), three sign-in routes, the server actions and the Claude adapter.

### Which parts of the network are involved

The service layer sits in the **server tier**, between the client tier (browsers and scripts) and the database tier:

- **Internet and TLS:** HTTPS protects requests from being read or changed on the way; HSTS stops browsers from using plain HTTP.
- **The edge:** a CDN or platform edge (Vercel for FirstStep) ends TLS, caches public pages and can apply a firewall, bot protection and rate limits before code runs.
- **Serverless functions:** short-lived and auto-scaling, usually sharing outgoing IP addresses, which matters for rate limits.
- **Outbound calls:** the service layer is also a client of the database API, identity providers and third-party APIs. Each call crosses a trust boundary and needs credentials, encryption and timeouts.
- **Browser rules:** the same-origin policy, SameSite cookies and CORS decide which requests from other websites carry the user's session.

## Vulnerabilities

The core rule is that **the client is controlled by the attacker**: the body, query string, headers, cookies, hidden fields and the order of steps can all be changed. Vulnerabilities appear wherever the service layer forgets this.

**1. Authentication.** Attackers use leaked passwords (credential stuffing), unlimited login attempts, forged tokens (for example a JWT with `alg: none` or a changed user ID), stolen OAuth codes through loose redirect lists, and unused sign-up paths. Result: acting as another user. *FirstStep:* forged and unsigned tokens were rejected (ES256 signing, PKCE), but an unused email sign-up was left on (F-12) and the redirect list was wider than needed (F-13).

**2. Session management.** Stolen cookies through XSS, session fixation, sessions that survive sign-out, and personal replies stored by shared caches lead to account takeover. *FirstStep:* cookies are HttpOnly, Secure and SameSite=Lax and end on sign-out; one personal reply was marked `Cache-Control: public` (F-09).

**3. Authorization.** *Broken object level authorization (IDOR)* means changing an ID to reach someone else's record; *broken function level authorization* means calling an internal function directly because its button is merely hidden; trusting a user ID from the request is a third form. Result: reading, changing or deleting others' data. *FirstStep:* Row Level Security blocked 26 of 26 cross-user attacks, but the server-only Claude usage counter could be called directly by any guest (F-01).

**4. Input validation and injection.** SQL, NoSQL, command and template injection, path traversal, oversized bodies and unexpected types can steal or destroy data, run code on the server or crash it. *FirstStep:* strict schemas rejected every payload, a 1 MB body and wrong types; no query is built from user text.

**5. Mass assignment and business logic.** Adding fields the server should decide (`"role": "admin"`, `"completed": true`), skipping workflow steps or racing requests can escalate privileges or corrupt records. *FirstStep:* the API rejected these, but the database still let members rewrite their own whole row directly (F-05).

**6. CSRF and CORS.** A malicious site makes a signed-in victim's browser send a request with their cookie; loose CORS can let other sites read replies. Result: actions in the victim's name. *FirstStep:* protected by SameSite cookies only, with no `Origin` or content-type check (F-06).

**7. SSRF.** If the service fetches user-supplied URLs, attackers point it at internal addresses such as cloud metadata to steal credentials. *FirstStep:* not exposed; the server calls only fixed addresses.

**8. Unsafe deserialization and prototype pollution.** Serialized objects or JSON keys like `__proto__` can change program behaviour or run code. *FirstStep:* strict schemas rejected them.

**9. Denial of service and "denial of wallet."** Flooding endpoints, unlimited free accounts and draining shared budgets (AI tokens, email quotas) stop the service or create large bills. *FirstStep:* about 10 scripted guests could use up the whole daily AI typing limit (F-01); the app's own routes had no limits (F-08); and because the server creates every guest, members may share one per-address sign-in limit (F-14).

**10. AI and LLM risks** (OWASP Top 10 for LLM Applications): *prompt injection* ("ignore your instructions...") to change behaviour or reveal instructions; *insecure output handling* (showing or running model output unchecked); *sensitive information disclosure*; and *excessive agency* (tools an attacker can steer). *FirstStep:* 13 injection attempts failed because Claude may only pick fixed values, every reply is rechecked, its words are never shown and it has no tools; but typed text goes to Anthropic without notice or redaction (F-03).

**11. Secrets and configuration.** Keys in Git or the browser, over-powerful keys, default-open platform settings and unprotected deployment pipelines can hand over connected services. *FirstStep:* no secrets in the browser or 85 commits of history, but direct database access was open, unencrypted and weakly protected (F-15, partly fixed during the test), and `main` was unprotected (F-02).

**12. Errors, logging and files.** Detailed errors give attackers a map; logs with secrets become targets; unwatched logs hide attacks; file uploads can plant scripts. *FirstStep:* plain errors and privacy-safe logs, but no alerts (F-17); no uploads.

## Challenges of Securing This Layer

1. **The attack surface keeps growing.** Every endpoint, parameter and integration needs authentication, authorization, validation and limits; missing one on one route is enough. "Internal" functions with no screen are easy to forget, as FirstStep's usage counter showed.
2. **Authorization must be checked everywhere.** Signing in proves identity, but each request must prove access to *this* record. Pushing rules into the database helps, but the database permissions must then be precise too.
3. **The server often acts with the user's own credentials.** That is good for least privilege, but it means anything the server can do, the user can do directly. Separating the two needs deliberate design, such as server-only tokens.
4. **Configuration is spread across platforms.** Hosting, database, identity provider, code host and CI each have their own dashboard and defaults, often open for convenience. Most of FirstStep's findings were settings, not code, and no single review sees them all.
5. **Serverless and shared infrastructure change the rules.** Shared outgoing addresses distort per-IP limits while attackers rotate addresses easily; short log retention and paid alerts let attacks go unnoticed.
6. **Protection versus friction.** Limits and CAPTCHAs that stop bots can block real users at busy moments or create accessibility barriers, and switching a protection on before the code supports it can break the product.
7. **Security versus performance.** Stricter browser policies and extra checks add latency; caching speeds pages up but can leak personal replies.
8. **AI is unpredictable.** Models can be persuaded by cleverly written input and no filter is complete, so the service must limit what model output can do.
9. **Dependencies change constantly.** A new advisory in a framework or package can make a secure service vulnerable overnight.
10. **Tests prove only what they check.** Automated tests and PenTests reduce risk but can never prove a service has no weakness.

## How to Fix The Vulnerabilities

The OWASP Cheat Sheet Series turns each risk into concrete controls. The strongest fixes are **structural**: they make a whole class of mistake impossible.

- **Authentication and sessions** *(Authentication, Session Management, OAuth2, JSON Web Token):* use a proven identity provider and enable only needed sign-in methods; sign tokens with asymmetric keys and reject unsigned or altered ones; use the OAuth code flow with PKCE and an exact redirect allow-list; set cookies `HttpOnly`, `Secure`, `SameSite`; renew sessions after sign-in, end them on sign-out, and send `Cache-Control: private, no-store` on personal replies.
- **Authorization** *(Authorization, IDOR Prevention):* deny by default; check every request on the server for the specific object; take identity from the session, never the body; enforce rules close to the data (Row Level Security) with the narrowest grants; give internal operations a credential users never receive.
- **Input and injection** *(Input Validation, Injection Prevention, Query Parameterization, Mass Assignment):* validate every input with an allow-list schema that rejects unknown fields; never build queries, commands or templates from strings; limit body sizes; let the server decide state, and use locking or constraints so racing requests apply once.
- **CSRF, CORS and SSRF:** combine SameSite cookies with an `Origin` check and a required JSON content type; keep CORS closed; never fetch user-supplied URLs, or allow-list them and block internal addresses.
- **Rate limits and abuse** *(Denial of Service, Bot Management):* limit per user and per address at the edge and in the app; give expensive operations their own quotas that only the spending code path can consume; protect free sign-ups with a CAPTCHA; roll out in log-only mode first.
- **AI safety** *(LLM Prompt Injection Prevention, Secure Coding with AI):* keep instructions and user text separate; force a fixed output schema and recheck values; treat output as untrusted and never render or execute it; give no tools unless essential; remove personal details before sending and tell users which companies receive their words.
- **Secrets and configuration** *(Secrets Management, Key Management, CI/CD Security):* keep secrets only in secret stores with the least powerful key; plan rotation; close default-open settings (restrict direct database access, enforce TLS, generated passwords); require pull requests and CI checks, pin actions, turn on dependency alerts; separate test and production data.
- **Errors, logging and transport** *(Error Handling, Logging, TLS, HTTP Headers, CSP):* plain error messages; log security events with reasons but no secrets, and alert on them; HTTPS with HSTS and TLS 1.2+; security headers and a strict Content Security Policy.

**Development teams** should threat-model each feature (OWASP's four questions and STRIDE), turn cheat sheets into acceptance criteria and BDD scenarios that run in CI, review configuration as carefully as code, keep dependencies current, and pen-test after major changes. **Product teams** should write security and privacy into requirements from the start, weigh protection against friction and accessibility deliberately, budget for monitoring, and plan roll-outs that add and test a new protection before removing the old path, so no one is locked out.

### Conclusion

The service layer decides whom to trust and how much. In FirstStep, the core code defences (strict validation, Row Level Security, signed tokens, constrained AI output) held up across 54 tests, while the remaining weaknesses were in **configuration and design around the code**: a server-only function reachable by users, open platform defaults, missing limits and missing monitoring. Practising the OWASP principles above as everyday habits, and proving them with tests in CI, keeps the front door locked as an application grows.

### Sources

- OWASP Cheat Sheet Series (cheatsheetseries.owasp.org), via the course's OWASP secure-coding skill: the sheets named in each section above, plus Threat Modeling and Business Logic Security.
- OWASP Top 10 (2025), OWASP API Security Top 10, OWASP Top 10 for LLM Applications, OWASP Web Security Testing Guide.
- FirstStep PenTest results (November 25, 2026): findings F-01 to F-17 and requirement specs SEC-01 to SEC-14.
