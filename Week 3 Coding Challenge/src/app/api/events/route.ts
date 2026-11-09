import { NextResponse } from "next/server";
import { z } from "zod";
import { recordClick } from "@/actions/record-click";

const requestSchema = z.strictObject({
  opportunityId: z.string().regex(/^[a-z0-9-]{1,100}$/),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    console.warn("Click refused: invalid_request");
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  try {
    const result = await recordClick(parsed.data.opportunityId);
    const status = { recorded: 200, unknown: 400, no_session: 401 }[result];
    if (status >= 400) console.warn(`Click refused: ${result}`);
    return NextResponse.json({ result }, { status });
  } catch (error) {
    console.error("Click not recorded:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
