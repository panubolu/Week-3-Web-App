import { NextResponse, type NextRequest } from "next/server";
import { finishGoogle } from "@/actions/google-sign-in";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const toSignIn = (status: string) =>
    NextResponse.redirect(`${origin}/sign-in?status=${status}`);

  if (searchParams.get("error_code") === "identity_already_exists") {
    return toSignIn("already-saved");
  }

  const code = searchParams.get("code");
  if (!code) return toSignIn("canceled");

  try {
    await finishGoogle(code);
    return NextResponse.redirect(origin);
  } catch (error) {
    console.error("Google finish failed:", error);
    return toSignIn("failed");
  }
}
