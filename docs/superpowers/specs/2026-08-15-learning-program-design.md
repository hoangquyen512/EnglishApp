# Yume — Chương trình học (Learning Program) Design

Date: 2026-08-15  
Product: Yume (desktop TOEIC flashcards + pet)  
Status: Approved for implementation  
Scope: Nguồn chủ đề **duy nhất** trong Account; gỡ mọi picker chủ đề cục bộ; lọc flashcard / hội thoại / `topic_practice` theo chương trình của user.

---

## 1. Context

Hiện app có **hai hệ chủ đề tách nhau**:

- Cụm từ: 4 code cứng `travel | food | office | family` + picker trên Home.
- Hội thoại: 12 bank JSON (`greetings`, `cafe`, …) + picker riêng trên Home.
- Từ vựng TOEIC (~1000): không có topic.

`accounts` + `user_id` đã có trên pet / missions / progress.

### 1.1 Quyết định đã chốt

| Quyết định | Lựa chọn |
| --- | --- |
| Nguồn chủ đề | Catalog 18 `topics` + `learning_program` / user |
| Bank hội thoại | Giữ 12 JSON; map qua `topic_conversation_banks` |
| Gán topic từ vựng | Hybrid: heuristic **chỉ** 4 chủ đề mặc định |
| Mode học Home | Giữ Từ vựng / Cụm từ / Hội thoại |
| `content_type_preference` | Mặc định cho nhiệm vụ + lần đầu; không khóa mode Home |
| Scope chương trình | **Theo từng account** (`user_id UNIQUE`) |

### 1.2 Goal / non-goal

**Goal**

1. Một màn **Chương trình học** trong Account: tên, level, content-type preference, bật/tắt 18 chủ đề (min 1), lưu DB.
2. Home / hội thoại: chỉ hiện chủ đề active (read-only) + link sửa — **không** chọn topic lẻ.
3. `getStudyDeck(contentType)` lọc theo chương trình user; không nhận param topic từ UI.
4. `topic_practice` random trong active topics; đếm theo `topic_id` cho mọi content type.

**Non-goal**

- Gán tay / heuristic đủ 18 chủ đề cho 1000 từ.
- Import 12×1000 bank vào bảng `phrases`.
- Đổi companion chat.
- Redesign brand / pet desk ngoài chỗ gắn entry Chương trình học.

---

## 2. Schema

### 2.1 Bảng mới

```sql
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL, -- daily_life | work_study | social | finance
  icon_key TEXT
);

CREATE TABLE learning_program (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  program_name TEXT DEFAULT 'Chương trình học của tôi',
  level_preference TEXT DEFAULT 'A2', -- A1 | A2 | B1 | B2
  content_type_preference TEXT DEFAULT 'both', -- vocabulary | phrase | both
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_program_topics (
  program_id INTEGER NOT NULL REFERENCES learning_program(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  PRIMARY KEY (program_id, topic_id)
);

CREATE TABLE topic_conversation_banks (
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  bank_id TEXT NOT NULL,
  PRIMARY KEY (topic_id, bank_id)
);
```

### 2.2 Alter

- `vocabulary.topic_id INTEGER REFERENCES topics(id)`
- `phrases.topic_id INTEGER REFERENCES topics(id)` — backfill từ `topic` text; cột text giữ, **ngừng dùng** trong query mới
- `daily_missions.topic_id INTEGER REFERENCES topics(id)` — backfill nếu map được; cột text giữ

### 2.3 Seed topics (18)

| category | codes |
| --- | --- |
| `daily_life` | family, food_dining, shopping, health, weather, housing, transportation |
| `work_study` | office_work, meetings_presentations, business_email, job_interview, education |
| `social` | travel, hobbies_entertainment, sports, technology_social_media, small_talk_greetings |
| `finance` | banking_finance |

Mặc định active: `family`, `food_dining`, `office_work`, `travel`.

### 2.4 Conversation bank mapping

| Catalog topic | Banks |
| --- | --- |
| food_dining | cafe, restaurant |
| travel | airport, hotel |
| family | family |
| shopping | shopping |
| health | health, emergency |
| transportation | directions |
| office_work | work |
| small_talk_greetings | greetings |
| technology_social_media | phone |
| (còn lại) | (không bank) |

### 2.5 Phrase / vocab seed rules

- Phrase: `travel`→travel, `food`→food_dining, `office`→office_work, `family`→family.
- Vocab: heuristic keyword trên word/meaning/example **chỉ** 4 code mặc định; không khớp → `topic_id` NULL → **không** vào deck đã lọc.
- Account mới / user chưa có hàng: `ensureLearningProgram()` seed 4 topic mặc định.

Migrations: một statement / file (sqlx), bắt đầu từ version **041**.

---

## 3. UI

### 3.1 Entry

- Account: nút **Chương trình học**
- Home (vùng mode học): chip active read-only + **Chỉnh sửa chương trình học**
- App view mới: `learning-program`

### 3.2 LearningProgramScreen

- Tên chương trình (editable)
- Dropdown level A1–B2
- Segmented content_type: Từ vựng / Cụm từ / Cả hai
- 18 chủ đề theo 4 nhóm; chip toggle; không tắt chủ đề cuối
- Lưu → `learning_program` + `learning_program_topics`
- Cảnh báo nếu tổng item (vocab gán được + phrase + câu bank map) của selection **&lt; 15** — không chặn lưu

Aesthetic: khớp Account/Home hiện tại (stone/cream, Be Vietnam Pro, terracotta accent) — không invent design system mới.

### 3.3 Home changes

- **Gỡ** picker 12 bank hội thoại và picker 4 topic cụm từ (+ “Tất cả”)
- **Giữ** 3 nút content type
- Hội thoại: deck = union bank map từ active topics, shuffle
- Cụm từ / từ vựng: union theo active `topic_id`

---

## 4. Data flow

### 4.1 Module

`src/features/learning-program/` — catalog, mapping, heuristic, level compare, validate (≥1 topic), service (`ensure` / `load` / `save` / `countContent` / `activeBanks`).  
`src/db/learning-program.ts` — SQL.  
Browser: catalog TS + persist chương trình theo user (localStorage), cùng rule lọc.

### 4.2 Study

```ts
getStudyDeck(contentType: ContentType): Promise<StudyFlashcard[]>
```

- Vocab: `topic_id IN active` (NULL excluded); vẫn ưu tiên due/new.
- Phrase: `topic_id IN active` và CEFR **≤** `level_preference`.
- Conversation: gộp bank từ mapping; bank thiếu JSON → skip.

Study store: **xóa** `topic` / `conversationTopic`. Chỉ `contentType`. Seed lần đầu từ preference (`both` → `vocabulary`). Đổi preference không đổi mode Home đang mở.

### 4.3 Missions

- `pickRandomTopic` chỉ trong active topics của user.
- `topic_practice` +1 khi item (vocab / phrase / conversation) có `topic_id` trùng mission.
- `progress_by_topic` key = `topics.code`.

### 4.4 Types

- Thay `PhraseTopic` bằng `TopicCode` (string union 18 code) hoặc `string` lấy từ catalog.
- `StudyFlashcard.topic` / `DailyMission.topic` → topic code hoặc null; mission DB dùng `topic_id`.

---

## 5. Errors & edges

- Save 0 topic → reject (UI + service).
- Chưa có program → auto-create + 4 mặc định.
- Topic không có nội dung → cảnh báo &lt;15; deck có thể trống → `UI.noCard`.
- Delete account → CASCADE program.
- Enum lạ → UI chỉ cho giá trị hợp lệ.

---

## 6. Test plan

1. Đổi chủ đề trong Chương trình học → deck vocab + conversation cùng đổi; không còn UI/API chọn topic lẻ.
2. Không tắt được topic cuối; save 0 topic fail.
3. `topic_practice` random trong active; chỉ item đúng topic mới tính.
4. Hai account không share program.
5. Seed 18 topics, 4 active; phrase map food/office đúng.
6. Heuristic: mỗi trong 4 mặc định có ≥1 từ; NULL không vào deck lọc.

---

## 7. Files (expected)

| Area | Paths |
| --- | --- |
| Spec | `docs/superpowers/specs/2026-08-15-learning-program-design.md` |
| Feature | `src/features/learning-program/*` |
| DB | `src/db/learning-program.ts`, `vocabulary.ts`, `phrases.ts`, `missions.ts` |
| Migrations | `src-tauri/migrations/041_*.sql` … + register in `lib.rs` |
| UI | `learning-program-screen.tsx`, `account-screen.tsx`, `home-screen.tsx`, `App.tsx` |
| Study | `features/vocabulary/index.ts`, `use-flashcard-player.ts`, `study-store.ts`, `types/index.ts` |
| Missions | `constants/missions.ts`, `features/pet-state/missions.ts` |
