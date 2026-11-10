// T-07: proves one person cannot see, change or delete another person's data.
// Creates two throwaway guests through the app, gives each real data, then has
// Person A attack Person B's rows on every table, both through Supabase
// directly (with the public key, skipping the app) and through the app.
// Uses only fake data, and deletes both guests at the end.
//
// Run: npm run isolation-test                       (against http://localhost:3000)
//      npm run isolation-test -- https://firststep-app-nine.vercel.app
// Never prints keys or tokens.

export {}; // Marks this file as a module, so it can use top-level await.

const BASE = process.argv[2] ?? "http://localhost:3000";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
if (!SB_URL || !SB_KEY) throw new Error("Run with --env-file=.env.local");

/** A browser-like person: keeps the app's cookies and calls the app. */
class Person {
  jar = new Map<string, string>();
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  async app(method: string, path: string, body?: unknown) {
    const cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers: { ...(cookie ? { cookie } : {}), ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      redirect: "manual",
    });
    for (const line of response.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (!value || attrs.some((a) => /max-age=0/i.test(a))) this.jar.delete(name);
      else this.jar.set(name, value);
    }
    return { status: response.status, json: await response.json().catch(() => null) };
  }

  /** The person's Supabase session, read from their own cookie. */
  get auth(): { token: string; userId: string } {
    const raw = [...this.jar].filter(([k]) => /^sb-.*-auth-token/.test(k)).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v).join("");
    const decoded = JSON.parse(Buffer.from(decodeURIComponent(raw).replace(/^base64-/, ""), "base64url").toString("utf8"));
    return { token: decoded.access_token, userId: decoded.user.id };
  }

  /** A direct request to Supabase with the public key, skipping the app. */
  async db(method: string, path: string, body?: unknown) {
    const response = await fetch(`${SB_URL}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: SB_KEY,
        authorization: `Bearer ${this.auth.token}`,
        "content-type": "application/json",
        prefer: "return=representation",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json().catch(() => null);
    return { status: response.status, rows: Array.isArray(json) ? json : null };
  }
}

const results: Array<[string, boolean, string]> = [];
const check = (name: string, ok: boolean, detail: string) => results.push([name, ok, detail]);
/** An attack is blocked if it errors, or touches no rows. */
const blocked = (r: { status: number; rows: unknown[] | null }) => r.status >= 400 || (r.rows?.length ?? 0) === 0;
const describe = (r: { status: number; rows: unknown[] | null }) => `status ${r.status}, rows ${r.rows?.length ?? "none"}`;

async function setUp(person: Person) {
  await person.app("POST", "/api/session");
  await person.app("POST", "/api/chat", { type: "answer", field: "goal", value: "learning" });
  await person.app("POST", "/api/chat", { type: "answer", field: "experience", value: "new_to_tech" });
  await person.app("POST", "/api/chat", { type: "answer", field: "availability", value: "under_5" });
  await person.app("POST", "/api/feedback", { helpful: true });
  await person.app("POST", "/api/events", { opportunityId: "observe-a-project-team" });
  await person.app("POST", "/api/handoff");
  const session = (await person.db("GET", "sessions?select=id")).rows![0] as { id: string };
  // An unanswered question, saved directly as this person (fake text).
  await person.db("POST", "unanswered_questions", {
    session_id: session.id,
    user_id: person.auth.userId,
    question_text: `Test question from ${person.name}`,
  });
  return session.id;
}

async function countOwn(person: Person) {
  const counts: Record<string, number> = {};
  for (const table of ["sessions", "step_events", "feedback", "handoffs", "unanswered_questions"]) {
    counts[table] = (await person.db("GET", `${table}?select=*&user_id=eq.${person.auth.userId}`)).rows?.length ?? -1;
  }
  const session = (await person.db("GET", "sessions?select=goal,experience_level,availability")).rows![0];
  return { counts, session: JSON.stringify(session) };
}

const a = new Person("A");
const b = new Person("B");
console.log(`Testing ${BASE}\n`);

try {
  await setUp(a);
  const bSession = await setUp(b);
  const bId = b.auth.userId;
  check("A and B are different people", a.auth.userId !== bId, "two separate guest accounts");
  const before = await countOwn(b);

  // Direct requests to every table with the public key, as Person A.
  for (const table of ["sessions", "step_events", "feedback", "handoffs", "unanswered_questions"]) {
    const read = await a.db("GET", `${table}?select=*&user_id=eq.${bId}`);
    check(`${table}: A reads B's rows`, blocked(read), describe(read));
    const bySession = await a.db("GET", `${table}?select=*&${table === "sessions" ? "id" : "session_id"}=eq.${bSession}`);
    check(`${table}: A reads by B's session ID`, blocked(bySession), describe(bySession));
    const change = await a.db("PATCH", `${table}?user_id=eq.${bId}`, table === "sessions" ? { goal: "community_involvement" } : { user_id: bId });
    check(`${table}: A changes B's rows`, blocked(change), describe(change));
    const remove = await a.db("DELETE", `${table}?user_id=eq.${bId}`);
    check(`${table}: A deletes B's rows`, blocked(remove), describe(remove));
  }
  const fakeInsert = await a.db("POST", "unanswered_questions", { session_id: bSession, user_id: bId, question_text: "planted by A" });
  check("unanswered_questions: A adds a row as B", blocked(fakeInsert), describe(fakeInsert));
  const fakeSession = await a.db("POST", "sessions", { user_id: bId });
  check("sessions: A creates a session as B", blocked(fakeSession), describe(fakeSession));
  const counters = await a.db("GET", "usage_counters?select=*");
  check("usage_counters: A reads the usage counts", blocked(counters), describe(counters));

  // Through the app: requests carry no IDs, so the cookie decides who you are.
  const appDelete = await a.app("DELETE", "/api/account", { userId: bId });
  check("app: A sends B's ID to Delete my data", appDelete.json?.result === "deleted", `deleted A only (${appDelete.status})`);

  // Person B's data must be exactly as before.
  const after = await countOwn(b);
  check("B's rows are unchanged", JSON.stringify(after) === JSON.stringify(before), JSON.stringify(after.counts));
} finally {
  await b.app("DELETE", "/api/account");
  if (a.jar.size) await a.app("DELETE", "/api/account");
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(48)} ${detail}`);
}
console.log(`\n${results.length - failed} of ${results.length} passed. Both test guests were deleted.`);
process.exitCode = failed ? 1 : 0;
