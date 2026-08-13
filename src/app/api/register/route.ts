import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/users";

const bodySchema = z.object({
  email: z.string(),
  password: z.string(),
  displayName: z.string(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Thiếu thông tin đăng ký" }, { status: 400 });
  }
  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json({ user });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Không đăng ký được";
    return NextResponse.json({ error: message }, { status });
  }
}
