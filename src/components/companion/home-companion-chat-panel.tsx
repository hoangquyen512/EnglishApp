import { useEffect, useRef, useState } from "react";
import { UI } from "../../constants/ui";
import {
  ensureDailyCheckin,
  formatCompanionTime,
  sendCompanionMessage,
  type PublicMessage,
} from "../../features/companion";
import type { SessionDto } from "../../features/auth";
import type { PetState } from "../../types";
import { UserAvatar } from "../account/user-avatar";
import { PetAvatar } from "../pet/pet-avatar";

interface HomeCompanionChatPanelProps {
  pet: PetState;
  session: SessionDto;
}

export function HomeCompanionChatPanel({ pet, session }: HomeCompanionChatPanelProps) {
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
    <section className="yume-chat" aria-label={UI.companionChatTitle}>
      <header className="yume-chat__head">
        <p className="yume-chat__eyebrow">{UI.companionChatEyebrow}</p>
        <h2>{UI.companionChatTitle}</h2>
        <p className="yume-chat__desc">{UI.companionIntro}</p>
        <p className="yume-chat__tagline">
          <span aria-hidden>♡</span> {UI.companionListenTagline}
        </p>
      </header>

      <div ref={threadRef} className="yume-chat__thread">
        {items.map((item) => {
          const isUser = item.role === "user";
          const time = formatCompanionTime(item.createdAt);
          return (
            <article
              key={item.id}
              className={isUser ? "yume-chat__row yume-chat__row--user" : "yume-chat__row"}
            >
              {!isUser ? (
                <span className="yume-chat__avatar" aria-hidden>
                  <PetAvatar pet={pet} size="sm" variant="float" />
                </span>
              ) : null}
              <div className={isUser ? "yume-chat__bubble yume-chat__bubble--user" : "yume-chat__bubble"}>
                <p>{item.body}</p>
                {time ? <time dateTime={item.createdAt}>{time}</time> : null}
                {item.hasCoach && item.coach?.length ? (
                  <button
                    type="button"
                    className="yume-chat__coach-toggle"
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  >
                    {UI.companionCoach}
                  </button>
                ) : null}
                {openId === item.id && item.coach
                  ? item.coach.map((chip) => (
                      <div key={chip.suggestion_en} className="yume-chat__coach">
                        <strong>{chip.title_vi}</strong>
                        <p>{chip.suggestion_en}</p>
                        <p>{chip.explain_vi}</p>
                      </div>
                    ))
                  : null}
              </div>
              {isUser ? (
                <span className="yume-chat__avatar" aria-hidden>
                  <UserAvatar session={session} size="sm" />
                </span>
              ) : null}
            </article>
          );
        })}
        {error ? <p className="yume-chat__error">{error}</p> : null}
      </div>

      <form
        className="yume-chat__composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <span className="yume-chat__composer-star" aria-hidden>
          ✦
        </span>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={UI.companionPlaceholder}
          aria-label={UI.companionPlaceholder}
          disabled={sending}
        />
        <button type="submit" className="yume-chat__send" disabled={sending || !draft.trim()}>
          <span aria-hidden>✈</span> {UI.companionSend}
        </button>
      </form>
    </section>
  );
}
