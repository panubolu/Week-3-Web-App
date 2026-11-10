import { NextResponse } from "next/server";
import { recordHandoff } from "@/actions/record-handoff";

// No request body: who and which step come only from the secure cookie.
// Always returns a summary the member can share, even with no session.
export async function POST() {
  try {
    const handoff = await recordHandoff();
    if (handoff.result === "no_session") console.warn("Handoff not recorded: no_session");
    return NextResponse.json(handoff);
  } catch (error) {
    console.error("Handoff failed:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
