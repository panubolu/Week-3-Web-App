# Security checks (T-33)

Run on November 9, 2026, against the code on `main` plus the T-33 changes, and against the live app at https://firststep-app-nine.vercel.app. Follows the project security skill (OWASP Top 10) and the Keep Your App Safe Checklist.

## Results

| Check | Result | How it was checked |
|---|---|---|
| No secrets in the repo or its history | Pass | Searched all 29 commits for Supabase secret keys, Anthropic keys, Google client secrets, JWTs and private keys. The only matches were placeholders in `.env.example` and the word `service_role` in a sentence of the architecture doc. |
| `.env.local` is git-ignored; `.env.example` holds placeholders | Pass | `git check-ignore` confirms the `.env*` rule. `.env.example` has never held a real value. |
| The Supabase secret key is not used | Pass | No `SECRET` or `SERVICE_ROLE` setting anywhere in `src`. The app uses only the publishable key, and Row Level Security protects every table. |
| Every protected route checks the session on the server | Pass | `/api/chat`, `/api/feedback`, `/api/events` and `/api/account` get the person from the secure cookie through Supabase. Who to act on never comes from the request. Tested: a request with no cookie gets 401. Guest B sending Guest A's ID to `/api/account` deleted only B (T-32). |
| All input validated on the server | Pass | Every API route checks its body with a strict Zod schema. Answer values must match an allowed list, and opportunity IDs must match the approved content. Tested: `"<script>"` as an ID gets 400. |
| No unsafe HTML, `eval` or shell commands with user input | Pass | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` or `child_process` in `src`. React escapes all text. |
| Cookies are HttpOnly, Secure and SameSite | Pass | The live `Set-Cookie` header shows `Secure; HttpOnly; SameSite=lax`. |
| Content-Security-Policy, HSTS and nosniff headers | Pass | Set in `next.config.ts` for every page, together with `X-Frame-Options: DENY`, `Referrer-Policy` and `Permissions-Policy`. `X-Powered-By` is removed. Every page was tested with the policy on: no blocked content, and Google sign-in still reaches `accounts.google.com`. |
| `npm audit`: no high or critical issues | Pass | 0 vulnerabilities in the code shipped to users. 8 moderate issues in developer-only lint tools (see risks). |
| Failed sign-ins and permission denials are logged without sensitive data | Pass | Failed Google sign-ins log only an error code. Refused API requests now log only the reason, for example `Chat refused: no_session`. |
| Errors show no internal details | Pass | API errors return plain messages. Details go only to server logs (T-31). |
| Debug mode off in production | Pass | Vercel runs the production build, and browser source maps are off (the Next.js default). |
| Prompt injection produces no fake links or data leaks | Not yet testable | Claude isn't connected yet (T-14). Links already come only from the approved content file, never from typed text. Run this check when T-14 to T-16 are built. |

## Remaining risks

1. **The script policy allows inline scripts (`'unsafe-inline'`).** Next.js needs this for static pages, unless every page switches to per-request nonces, which would make every page dynamic and slower. Mitigation: React escapes all output, there's no raw HTML anywhere, and links come only from the approved file. Revisit if FirstStep ever renders HTML from content.
2. **8 moderate `npm audit` issues in developer tools** (`minimatch` through `eslint-config-next`). They run only on a developer's computer, never on the live site. The suggested fix is a forced, breaking upgrade of the lint setup, so update when `eslint-config-next` releases a fix.
3. **Vercel preview links** may show Vercel's feedback toolbar blocked by the policy. That affects previews only, not the live app.
4. **Anyone can create a guest.** Supabase limits sign-ups per IP address, and the daily cleanup removes inactive guests after 30 days. Claude usage limits (T-17) must be in place before Claude goes live.
5. **The prompt injection test is still to do,** once Claude is connected.
