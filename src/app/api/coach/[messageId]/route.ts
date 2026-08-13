import { NextResponse } from "next/server";
import { getCoach } from "@/lib/companion/service";
import { requireUserId } from "@/lib/current-user";

export async function GET(
  _request: Request,
  context: { params: Promise<{ messageId: string }> },
) {
  try {
    const userId = await requireUserId();
    const { messageId } = await context.params;
    return NextResponse.json({ chips: getCoach(userId, messageId) });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Không lấy được gợi ý, thử lại";
    return NextResponse.json({ error: message }, { status });
  }
}
