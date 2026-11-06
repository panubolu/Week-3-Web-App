import { NextResponse, type NextRequest } from "next/server";
import { signOut } from "@/actions/google-sign-in";

export async function POST(request: NextRequest) {
  try {
    await signOut();
  } catch (error) {
    console.error("Sign-out failed:", error);
  }
  return NextResponse.redirect(request.nextUrl.origin, { status: 303 });
}
