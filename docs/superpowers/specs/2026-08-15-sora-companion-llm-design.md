# Yume — Sora Companion LLM (confiding chat)

Date: 2026-08-15  
Product: Yume (Tauri desktop)  
Status: Ready for review  
Scope: Nối chat tâm sự của Sora với **Gemini Flash** qua **Cloudflare Worker**, quota **100 lượt / máy / ngày**. User cuối không setup API key.

Spec này **không** đổi UI chrome của màn chat (vẫn tiếng Việt), không thêm cloud account, không bật LLM trên GitHub Pages demo, không dạy ngữ pháp trong bubble.

---

## 1. Context

Chat “Nói với Sora” đã có thread, daily check-in, mood, coach chips, và `LlmClient`. Runtime hiện gán cứng `createFakeLlm()`: hầu hết câu tiếng Anh trả `"That sounds real. What happened next?"`. Check-in `"Hey, how is your day going?"` có thể nhân đôi vì `ensureDailyCheckin()` chạy song song (React Strict Mode) trước khi ghi `last_checkin_on`.

Auth Yume là username/password **local SQLite trên từng máy**. Worker không thể tin `user_id` local.

### 1.1 Quyết định đã chốt

| Quyết định | Lựa chọn |
| --- | --- |
| Ai setup LLM | Dev (một lần). User cuối: không key, không Ollama |
| Provider | Gemini Flash (model mặc định `gemini-2.0-flash`, override bằng env Worker) |
| Proxy | Cloudflare Worker giữ `GEMINI_API_KEY` |
| Quota | 100 lượt LLM / `install_id` / ngày local `Asia/Ho_Chi_Minh` |
| Hết quota | Chặn chat (không fallback câu local); báo thử lại ngày mai |
| Định danh | UUID cài máy, persist `settings.json` |
| Demo GitHub Pages | Giữ fake LLM |
| Crisis | Regex local trước khi gọi Worker — không tốn quota |

### 1.2 Goals

1. Sora trả lời theo đúng nội dung user vừa nói (không template cố định).
2. Bạn bè: 1–2 câu tiếng Anh ngắn, **một** câu hỏi; coach chỉ khi user mở chip.
3. User không nhập API key.
4. Hết 100 lượt thì không gọi Gemini nữa trong ngày đó.
5. Không hai check-in trong cùng ngày local.

### 1.3 Non-goals

- Cloud login / đồng bộ quota giữa hai máy
- User dán Gemini/OpenAI key trong app
- Model local (Ollama / WebLLM)
- LLM trên web demo
- Đổi schema `companion_messages` / coach chip payload
- Voice

---

## 2. Architecture

```
[Tauri WebView]
    sendCompanionMessage / ensureDailyCheckin
         │
         ├─ crisis regex? → canned English safety reply, 0 quota
         ├─ remaining == 0? → chặn send, không gọi mạng
         └─ POST Worker  /v1/companion/turn
                 │
                 ├─ validate + quota KV
                 ├─ inject Sora system prompt (Worker, không tin prompt từ client)
                 └─ Gemini generateContent (JSON)
                         │
                         ▼
                   reply + mood + coach + quotaRemaining
```

Ba phần:

1. **App** — `HttpLlm` implements `LlmClient`. Quota `remaining` cache sau mỗi turn. Fake LLM chỉ còn: CI, web demo, và crisis local.
2. **Worker** — secret Gemini, KV quota, prompt Sora, cap kích thước input.
3. **Gemini** — generate structured JSON matching `LlmTurnResult` (không field `quotaRemaining`).

App không bao giờ nhúng Gemini key. Worker URL nằm trong config public (`VITE_COMPANION_LLM_URL` hoặc constant build). URL không phải secret: ai gọi được vẫn bị quota 100/id + rate limit IP.

### 2.1 Identity

- Lần đầu mở chat (desktop): nếu chưa có `companionInstallId`, sinh UUID v4, ghi vào `settings.json` (cùng file user-scoped hiện có).
- Mọi request Worker gửi header hoặc body `installId`.
- Cài lại app / xóa settings = id mới = quota mới. Chấp nhận (không có cloud account).
- Không gửi username local lên Worker.

### 2.2 Quota (KV)

| | |
| --- | --- |
| Key | `quota:{installId}:{yyyy-mm-dd}` với ngày `Asia/Ho_Chi_Minh` |
| Value | số nguyên đã dùng trong ngày |
| Limit | `100` |
| Đếm | mỗi lần Worker **sắp gọi** Gemini thành công (sau validate, trước/atomic với increment). Check-in đếm 1. Crisis local không đếm. Gọi Gemini lỗi sau khi tăng: vẫn trừ (đơn giản, tránh retry đốt bill kép thì Worker không retry Gemini). |
| Hết | HTTP `429` + `{ "code": "quota_exceeded", "retryAt": "<next local midnight+ISO>" }` |

Worker cũng rate-limit IP: tối đa **20 POST / 5 phút** (cùng tinh thần spec 2026-08-13). Over: `429` code `slow_down`.

---

## 3. Companion behavior (prompt trên Worker)

Giữ luật spec 2026-08-13:

- Tên: **Sora**. Warm, curious, concise. Friend, not teacher.
- Level `beginner` (default): câu ngắn, từ đời thường, echo vài từ user vừa dùng.
- `intermediate` / `advanced`: tự nhiên hơn; advanced được idiom nhẹ.
- Một câu hỏi chính mỗi lượt. Không giao bài, không sửa ngữ pháp trong bubble.
- Check-in: greeting + callback mood/topic hôm trước + một câu hỏi. Không copy nguyên câu hôm qua.
- User gõ tiếng Việt: hiểu, trả lời tiếng Anh đơn giản, mời thử lại bằng tiếng Anh — không từ chối lượt, không sỉ nhục.
- Không lặp nguyên văn câu Sora vừa nói trong `recent`.

Crisis (app, trước Worker): nếu `currentUserMessage` khớp self-harm (EN + VI, cùng pattern `fake-llm` hiện có) → canned reply an toàn, `crisis: true`, không chip, không HTTP.

Coach: 0–2 chip, chỉ khi có payoff rõ; `mood=down` thì tránh type `grammar`. Missing extras không được làm fail reply.

### 3.1 Request (client → Worker)

`POST /v1/companion/turn`  
JSON:

```json
{
  "installId": "uuid",
  "purpose": "reply" | "checkin",
  "level": "beginner" | "intermediate" | "advanced",
  "mood": "up" | "ok" | "down" | "unknown",
  "moodNote": "string | null",
  "memorySummary": "string",
  "recent": [{ "role": "user" | "companion", "body": "string" }],
  "currentUserMessage": "string"
}
```

Giới hạn Worker (reject `400`): `installId` UUID; `recent` ≤ 10; mỗi `body` ≤ 2000 chars; `currentUserMessage` ≤ 2000; `memorySummary` ≤ 800.

### 3.2 Response (Worker → client)

HTTP 200:

```json
{
  "reply": "string",
  "mood": { "mood": "down", "moodNote": "tired from cleaning" },
  "coach": [],
  "levelSuggestion": "keep",
  "memorySummary": "optional string",
  "crisis": false,
  "quotaRemaining": 87
}
```

`mood` may be `null`. App map vào `LlmTurnResult` hiện có; `quotaRemaining` chỉ để UI + cache.

Timeout app: ~20s. Gemini/Worker lỗi: không bubble rỗng; composer giữ/restore text; `UI.companionError` + thử lại.

---

## 4. App UX when blocked or failing

| Tình huống | Chat | Copy (VI chrome) |
| --- | --- | --- |
| `quotaRemaining > 0` | Gửi bình thường | không banner |
| `quotaRemaining === 0` hoặc 429 `quota_exceeded` | Disable Gửi; không persist thêm lượt user | “Hôm nay Sora hết lượt nói. Mai quay lại nhé.” |
| 429 `slow_down` | Không lưu lượt đó | “Chậm lại một chút nhé.” |
| Mạng / 5xx / timeout | User bubble đã persist thì giữ; không thêm bubble Sora rỗng. Bấm Gửi lại **không** insert thêm một dòng user trùng | `Không gửi được. Thử lại.` |
| Crisis | Canned, gửi được | bubble English an toàn |

Không fallback hội thoại local khi hết quota. Không fallback local khi mất mạng (user đã chọn LLM-only + chặn hết quota).

Daily check-in: nếu `remaining === 0` lúc mở thread (hiếm, quota reset theo ngày) → **không** tạo check-in LLM; không greeting giả. Thread có thể trống cho đến khi quota reset (ngày mới). Thực tế sáng ngày mới remaining = 100.

### 4.1 Duplicate check-in

`ensureDailyCheckin` phải **single-flight**: một promise in-flight toàn app; Strict Mode re-mount tái sử dụng cùng promise. Ghi `lastCheckinOn` / insert row chỉ sau khi `shouldCreateCheckin` thắng **và** không có check-in `source=daily_checkin` cùng ngày trong thread. Không hai dòng `"Hey, how is your day going?"`.

---

## 5. Developer setup (một lần)

User cuối: cài Yume, đăng nhập local, mở “Nói với Sora”. Không thêm bước.

Dev:

1. Google AI Studio → tạo API key Gemini.
2. Repo thêm `workers/companion-llm/` (Wrangler).
3. `wrangler kv namespace create COMPANION_QUOTA`.
4. `wrangler secret put GEMINI_API_KEY`.
5. Optional: `GEMINI_MODEL=gemini-2.0-flash`.
6. `wrangler deploy` → URL public, ví dụ `https://yume-companion.<account>.workers.dev`.
7. Build app với `VITE_COMPANION_LLM_URL` trỏ URL đó. Desktop release không có URL → đối xử như LLM tắt: chat báo lỗi cấu hình (không lặng im dùng fake, trừ web demo).

CI unit test **không** gọi Worker/Gemini. Fixture `HttpLlm` bằng mock fetch.

---

## 6. Files

| File | Việc |
| --- | --- |
| `workers/companion-llm/` | Worker: route, prompt, Gemini, KV quota, tests (vitest + miniflare hoặc fixture JSON) |
| `src/features/companion/http-llm.ts` | `createHttpLlm(url)` |
| `src/features/companion/install-id.ts` | get-or-create UUID |
| `src/features/companion/service.ts` | chọn client, quota cache, chặn send, single-flight check-in |
| `src/features/companion/index.ts` | export cần thiết |
| `src/components/companion/companion-chat-screen.tsx` | banner hết lượt, disable Gửi |
| `src/constants/ui.ts` | copy hết quota / chậm lại |
| `src/stores/settings-store.ts` hoặc settings read/write | persist `companionInstallId` |
| `src/features/companion/*.test.ts` | domain tests |

Giữ `fake-llm.ts` cho demo + crisis + test.

---

## 7. Testing

Không live Gemini trong `pnpm test`.

**Domain**

- Check-in: một lần/ngày; Strict Mode / hai caller song song → một message.
- Crisis: không gọi `fetch`.
- `quotaRemaining === 0`: `sendCompanionMessage` throw/code quota; không `fetch`.
- HTTP 200: persist reply; cache remaining.
- HTTP 429 quota: UI copy; không companion LLM body.
- HTTP 500: error + retry path; không bubble Sora rỗng.
- Worker (unit): increment KV; lượt 101 → 429; reject `recent` quá dài; inject system prompt kể cả client gửi rác.

**Success**

Trong screenshot cũ: `"i so tired"` và `"today i have to clean my house all day"` **không** còn cùng một câu. Check-in không nhân đôi. User không bao giờ thấy ô dán API key.

---

## 8. Privacy / cost

Transcript đi Google Gemini qua Worker. Không log full body lên Cloudflare trừ khi debug tạm. KV chỉ đếm số, không lưu chat.

Chi phí: Gemini Flash × ≤100 lượt × số máy cài app. Rate limit IP + quota id là lớp chống một client đốt bill. Không có MFA/cloud user thì không chặn được người tạo nhiều UUID — chấp nhận ở v1.
