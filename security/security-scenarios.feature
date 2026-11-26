# Security BDD scenarios for FirstStep (Week 6 PenTest)
# One @security scenario per recommendation R-01 to R-14 (specs SEC-01 to SEC-14).
# "Automated" scenarios can become tests in CI (src/bdd or scripts/isolation-test.ts);
# "Manual check" scenarios verify a platform setting and are re-checked by hand.

Feature: FirstStep security controls from the Week 6 PenTest

  # Manual check (Supabase dashboard)
  @security @owasp:secrets-management @spec:SEC-01
  Scenario: The database can't be reached directly from the internet
    Given direct database access is restricted and SSL is enforced
    When someone outside tries to connect to the database on port 5432
    Then the connection is refused
    And the database password is long, random and stored only in a password manager

  # Manual check (GitHub settings)
  @security @owasp:ci-cd @spec:SEC-02
  Scenario: Code can't reach production without review and green checks
    Given a ruleset protects the main branch
    When someone pushes directly to main, or opens a pull request with a failing check
    Then GitHub refuses the push, or blocks the merge until all 6 checks pass

  # Automated in CI (unit test of the message builder; page text check in the smoke test)
  @security @owasp:user-privacy @spec:SEC-03
  Scenario: Contact details are removed before a typed answer is sent to Claude
    Given a member types "email me at jane@example.com or call 555-201-3344"
    When FirstStep prepares the message for Claude
    Then the message sent contains no email address and no phone number
    And the Privacy page names Anthropic, Supabase, Vercel and Google

  # Automated (scripts/isolation-test.ts, run before each release)
  @security @owasp:denial-of-service @spec:SEC-04
  Scenario: A member can't use up the usage limit by calling the database directly
    Given a signed-in guest with their own valid login token
    When they call the usage-counter function directly through Supabase's API
    Then the call is refused
    And the app's daily typing count is unchanged

  # Automated (isolation test) and manual check (Supabase setting)
  @security @owasp:bot-management @spec:SEC-04
  Scenario: Guests can't be created by a script without passing the CAPTCHA
    Given CAPTCHA is required for anonymous sign-ins
    When a guest is created without a valid CAPTCHA token
    Then Supabase refuses to create the guest

  # Manual check (Supabase setting)
  @security @owasp:authentication @spec:SEC-05
  Scenario: Email-and-password accounts can't be created
    Given the Email provider is turned off
    When someone calls Supabase's sign-up with an email and a password
    Then the sign-up is refused and no confirmation email is sent

  # Manual check (Supabase setting), plus a sign-in test after the change
  @security @owasp:oauth2 @spec:SEC-06
  Scenario: Google sign-in can only return to FirstStep's callback page
    Given the redirect list contains only https://firststep-app-nine.vercel.app/auth/callback
    When a sign-in request asks to return to http://localhost:3000 or another page
    Then Supabase uses the Site URL instead of the requested address

  # Manual check (Vercel Firewall), tested on a preview, never as a load test on production
  @security @owasp:denial-of-service @spec:SEC-07
  Scenario: Bursts of requests from one address are slowed down
    Given a firewall rate rule for POST /api/session and /api/events
    When one address sends more than the allowed number in a minute
    Then the extra requests are refused with 429
    And members on other addresses are not affected

  # Automated (scripts/isolation-test.ts)
  @security @owasp:mass-assignment @spec:SEC-08
  Scenario: A member can't change their step or completion directly in the database
    Given a signed-in guest with their own login token
    When they update their own session row to set completed = true through Supabase's API
    Then the update is refused
    And they can still change their answers through FirstStep

  # Automated in CI (unit test of the origin check)
  @security @owasp:csrf @spec:SEC-09
  Scenario: Requests from another website are refused
    Given a signed-in member
    When a request to /api/chat arrives with Origin https://evil.example or Content-Type text/plain
    Then FirstStep refuses it with 403 and saves nothing

  # Automated in CI (build and smoke test reads the headers)
  @security @owasp:web-cache @spec:SEC-10
  Scenario: Personal API replies are never cached
    Given any request to an /api route
    When FirstStep replies
    Then the reply has Cache-Control: private, no-store
    And a request with no session gets 401

  # Manual check (Vercel environment variables)
  @security @owasp:secure-cloud-architecture @spec:SEC-11
  Scenario: Preview deployments never touch live data
    Given a preview deployment of a branch
    When it reads or saves anything
    Then it uses the test Supabase project, not the live one

  # Automated (scheduled job), checked once by lowering the threshold on the test project
  @security @owasp:logging @spec:SEC-12
  Scenario: The owner is told before the typing limit runs out
    Given the daily usage check
    When the app's typing count passes 80% of its daily limit
    Then the owner receives an email

  # Automated in CI (smoke test checks the header has a nonce and no 'unsafe-inline' in script-src)
  @security @owasp:content-security-policy @spec:SEC-13
  Scenario: An injected inline script doesn't run
    Given a nonce-based Content Security Policy
    When a page contains an inline script without the page's nonce
    Then the browser blocks it and sends a CSP report

  # Manual check
  @security @owasp:authentication @spec:SEC-14
  Scenario: Members see FirstStep's name when signing in with Google
    Given a custom domain or a verified Google brand
    When a member chooses Save my progress
    Then Google's screen says they are continuing to FirstStep
