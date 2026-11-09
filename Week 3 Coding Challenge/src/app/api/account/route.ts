import { NextResponse } from "next/server";
import { deleteAccount } from "@/actions/delete-account";

// The request body is ignored on purpose: who to delete comes only from
// the secure session cookie.
export async function DELETE() {
  try {
    return NextResponse.json({ result: await deleteAccount() });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
