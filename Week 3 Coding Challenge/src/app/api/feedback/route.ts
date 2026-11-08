import { NextResponse } from "next/server";
import { z } from "zod";
import { giveFeedback } from "@/actions/give-feedback";

const requestSchema = z.strictObject({ helpful: z.boolean() });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  try {
    const result = await giveFeedback(parsed.data.helpful);
    const status = { saved: 200, already: 200, no_session: 401, not_allowed: 409 }[result];
    return NextResponse.json({ result }, { status });
  } catch (error) {
    console.error("Feedback failed:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
