import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChatThread } from "@/components/chat-thread";
import { ensureDailyCheckin, listMessages } from "@/lib/companion/service";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await ensureDailyCheckin(session.user.id);
  return <ChatThread initialMessages={listMessages(session.user.id)} />;
}
