import { auth } from "@/auth";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    throw Object.assign(new Error("Hết phiên đăng nhập"), { status: 401 });
  }
  return id;
}
