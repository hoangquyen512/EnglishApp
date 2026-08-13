# Daily English Companion Chat — Design Spec

Date: 2026-08-13  
Product: EnglishApp  
Status: Draft for review

## Problem

EnglishApp needs a daily place to talk — check in, share how the day feels, and practice English without turning the conversation into a lesson. The first version is an AI companion (not human-to-human chat).

## Goals

- User can sign in and talk with one companion in a single thread, any time.
- Companion starts the day with one check-in message when the user has not already chatted that day.
- Conversation stays emotional and natural; English help is a second layer the user opens on purpose.
- Companion remembers mood, recent topics, and estimated level across days and devices.
- UI chrome is Vietnamese; chat bubbles are English.

## Non-goals (v1)

- Human-to-human / language-partner chat
- Multiple companion personas
- Voice
- Push notifications
- WebSockets / realtime
- Vocabulary notebook, SRS, scores, streaks
- Mood-picker icons or a separate journal ritual
- Native iOS/Android apps (web must stay mobile-ready)

## Approach

One friend, one thread (Approach 1). Daily check-in is just another companion message in that thread. Mood is inferred from what the user says (borrowed from Approach 2) — never a forced emoji step.

## Experience

Three screens:

1. **Sign up / log in** — email + password. No chat before auth.
2. **Chat thread** — the home screen. One companion, one history.
3. **Light profile** — display name, estimated level in Vietnamese (“Đang ở mức dễ / vừa / khá”), sign out.

Daily loop:

- Open app → land on the thread.
- If there is no check-in yet today and the user has not already sent a message today, a companion check-in is waiting (created by cron, or lazily on first fetch).
- User types English. Companion replies like a friend: listen, ask one main question, no homework.
- Coach chips sit beside some bubbles. Ignore them and the talk is uninterrupted.
- Mood is never selected. Phrases like “I’m exhausted” or “I got the job” update stored mood for tomorrow’s check-in.

If the user types Vietnamese, the companion still understands, replies in simple English, and invites them to try English — without shaming or refusing the turn.

Empty first visit: never a blank thread. The first companion message **is** that day’s check-in (`source = daily_checkin`, `last_checkin_on` set) so cron will not add a second one.

## Architecture

Web-first Next.js (App Router). Same repo serves UI and `/api`. Later native clients reuse the JSON API.

```
[Web UI - Next.js, ~480px chat column]
    → REST/JSON
[App server]
    → Postgres     users, sessions, messages, companion_state
    → LLM          reply + mood + coach + level (structured)
    → Daily cron   create at most one check-in per user per local day
```

Endpoints:

| Endpoint | Role |
| --- | --- |
| `auth` | Auth.js (NextAuth) credentials + database sessions: register, login, sign out |
| `me` | profile, level, latest mood |
| `messages` | paginated history; send a user turn |
| `GET /api/coach/:messageId` | coach payload, only when the user opens a chip |

Send-message flow: persist user message → call an OpenAI-compatible chat API (model from env) with memory summary + last 10 messages + current turn → persist companion reply → write 0–2 coach suggestions into `messages.coach_json` on the **user** message (or the companion message if the chip teaches a word Jun used). Mood / chips / level are secondary: a missing extra must not fail the reply.

Cron (default timezone `Asia/Ho_Chi_Minh`, per-user `users.timezone`): if `last_checkin_on` is not today **and** the user has not already sent a `chat` message today, insert one companion message with `source = daily_checkin` and set `last_checkin_on`. If the user already talked today, skip. Cron is the primary path; `GET /api/messages` may lazy-create the same check-in under the same rules when the user opens the app before cron runs.

No vector database in v1. Memory is a short rewritten summary, not full-transcript prompts.

## Data model

### `users`

`id`, `email` (unique), `password_hash`, `display_name`, `timezone` (default `Asia/Ho_Chi_Minh`), `created_at`.

### `sessions`

Auth.js database sessions (HTTP-only cookie). Do not invent a custom token scheme.

### `messages`

`id`, `user_id`, `role` (`user` \| `companion`), `body` (English), `created_at`, `source` (`chat` \| `daily_checkin`), `coach_json` (nullable JSON array of 0–2 chip objects).

List queries select everything except `coach_json`, and set `hasCoach` from `coach_json IS NOT NULL`. Check-ins are rows in this table, not a separate feed.

### `companion_state` (one row per user)

| Field | Meaning |
| --- | --- |
| `level` | `beginner` \| `intermediate` \| `advanced` |
| `mood` | `up` \| `ok` \| `down` \| `unknown` |
| `mood_note` | short phrase, e.g. “tired after work” |
| `memory_summary` | 500–800 characters: recent topics, people/things they mention, how they like to be asked |
| `last_checkin_on` | local calendar date of last check-in |
| `pending_level_direction` | `up` \| `down` \| `keep` \| null — last cadence suggestion |
| `updated_at` | |

Rules:

- After each user+companion turn, update `mood` only when the utterance has a signal; otherwise keep the previous mood.
- Rewrite `memory_summary` every 8 messages (4 user+companion turns), not on every token.
- LLM context = summary + the 10 latest messages + current message. Full history stays in `messages` for the user to scroll.
- Deleting an account cascades messages and `companion_state`.

Users cannot read another user’s messages (`user_id` scoped on every query).

## Companion behavior

Working name: **Jun**. Warm, curious, concise. One main question per turn. Friend, not teacher.

Level shapes wording:

- `beginner` — short sentences, everyday words, echo the user’s words.
- `intermediate` — more natural, still clear.
- `advanced` — relaxed, light idiom when it fits.

New users start at `beginner`. On the same 8-message cadence as `memory_summary`, the LLM may suggest keep / up / down from sentence length, errors, and vocabulary. Apply a change only if the same direction was suggested on the previous cadence as well (two agreeing passes, stored in `pending_level_direction`). Profile shows the Vietnamese labels above, not CEFR codes.

Daily check-in copy: greeting + a callback to yesterday’s mood or topic + one open question. Do not repeat yesterday’s sentence verbatim.

Safety: if the user expresses self-harm or crisis, Jun listens, points to real-world help, does not do therapy, and **does not attach coach chips** to those messages.

## Coach chips

Two layers: bubbles stay emotional; chips are optional.

- At most one visible chip per bubble. A message may store 0–2 suggestions; the second appears inside the open panel.
- Not every message gets a chip — only when there is a clear payoff (more natural phrasing, a useful word, a recurring grammar point).
- Chip label is Vietnamese, e.g. `Cách nói tự nhiên hơn`, `Từ mới`, `Ngữ pháp`.
- Open panel: original sentence (if rewriting), English suggestion, 1–2 sentence Vietnamese explanation, button `Dùng câu này` (inserts into the composer, does not auto-send).
- Payload: `type` (`naturaler` \| `vocab` \| `grammar`), `title_vi`, `suggestion_en`, `explain_vi`.
- When `mood` is `down`, prefer `naturaler` / `vocab`; avoid `grammar`.
- Message list returns `hasCoach` only. `GET /api/coach/:messageId` loads the payload on first tap.

## Errors

- Auth errors in short Vietnamese. Expired session → login. Unsent composer draft survives in `sessionStorage`.
- Optimistic user bubble. API/LLM failure or ~20s timeout → “Chưa gửi được” + `Thử lại`. Never drop the user’s text. Never show an empty companion bubble.
- Companion reply is required. Mood, chips, and level are best-effort.
- Chip fetch failure: “Không lấy được gợi ý, thử lại”; the thread remains readable.
- Cron failure: retry next run. Never two check-ins the same local day.
- Per-user send rate limit: 20 user messages / 5 minutes. Over: UI says “Chậm lại một chút nhé”; no companion reply for that attempt. The user message is not stored as a successful turn.
- Network failure during a crisis turn must still persist the user’s message.

## Testing

Fake the LLM in automated tests (full JSON, missing extras, timeout). No live provider in CI.

**Domain**

- Check-in: create once when no user chat today; skip if they already talked; never two per local day.
- Mood: update on signal; keep previous otherwise.
- Level: no change after one message; change after repeated signal.
- Prompt context uses summary + the 10 latest messages, not the full transcript.

**API**

- Register, login, expired session.
- Send persists user message even when LLM fails.
- Coach body is not in the message list; only on `GET /api/coach/:id`.
- User A cannot read user B.

**E2E (Playwright, narrow)**

1. Register → thread shows Jun’s welcome/check-in.
2. Send an English line → companion reply appears.
3. Open a chip when `hasCoach` → Vietnamese explanation + `Dùng câu này` inserts into the composer.
4. Sign out and back in → history remains.

No visual regression, load suite, or device farm in v1.

## Mobile demo

Static phone mockup (not the real app): `docs/superpowers/specs/demo/index.html`.

Three screens at ~390px: login, Jun thread with an optional coach chip, light profile. Vietnamese chrome, English bubbles. Mood is shown as remembered text, not a picker.

## Success

A day counts as successful when the user can open the app, see or start a conversation with Jun, be understood, and optionally tap a chip — without being forced through a lesson or a mood widget. The next day’s check-in should feel like it remembered them.
