import { NextResponse } from "next/server";
import { startSession } from "@/actions/start-session";

export async function POST() {
  try {
    return NextResponse.json(await startSession());
  } catch (error) {
    // Details stay in server logs. The browser gets a plain signal.
    console.error("Session start failed:", error);
    return NextResponse.json({ error: "session_unavailable" }, { status: 503 });
  }
}
