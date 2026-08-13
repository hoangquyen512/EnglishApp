import { NextResponse } from "next/server";
import { getProfile } from "@/lib/companion/service";
import { requireUserId } from "@/lib/current-user";
import { LEVEL_LABELS } from "@/lib/constants";

export async function GET() {
  try {
    const userId = await requireUserId();
    const profile = getProfile(userId);
    return NextResponse.json({
      ...profile,
      levelLabel: LEVEL_LABELS[profile.level],
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Không tải được hồ sơ";
    return NextResponse.json({ error: message }, { status });
  }
}
