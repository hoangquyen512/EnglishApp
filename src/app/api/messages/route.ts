import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/current-user";
import { ensureDailyCheckin, listMessages, sendUserMessage } from "@/lib/companion/service";
import { takeSendSlot } from "@/lib/rate-limit";

const sendSchema = z.object({
  body: z.string(),
});

function fail(error: unknown) {
  const status = (error as { status?: number }).status ?? 500;
  const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const userId = await requireUserId();
    await ensureDailyCheckin(userId);
    return NextResponse.json({ messages: listMessages(userId) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!takeSendSlot(userId)) {
      return NextResponse.json(
        { error: "Chậm lại một chút nhé" },
        { status: 429 },
      );
    }
    const parsed = sendSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Tin nhắn trống" }, { status: 400 });
    }
    const result = await sendUserMessage(userId, parsed.data.body);
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}
