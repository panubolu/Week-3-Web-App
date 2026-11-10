import { NextResponse } from "next/server";
import { recordHandoff } from "@/actions/record-handoff";

// No request body: who and which step come only from the secure cookie.
export async function POST() {
  try {
    const result = await recordHandoff();
    if (result === "no_session") console.warn("Handoff refused: no_session");
    return NextResponse.json({ result }, { status: result === "recorded" ? 200 : 401 });
  } catch (error) {
    console.error("Handoff not recorded:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
