import { NextResponse, type NextRequest } from "next/server";
import { startGoogle, type GoogleMode } from "@/actions/google-sign-in";

export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const form = await request.formData();
  const mode: GoogleMode = form.get("mode") === "sign-in" ? "sign-in" : "save";

  try {
    const address = await startGoogle(origin, mode);
    return NextResponse.redirect(address, { status: 303 });
  } catch (error) {
    console.error("Google start failed:", error);
    return NextResponse.redirect(`${origin}/sign-in?status=failed`, {
      status: 303,
    });
  }
}
