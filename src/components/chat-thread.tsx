"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PET_NAME } from "@/lib/constants";
import type { PublicMessage } from "@/lib/companion/service";
import type { CoachChip } from "@/lib/llm/types";

const DRAFT_KEY = "yume-draft";

type LocalMessage = PublicMessage & { failed?: boolean };

export function ChatThread({ initialMessages }: { initialMessages: PublicMessage[] }) {
  const [items, setItems] = useState<LocalMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [chips, setChips] = useState<Record<string, CoachChip[]>>({});
  const [chipError, setChipError] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, draft);
  }, [draft]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [items, openId]);

  async function openCoach(messageId: string) {
    if (openId === messageId) {
      setOpenId(null);
      return;
    }
    setChipError("");
    setOpenId(messageId);
    if (chips[messageId]) return;
    const res = await fetch(`/api/coach/${messageId}`);
    const data = (await res.json()) as { chips?: CoachChip[]; error?: string };
    if (!res.ok) {
      setChipError(data.error ?? "Không lấy được gợi ý, thử lại");
      return;
    }
    setChips((current) => ({ ...current, [messageId]: data.chips ?? [] }));
  }

  async function send(text = draft) {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    const optimistic: LocalMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      body,
      createdAt: new Date().toISOString(),
      source: "chat",
      hasCoach: false,
    };
    setItems((current) => [...current, optimistic]);
    setDraft("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json()) as {
        user?: PublicMessage;
        companion?: PublicMessage;
        error?: string;
      };
      if (!res.ok || !data.user || !data.companion) {
        setItems((current) =>
          current.map((item) =>
            item.id === optimistic.id ? { ...item, failed: true } : item,
          ),
        );
        setError(data.error ?? "Chưa gửi được");
        setDraft(body);
        return;
      }
      setItems((current) => [
        ...current.filter((item) => item.id !== optimistic.id),
        data.user,
        data.companion,
      ]);
    } catch {
      setItems((current) =>
        current.map((item) =>
          item.id === optimistic.id ? { ...item, failed: true } : item,
        ),
      );
      setError("Chưa gửi được");
      setDraft(body);
    } finally {
      setSending(false);
    }
  }

  const failed = items.find((item) => item.failed);

  return (
    <section className="screen">
      <header className="topbar">
        <div className="avatar" aria-hidden="true" />
        <div>
          <h1>{PET_NAME}</h1>
          <p>Bạn tâm sự · hỏi thăm hàng ngày</p>
        </div>
        <Link className="icon-btn" href="/profile" aria-label="Hồ sơ">
          ☰
        </Link>
      </header>

      <div className="thread" ref={threadRef}>
        <div className="day-mark">Hôm nay</div>
        {items.map((item) => (
          <div key={item.id} className={`row ${item.role === "user" ? "me" : "sora"} ${item.failed ? "pending" : ""}`}>
            <div className="bubble">{item.body}</div>
            {item.hasCoach ? (
              <button className="chip" type="button" onClick={() => void openCoach(item.id)}>
                {chips[item.id]?.[0]?.title_vi ?? "Gợi ý tiếng Anh"}
              </button>
            ) : null}
            {openId === item.id ? (
              <div className="panel">
                {chipError ? <p className="why">{chipError}</p> : null}
                {(chips[item.id] ?? []).map((chip) => (
                  <div key={chip.suggestion_en}>
                    {chip.original_en ? <p className="was">{chip.original_en}</p> : null}
                    <p className="better">{chip.suggestion_en}</p>
                    <p className="why">{chip.explain_vi}</p>
                    <button
                      className="use-btn"
                      type="button"
                      onClick={() => {
                        setDraft(chip.suggestion_en);
                        setOpenId(null);
                      }}
                    >
                      Dùng câu này
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {item.failed ? (
              <button className="retry" type="button" onClick={() => void send(item.body)}>
                Thử lại
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {error && !failed ? <p className="error" style={{ padding: "0 16px" }}>{error}</p> : null}

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Nói với ${PET_NAME} bằng tiếng Anh…`}
          disabled={sending}
        />
        <button className="send" type="submit" aria-label="Gửi" disabled={sending}>
          ↑
        </button>
      </form>
    </section>
  );
}
