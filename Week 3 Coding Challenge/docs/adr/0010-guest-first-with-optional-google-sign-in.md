# ADR-0010: Guest first, with optional Google sign-in

## Date and status
November 4, 2026. Accepted by Preeti Anubolu, pending the teacher check below.

## Context
This is the largest conflict in the project. TR-10 and TR-14 say anonymous sessions with no logins or emails. The homework requires sign-up and log-in, says information must still be there after logging out and back in, and requires each person to see only their own information. The vision is a three-minute, judgment-free start.

We also found a practical limit. Supabase's built-in email only delivers to your own project team, at 2 messages per hour. Real test participants could not receive confirmation or password-reset email without a separate email service, which usually needs a domain you own.

## Options
- Required account before chat:
  - Good: simplest, and limits abuse.
  - Bad: a barrier before the first question, which fights the vision.
- Email and password:
  - Good: familiar.
  - Bad: password reset cannot reach real people without a custom email service.
- Guest first, optional Google sign-in:
  - Good: keeps the no-barrier start, needs no password or email service, and gives a real log-in.
  - Bad: more moving parts, and some people avoid Google.

## Decision
We will start every member as a Supabase anonymous user, so access rules work from the first answer. A "Save my progress" link in the header connects a Google account to the same user. Returning members sign in with Google on any device.

## Consequences
- This replaces TR-10 and changes TR-14. Update your Week 2 specs and tell your teacher why.
- Turn on Anonymous Sign-Ins and Manual Linking in Supabase, and set up a Google OAuth client.
- Set the Google OAuth client to production. In testing mode, only listed test users can sign in, so your teacher could be blocked.
- A guest who clears their browser loses their progress. The app must say so plainly.
- If the Google account already has a FirstStep account, the member signs in to it, and the guest answers are replaced. Test this case.
- Delete guest accounts older than 30 days with a scheduled `pg_cron` job inside the database. Supabase has no automatic cleanup, and this avoids giving the app the secret key.
- Consider an invisible bot check later if fake guests become a problem. Never use a puzzle.

**Check with your teacher:** does optional sign-in meet "People can sign up and log in"? If sign-in must be required, drop the guest step. Most of this design still holds.
