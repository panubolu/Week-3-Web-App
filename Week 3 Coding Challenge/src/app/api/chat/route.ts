import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/actions/answer-question";

const requestSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("answer"),
    field: z.enum(["goal", "experience", "availability"]),
    value: z.string().min(1).max(50),
  }),
  z.strictObject({ type: z.literal("finish") }),
]);

const refusals = {
  no_session: { status: 401, message: "Please refresh the page to continue." },
  conflict: {
    status: 409,
    message: "This changed in another tab. Please reload to see the latest.",
  },
  not_allowed: {
    status: 409,
    message: "That step isn't available right now. Please answer the current question.",
  },
  invalid_value: {
    status: 400,
    message: "Please choose one of the options shown.",
  },
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: refusals.invalid_value.message },
      { status: 400 },
    );
  }

  try {
    const result = await answerQuestion(parsed.data);
    if (result.status === "ok") return NextResponse.json(result.view);

    const refusal = refusals[result.status];
    return NextResponse.json(
      { error: result.status, message: refusal.message },
      { status: refusal.status },
    );
  } catch (error) {
    // Details stay in server logs. The browser gets a plain message.
    console.error("Answer failed:", error);
    return NextResponse.json(
      {
        error: "unavailable",
        message: "We couldn't save that. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
