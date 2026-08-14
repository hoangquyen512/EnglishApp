import { useEffect, useRef, useState } from "react";
import { DEFAULT_PET_NAME, UI } from "../../constants/ui";
import {
  ensureDailyCheckin,
  sendCompanionMessage,
  type PublicMessage,
} from "../../features/companion";
import { PrimaryButton } from "../shared/primary-button";

interface CompanionChatScreenProps {
  onBack: () => void;
}

export function CompanionChatScreen({ onBack }: CompanionChatScreenProps) {
  const [items, setItems] = useState<PublicMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void ensureDailyCheckin()
      .then(setItems)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : UI.companionError);
      });
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [items, openId]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }
    setSending(true);
    setError(null);
    setDraft("");
    try {
      setItems(await sendCompanionMessage(text));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : UI.companionError);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3">
        <PrimaryButton variant="text" onClick={onBack}>
          {UI.backHome}
        </PrimaryButton>
        <h1 className="text-lg font-bold">{DEFAULT_PET_NAME}</h1>
        <span className="w-16" />
      </header>
      <div ref={threadRef} className="flex-1 space-y-3 overflow-auto p-4">
        <p className="text-sm text-muted">{UI.companionIntro}</p>
        {items.map((item) => (
          <article
            key={item.id}
            className={`max-w-[85%] rounded-[16px] px-3 py-2 text-sm ${
              item.role === "user" ? "ml-auto bg-clay text-white" : "bg-paper ring-1 ring-line"
            }`}
          >
            <p>{item.body}</p>
            {item.hasCoach && item.coach?.length ? (
              <button
                type="button"
                className="mt-2 text-xs underline"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                {UI.companionCoach}
              </button>
            ) : null}
            {openId === item.id && item.coach
              ? item.coach.map((chip) => (
                  <p key={chip.suggestion_en} className="mt-2 rounded-lg bg-cream p-2 text-xs text-ink">
                    <strong>{chip.title_vi}</strong>
                    <br />
                    {chip.suggestion_en}
                    <br />
                    {chip.explain_vi}
                  </p>
                ))
              : null}
          </article>
        ))}
        {error ? <p className="text-sm text-rose">{error}</p> : null}
      </div>
      <form
        className="flex gap-2 border-t border-line bg-paper p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={UI.companionPlaceholder}
          className="h-11 flex-1 rounded-xl border border-line bg-cream px-3"
        />
        <PrimaryButton type="submit" disabled={sending}>
          {UI.companionSend}
        </PrimaryButton>
      </form>
    </main>
  );
}
