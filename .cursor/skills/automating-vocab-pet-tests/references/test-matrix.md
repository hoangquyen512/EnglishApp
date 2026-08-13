# Vocab Pet — ma trận kiểm thử

Nguồn: `docs/ARCHITECTURE.md` (scaffold) + UI/UX Warm Companion. Cập nhật hàng khi thêm feature.

## P0 — chặn merge nếu đỏ

| ID | Hành vi | Tầng | Target | Oracle |
| --- | --- | --- | --- | --- |
| P0-01 | Đúng → +5 XP, overflow level | unit | `applyXpGain` | `{ level, xp, leveledUp }` literal |
| P0-02 | Sai → interval 0; 5 đúng → `mastered` | unit | `applyReview` / `nextIntervalDays` | `1/1/3/7/14`, status |
| P0-03 | 4 choices: có đáp án đúng, unique | unit | `buildChoices` | length 4, chứa correct, `Set` size = length |
| P0-04 | Mood idle 0/1/2/3+ ngày | unit | `moodFromLastFed` | happy→neutral→sad→hungry; không `dead` |
| P0-05 | Streak +1 nếu học hôm qua; gap → 1 | unit | `nextStreakOnStudy` | input ngày ISO cố định |
| P0-06 | Mission 3 loại đếm độc lập | unit | `missionCountsToward` | true/false theo event |
| P0-07 | Interval phút → ms; `<=0` → 120000 | unit | `intervalMsFromMinutes` | |
| P0-08 | Installer per-user | unit file | `src/config/deployment.test.ts` | nsis+app+dmg, không msi/pkg/all, `currentUser` |
| P0-09 | Đúng/sai không crash `submitAnswer` | unit + mock db | `submitAnswer` | `isCorrect`; XP chỉ khi đúng |

Đã có phần lớn P0-01…P0-08 trên branch scaffold. Bổ sung edge (double level-up, pool < 4, `lastFedAt` null) trước khi mở tầng khác.

## P1 — trước khi coi feature "xong"

| ID | Hành vi | Tầng | Ghi chú |
| --- | --- | --- | --- |
| P1-01 | Onboarding chọn species → Home | component | mock `chooseSpecies`; `vp-onboarding-choose` |
| P1-02 | Home: vocab / phrase + topic | component | `contentType` + `topic` callback |
| P1-03 | Popup: chọn → Submit → Đúng rồi / Chưa đúng | component | mock `submitAnswer`; không assert class màu |
| P1-04 | Popup keyboard 1–4, Enter, Esc | component | theo spec UI/UX |
| P1-05 | `getNextCard` vocab vs phrase+topic | unit + mock db | prompt = word / phraseEn |
| P1-06 | Evolution stage theo level 1 / 3 / 6 | unit + mock db | `applyXpAndRefresh` |
| P1-07 | `learn_new` chỉ khi chưa có session | unit + mock | `isNew` từ `getSessionStats` |
| P1-08 | Phrase không ghi `learning_progress` | unit + mock | `upsertLearningProgress` không gọi |

## P2 — smoke / tay / sau khi có máy Windows+macOS

| ID | Hành vi | Cách |
| --- | --- | --- |
| P2-01 | Tray Mở app / Học ngay / Thoát | checklist desktop |
| P2-02 | Đóng cửa sổ = hide, không quit | checklist; debug build hiện main |
| P2-03 | Scheduler tick → notify + show popup | mock `notifyStudyTime` / `showPopupWindow` ở unit; native = tay |
| P2-04 | `vocab_pet.db` + `settings.json` user-scoped | checklist ARCHITECTURE § Manual install |
| P2-05 | NSIS không UAC; DMG kéo ra Desktop | tay, user thường |
| P2-06 | Contrast / focus-visible / reduced-motion | checklist UI/UX, không screenshot CI |
| P2-07 | Demo `docs/uiux-demo/` | không thay test sản phẩm; chỉ review visual |

## Không automate

- Click menu tray OS, toast Windows/macOS
- Pixel emoji sprite / font hinting
- Copy tiếng Việt (sẽ đổi theo spec UI/UX) — dùng `data-testid`
- SQL migration từng dòng (trừ khi đổi schema — khi đó thêm fixture in-memory, không phải default)

## Thứ tự bổ sung coverage

1. Edge P0 còn thiếu trong 4 file `*.test.ts` hiện có
2. Mock-db cho `submitAnswer` / `getNextCard` (P0-09, P1-05…P1-08)
3. Testing Library cho 3 surface: Onboarding, Home, FlashcardPopup
4. Playwright 1 happy path (onboard → study) chỉ khi Vite chạy độc lập với mock Tauri
5. Desktop driver — chỉ khi P0–P1 xanh và có lý do bug native
