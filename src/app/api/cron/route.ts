import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { ensureDailyCheckin } from "@/lib/companion/service";

export async function POST() {
  const secret = process.env.CRON_SECRET;
  if (secret && process.env.CRON_KEY !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = db.select().from(users).all();
  let created = 0;
  for (const user of all) {
    const message = await ensureDailyCheckin(user.id);
    if (message) created += 1;
  }
  return NextResponse.json({ created });
}
