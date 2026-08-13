# Vocab Pet — UI/UX Design Spec

Date: 2026-08-13  
Product: Vocab Pet (repo `EnglishApp`)  
Status: Pet look locked (2026-08-13)  
Scope: Visual system + screen design for the existing MVP. Floating pet window added as a locked UX rule.

This spec is the source of truth for polishing UI. It does **not** change pet mechanics, SRS, missions, tray behavior, or installers. Those stay as locked in `docs/ARCHITECTURE.md` on `cursor/vocab-pet-scaffold-6115` (PR #2).

**Pet sample (locked):** [`docs/uiux-demo/index.html`](../../uiux-demo/index.html) — Mèo / Cáo / Rồng, trứng → non → trưởng thành, 4 tâm trạng. Pet **nổi trên desktop**, PNG trong suốt, **không hộp/nền** phía sau.  
**App screens (later):** [`docs/uiux-demo/app.html`](../../uiux-demo/app.html). Phone: [HTML preview](https://htmlpreview.github.io/?https://github.com/hoangquyen512/EnglishApp/blob/cursor/vocab-pet-uiux-design-9e4c/docs/uiux-demo/index.html).

---

## 1. Context

Vocab Pet is a **Windows + macOS tray app**: a hidden main window, a 400×500 always-on-top flashcard popup, and a Tamagotchi-style pet that grows when the user studies. The learner is Vietnamese; English is the study content.

MVP screens already exist and are functional, not designed:

| Surface | Job | Size / chrome |
| --- | --- | --- |
| **Floating pet** | Companion sits on the desktop | ~180×200, frameless, **transparent**, always-on-top, skip taskbar, no shadow plate |
| Onboarding | Choose Cat / Fox / Dragon | Main window 880×640 |
| Home (“Nhà của pet”) | Study mode, missions, interval | Main window 880×640 |
| Flashcard popup | Answer one 4-choice card, then next or close | 400×500, frameless, always-on-top, skip taskbar |
| System tray | Mở app / Học ngay / Thoát | Native OS menu |
| Notification | Nudge to study on scheduler tick | Native OS toast |

Current UI problems (from scaffold + UI/UX Pro Max audit):

- Orange flood (`#fff7ed` page + `#ea580c` buttons). White-on-`#ea580c` is **~3.6:1** — fails WCAG 2.2 AA for normal button labels.
- Emoji used as icons and as the pet. Platform-inconsistent, poor for screen readers.
- No focus rings, no `prefers-reduced-motion`, no empty/error/success choreography.
- Home is a settings form with a pet thumbnail, not a habitat.
- Popup copy mixes Vietnamese UI with an English **Submit** label (kept — it is in the original product prompt).

---

## 2. Users and design principles

**Primary user:** a Vietnamese adult at a Windows or macOS desk who wants a light daily English habit. They did not open a “study app”; the app interrupted them.

**One job per surface**

1. Popup — answer this card in under 15 seconds, then leave.
2. Home — check the companion, then start studying or adjust mode.
3. Onboarding — pick a companion once. Not a settings wizard.

**Principles (non-negotiable)**

1. **Low pressure.** The pet never dies. Hungry/sad copy is observational, never guilt (“Bạn đã bỏ rơi pet”).
2. **Study is feeding.** Correct answers are the celebration. Wrong answers are calm and reversible (next card), not a fail screen.
3. **Interrupt, then get out of the way.** The popup is a sticky note, not a dashboard. One primary action. Close is always visible.
4. **Companion, not gamification chrome.** XP, level, streak, and missions support the pet. They are not the hero.
4b. **Floating pet, no plate.** The live pet is a transparent desktop overlay. No cream well, no card, no mood chip stuck on the sprite. Mood is the face. Click pet → Học ngay.
5. **Vietnamese UI, English specimen.** Buttons, labels, errors, tray, notifications: Vietnamese. The word/phrase on the card is English and visually distinct.
6. **Accessibility is a constraint.** WCAG 2.2 AA. Keyboard-first on the popup. No information by color alone. No emoji-as-icon.

---

## 3. Three visual approaches

### A. Warm Companion (recommended)

A small creature living on a sunlit desk. Cream paper, warm stone, one terracotta accent. The English word sits like a specimen card. The pet has a habitat frame that can later hold real sprites.

- Fits the locked “gentle, no death” tone.
- Distinct from Duolingo green and generic indigo SaaS.
- Reuses the scaffold’s warm direction but stops the orange flood and fixes contrast.
- Works at 400×500 (popup) and 880×640 (home) without looking like a marketing page.

### B. Pixel Tamagotchi

8-bit habitat, chunky borders, game HUD. High nostalgia, strong “pet” read.

- Hard to do well with emoji placeholders; looks toy-like if sprites are not pixel-art.
- Dense HUD fights the 15-second popup job.
- Higher illustration cost before the product has real sprites.

### C. Calm Study Desk

Sage/slate, educational, quiet. Easy to implement.

- Reads as generic AI/SaaS. Easy to confuse with a notes app.
- Weak emotional hook for a companion product.

**Decision (locked 2026-08-13):** Approach A art (illustrated Mèo / Cáo / Rồng). The **on-screen pet is a floating transparent sprite**, not a habitat frame. Sprites: `docs/uiux-demo/pets/*.png` (alpha, no cream plate).

---

## 4. Information architecture

No new routes. Same two WebViews as today (`main` vs `popup`).

```
Tray
 ├─ Mở app ──────────► Main
 │                      ├─ (no pet) Onboarding → adopt → Home
 │                      └─ (has pet) Home
 │                           ├─ Study mode (vocab | phrase + topic)
 │                           ├─ Interval control
 │                           ├─ Học ngay ──► Popup
 │                           └─ Missions (read-only list)
 ├─ Học ngay ─────────► Popup (flashcard)
 └─ Thoát ────────────► Quit process

Scheduler tick ───────► Native notification + Popup
Close window ─────────► Hide (never quit)
Popup Đóng / ✕ ───────► Hide popup
```

**Not in this design:** settings page, stats/history, vocab CRUD, store, daily timetable UI, dark-mode toggle, rename-pet field. Schema already supports some of these; they wait for a later spec.

---

## 5. Design system

### 5.1 Type

Max two families. Both must cover Vietnamese diacritics.

| Role | Family | Weights | Why |
| --- | --- | --- | --- |
| UI (labels, buttons, missions, mood, pet name) | **Be Vietnam Pro** | 400, 600, 700 | Designed for Vietnamese; readable at 16px in a small popup |
| English specimen only (word / phrase on the card) | **Fraunces** | 600, 700 | Soft serif “specimen” — the thing you are learning, not chrome |

Bundle via `@fontsource/be-vietnam-pro` and `@fontsource/fraunces` (self-hosted). Do not call Google Fonts at runtime — this is an offline desktop app.

Fallback: `ui-sans-serif, system-ui, "Segoe UI", sans-serif` for UI; `Georgia, "Times New Roman", serif` for specimen.

**Scale (Major Third, 16px base — never below 16px for body)**

| Token | Size | Use |
| --- | --- | --- |
| `text-xs` | 12px | Metadata only (XP reward, “Cấp”). Not the only status signal. |
| `text-sm` | 14px | Secondary lines, mission progress |
| `text-base` | 16px | Body, button labels, choices |
| `text-lg` | 18px | Section titles |
| `text-xl` | 20px | Home pet name |
| `text-2xl` | 24px | Popup English word (single lemma) |
| `text-3xl` | 30px | Onboarding H1 |

Phrase prompts (full sentences) stay at `text-lg` / `text-xl` so they wrap inside 400px. Do not force phrases to the word size.

Line-height: 1.5 body, 1.2 headings. Letter-spacing: `-0.02em` on Fraunces headings; `+0.04em` on uppercase section eyebrows.

Numbers (XP, streak, interval): `font-variant-numeric: tabular-nums`.

### 5.2 Color

Neutrals carry ~90% of the UI. One accent. Semantic feedback colors are never the only signal.

Primitives (warm stone, not pure gray):

| Token | Value | Role |
| --- | --- | --- |
| `--stone-25` | `#faf6f1` | Page background (cream, not orange-50 flood) |
| `--stone-50` | `#f4eee6` | Recessed wells, XP track track |
| `--stone-100` | `#e8dfd4` | Borders, dividers |
| `--stone-500` | `#6f6258` | Muted text (must stay ≥4.5:1 on `--stone-25`) |
| `--stone-800` | `#3d322b` | Secondary ink |
| `--stone-950` | `#1f1915` | Primary text |
| `--terracotta-700` | `#c2410c` | **Primary fill** (white label, AA) |
| `--terracotta-800` | `#9a3412` | Primary hover |
| `--terracotta-500` | `#ea580c` | Decorative only (large type, habitat glow). Never button text fill. |
| `--leaf-700` | `#3f6212` | Success text/icon |
| `--leaf-50` | `#f7fee7` | Success well |
| `--rose-700` | `#be123c` | Error / incorrect text/icon |
| `--rose-50` | `#fff1f2` | Incorrect well |
| `--focus` | `#1d4ed8` | Focus ring (3:1+ vs cream; not the brand orange) |

Semantic aliases:

```
--color-bg:            var(--stone-25)
--color-surface:       #ffffff
--color-fg:            var(--stone-950)
--color-fg-muted:      var(--stone-500)
--color-border:        var(--stone-100)
--color-primary:       var(--terracotta-700)
--color-primary-hover: var(--terracotta-800)
--color-primary-fg:    #ffffff
--color-focus-ring:    var(--focus)
--color-success:       var(--leaf-700)
--color-danger:        var(--rose-700)
```

**Contrast locks**

- White on `--terracotta-700`: use for every primary button label.
- Muted text `--stone-500` on `--stone-25` must be verified ≥4.5:1; if it fails, darken to `#5c524a`.
- Mood is **icon + Vietnamese label**, never a color dot alone.
- Correct / incorrect: well color + icon + text (“Đúng rồi!” / “Chưa đúng”).

Dark mode is **out of scope** for this polish. Tokens are semantic so a later theme can map without rewriting components.

### 5.3 Space, radius, elevation

Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48`.

| Token | Value |
| --- | --- |
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 20px |
| `--radius-full` | 9999px |
| `--shadow-sm` | `0 1px 2px rgb(31 25 21 / 0.06)` |
| `--shadow-md` | `0 8px 24px rgb(31 25 21 / 0.08)` |

Popup: `--shadow-md` only (it floats over the desktop). Home cards: 1px `--color-border`, no stacked shadows.

### 5.4 Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-fast` | 120ms | Hover, press |
| `--dur-base` | 180ms | Choice select, XP bar fill |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | All UI |

Animate only `transform` and `opacity`. Pet idle bob: 2.4s ease-in-out, ±4px, **off** when `prefers-reduced-motion: reduce`. Level-up: 180ms scale 1 → 1.04 → 1, no confetti, no full-screen takeover.

### 5.5 Icons

**Lucide** at 20px, stroke 1.75. Decorative icons: `aria-hidden="true"`. Icon-only controls: `aria-label` in Vietnamese.

Do not ship emoji as UI icons (close, check, mission checkbox, mood). Emoji may remain as **temporary pet sprites** inside the habitat until real `sprite_key` art exists. When used, the habitat has a text name + mood label so the emoji is decorative (`aria-hidden`).

### 5.6 Components (anatomy)

**PrimaryButton** — one per view. Fill `--color-primary`, label `--color-primary-fg`, height 40px, radius `--radius-md`, min width 44px. States: hover darken, active scale 0.98, focus-visible 2px `--color-focus-ring` offset 2px, disabled 40% opacity + `aria-disabled` and a nearby reason.

**GhostButton** — transparent, 1px `--color-border`, used for unselected study-mode chips.

**ChoiceButton** (popup) — full-width, min height 44px, left-aligned text, 16px. States:

| State | Visual |
| --- | --- |
| Default | White, border stone-100 |
| Hover | Border stone-800 |
| Selected (before submit) | 2px terracotta-700 + check icon |
| Correct (after submit) | Leaf well + check icon + “Đúng” is already in the banner |
| Incorrect selected | Rose well + x icon |
| Other choices after submit | Dimmed, not clickable |

**Panel** — white surface, radius `--radius-lg`, padding 16–24, 1px border. Home uses two panels (habitat | actions), not a dashboard of five cards.

**ProgressBar** — 8px track `--stone-50`, fill terracotta-700, `role="progressbar"` with `aria-valuenow` = XP in this level, `aria-valuemax` = 50, `aria-label` “Kinh nghiệm tới cấp tiếp theo”.

**MissionRow** — checkbox icon (not emoji), title, `current/target`, `+N XP`. Completed: checkbox filled + strikethrough title + `aria-label` “Hoàn thành”.

**FloatingPet** — transparent PNG only. No well, no card, no chip overlay. ~180px wide on the desktop window; ~56px if a tiny witness is needed inside the flashcard popup (still no plate). `aria-label` = `{tên} · {tâm trạng}`. Click / Enter opens the study popup.

**Toast / live region** (in-window, not OS): `role="status"` `aria-live="polite"` for “+5 XP”, “Lên cấp 3”, “Hoàn thành nhiệm vụ”. No auto-dismiss under 5s; these can sit in the feedback banner of the popup instead of a floating toast.

---

## 6. Screen designs

### 6.1 Onboarding — “Chọn người bạn đồng hành”

**Job:** pick one species. Nothing else.

**Hierarchy:** title → three equal cards → one CTA per card.

```
┌─────────────────────────────────────────────────────────────┐
│  Chọn người bạn đồng hành                                   │
│  Pet lớn lên mỗi khi bạn trả lời đúng.                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ habitat  │  │ habitat  │  │ habitat  │                   │
│  │  (egg)   │  │  (egg)   │  │  (egg)   │                   │
│  │ Mèo      │  │ Cáo      │  │ Rồng     │                   │
│  │ 2-line   │  │ 2-line   │  │ 2-line   │                   │
│  │ [Chọn]   │  │ [Chọn]   │  │ [Chọn]   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

- Window is 880×640: three columns with 24px gap, cards stretch equally.
- If the window is narrowed (user resize later), stack to one column; cards stay ≥44px CTA.
- Selecting a card is the only action. No “next” wizard step, no name field (schema default / species name is enough for MVP).
- Focus order: title (not focusable) → Chọn pet này (Mèo) → Cáo → Rồng.
- After choose: brief 180ms habitat pulse, then Home. No extra confirmation modal.

Copy:

- Title: `Chọn người bạn đồng hành`
- Subtitle: `Pet lớn lên mỗi khi bạn trả lời đúng.`
- CTA: `Chọn pet này`

### 6.2 Home — “Nhà của pet”

**Job:** pick study mode and start a session. The live pet is already floating on the desktop — Home is the control panel, not a second habitat.

**Layout (880×640, two columns, 24px padding, 16px gap)**

```
┌────────────────────┬────────────────────────────────────────┐
│ STATS (no plate)   │ HỌC                                    │
│  transparent pet   │ Chế độ học                             │
│  Mèo · Vui         │ [Từ vựng]  [Câu giao tiếp]             │
│  Cấp 2   Streak 3  │ [Học ngay]                             │
│  ████░░░░ 20/50 XP │ NHIỆM VỤ HÔM NAY …                     │
│                    │ Nhắc học mỗi [ 2 ] phút                │
└────────────────────┴────────────────────────────────────────┘
```

**Left column (~240px):** transparent pet PNG (no well) + name + mood text + Cấp / Streak + XP bar. Study controls stay on the right.

**Right column:**

1. Eyebrow `Chế độ học` + segmented control (vocab / phrases).
2. Topic chips only when phrases is selected. Include `Tất cả chủ đề` (already in scaffold).
3. **Học ngay** — the only primary button on the screen.
4. Missions list (read-only).
5. Interval — last, visually quiet. Label `Nhắc học mỗi (phút)` (clearer than “Popup mỗi”). Number input 1–180, persistent label, not a placeholder.

**Hungry / sad treatment:** use the matching transparent mood sprite (desktop + Home). One line under the name: `Pet đang đói — một thẻ là đủ để pet vui lại.` Never “bạn đã quên học”.

**Empty missions:** should not happen (3 generated daily). If the list is empty while loading, show three skeleton rows, not “No data”.

**Error (SQLite):** replace the page with a single panel: title `Không kết nối được dữ liệu`, body explaining `Hãy mở app bằng pnpm tauri dev.`, no fake pet.

### 6.3 Flashcard popup — the product

**Job:** show one prompt, collect one answer, give one beat of feedback, offer next or close.

**Chrome:** frameless. Draw our own header: drag region (`data-tauri-drag-region`) + title `Học ngay` + one icon-only close control (Lucide `x`, 40×40 hit area, `aria-label="Đóng cửa sổ học"`, `title="Đóng"`). Close is always available, including after submit. Do not add a second text “Đóng” button in the header.

```
┌─────────────────────────────────────┐
│ ⋮⋮  Học ngay                    [✕] │  ← drag + close
│                                     │
│  [pet 56]  Mèo · Vui                │
│                                     │
│  time                               │  ← Fraunces, English
│  Take your time.                    │  ← example, optional
│                                     │
│  ┌─────────────────────────────┐    │
│  │ thời gian                   │    │
│  └─────────────────────────────�│                                     │
│  ┌─────────────────────────────┐    │
│  │ thời gian                   │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ người                       │    │
│  └─────────────────────────────┘    │
│  … two more …                       │
│                                     │
│  [ Submit ]                         │
│  Hãy chọn một đáp án.               │  ← only if submit with none
└─────────────────────────────────────┘
```

**After submit (correct)**

```
│  Banner: ✓ Đúng rồi!  Pet vui lên · +5 XP   │
│  Choices lock. Correct row in leaf well.    │
│  [ Thẻ tiếp theo ]                          │
```

**After submit (incorrect)**

```
│  Banner: ✕ Chưa đúng                        │
│  Your pick in rose well; correct row in     │
│  leaf well (teach, don’t hide the answer).  │
│  [ Thẻ tiếp theo ]                          │
```

Rules:

- Prompt is the hero. Pet is a 56px witness, not a second dashboard.
- Example sentence is muted, one line, truncated with title tooltip if needed.
- Four choices always. Keyboard: `1`–`4` select, `Enter` submit or “Thẻ tiếp theo”, `Esc` close.
- `Submit` stays English (product prompt §6.6). All other chrome is Vietnamese.
- If `leveledUp`: banner adds `Lên cấp {n}`. If a mission completed: second polite line `Hoàn thành nhiệm vụ`. Still no modal.
- `noCard`: illustration-free empty state — `Chưa có thẻ nào phù hợp.` + `Đóng`. Do not keep a disabled Submit.
- Loading: skeleton for prompt + four choice bars (layout stable).

### 6.4 Tray and native notification

Tray labels stay exactly: **Mở app / Học ngay / Thoát**.

Notification (scheduler tick):

- Title: `Vocab Pet`
- Body: `Một thẻ nhỏ cho {petName}?` (fallback `pet` if unnamed)
- Action is opening the popup (already the tick behavior). No “you failed your streak” copy.

### 6.5 States matrix

Every designed surface must ship these four:

| Surface | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Onboarding | 3 skeleton cards | (species always seeded) | DB panel | Adopt → Home |
| Home | Habitat + mission skeletons | — | DB panel | Missions fill; XP bar animates |
| Popup | Skeleton card | `Chưa có thẻ nào phù hợp` | Inline `Không tải được thẻ` + Đóng | Banner + next |

---

## 7. Copy deck (Vietnamese)

Keep strings in `src/constants/ui.ts` (i18n-ready). Do not invent playful English marketing.

| Key | Copy |
| --- | --- |
| `onboardingTitle` | Chọn người bạn đồng hành |
| `onboardingSubtitle` | Pet lớn lên mỗi khi bạn trả lời đúng. |
| `choosePet` | Chọn pet này |
| `homeTitle` | Nhà của pet |
| `studyModeTitle` | Chế độ học |
| `vocabulary` | Từ vựng |
| `phrases` | Câu giao tiếp |
| `pickTopic` | Chủ đề |
| `allTopics` | Tất cả chủ đề |
| `studyNow` | Học ngay |
| `submit` | Submit |
| `nextCard` | Thẻ tiếp theo |
| `close` | Đóng |
| `correct` | Đúng rồi! |
| `incorrect` | Chưa đúng |
| `xpGained` | Pet vui lên · +{n} XP |
| `levelUp` | Lên cấp {n} |
| `missionComplete` | Hoàn thành nhiệm vụ |
| `needChoice` | Hãy chọn một đáp án. |
| `noCard` | Chưa có thẻ nào phù hợp. |
| `schedulerLabel` | Nhắc học mỗi (phút) |
| `hungryHint` | Pet đang đói — một thẻ là đủ để pet vui lại. |
| `sadHint` | Pet hơi buồn. Học một thẻ nhé. |
| `popupTitle` | Học ngay |
| `dbUnavailable` | Không kết nối được dữ liệu. Hãy mở app bằng pnpm tauri dev. |

Mood labels stay: Vui / Bình thường / Buồn / Đói.  
Topics stay: Du lịch / Ẩm thực / Công việc / Gia đình.

---

## 8. Accessibility

Target: **WCAG 2.2 AA**.

- `lang="vi"` on `html`. English prompt wrapped in `<span lang="en">`.
- One `h1` per window: onboarding title, `Nhà của pet`, popup `Học ngay` (or the English word as `h1` and the header as a banner — prefer header as `h1` so the window name is announced first, prompt as `h2`).
- Skip link not required inside a 400×500 popup; on Home, first focusable is “Từ vựng” or “Học ngay” — keep a logical order: habitat is not a tab stop except if we add a later “pet details” control.
- Target size ≥24×24 (AA); aim 40–44px for Submit, choices, close, Học ngay.
- Focus-visible ring on every control. Never `outline: none` without a replacement.
- Popup close and Home interval use real `<button>` / `<label for>`.
- `prefers-reduced-motion` kills pet bob and XP animation duration.
- Forced-colors: buttons use borders (`currentColor`), not background-only shapes.
- Color is never the only status: selected choice has a check icon; mood has a label; missions have a checkbox.

Keyboard map (popup):

| Key | Action |
| --- | --- |
| `1` `2` `3` `4` | Select choice |
| `Enter` | Submit if selected; else Next after result |
| `Esc` | Hide popup |
| `Tab` | Close → choices → Submit / Next |

---

## 9. What changes in the scaffold (mapping)

Implement against PR #2 (`vocab-pet-app` at repo root on that branch). This spec does not move files.

| File / area | Change |
| --- | --- |
| `src/index.css` | Semantic tokens; cream bg; Fraunces + Be Vietnam Pro; reduced-motion; focus-visible |
| `src/constants/ui.ts` | Copy deck above (`schedulerLabel`, hints, `levelUp`) |
| `src/components/shared/primary-button.tsx` | Terracotta-700, 40px, focus ring, variants |
| `src/components/shared/panel.tsx` | Border + radius tokens, no orange ring |
| `src/components/shared/onboarding-screen.tsx` | Habitat cards, equal columns, no orange-50 flood |
| `src/components/shared/home-screen.tsx` | Habitat-left / study-right; primary = Học ngay; quiet interval |
| `src/components/popup/flashcard-popup.tsx` | Header drag+close; specimen type; banner states; keyboard 1–4 |
| `src/components/popup/choice-button.tsx` | Selected / correct / incorrect states with icons |
| `src/components/pet/pet-avatar.tsx` | Transparent PNG only; no habitat well; click → study |
| `src-tauri/tauri.conf.json` | New `pet` window: transparent, frameless, alwaysOnTop, skipTaskbar |
| `src/components/pet/pet-status.tsx` | Drop 3-up orange tiles; Cấp + Streak + labeled XP bar |
| Tray / notification strings | Notification body as in §6.4; tray unchanged |

**Do not:** turn Home into a marketing landing, add a sidebar nav, add dark-mode toggle, replace tray UX, or change XP/mood/mission numbers.

---

## 10. Out of scope

- Real sprite sheets / evolution animation beyond the 180ms pulse
- Daily timetable UI (scheduler stays interval-on-home)
- Vocabulary/phrase manager
- Progress charts from `study_sessions`
- Multi-user, accounts, cloud sync
- Linux shipping
- Dark mode theme
- Renaming the pet
- Fourth evolution stage
- Full NGSL / Tatoeba import UI

---

## 11. Implementation notes for the next agent

1. Load **frontend-design**, then **ui-ux-pro-max**. Keep the product a tray + popup + pet.
2. Tokens first (`index.css` + Tailwind theme), then buttons, then popup (highest-frequency UI), then home, then onboarding.
3. Verify contrast of `--stone-500` on `--stone-25` and white on `--terracotta-700` before merging.
4. Manual keyboard pass on the popup: 1–4, Enter, Esc, Tab, focus ring visible.
5. `pnpm test` must still pass; this polish is visual/copy/a11y, not domain logic.
6. Do not add new windows or routes.

---

## 12. Success criteria

The polish is done when:

1. A new user can adopt a pet and answer a card without reading a tutorial.
2. The popup is completable in one glance: prompt → 4 choices → Submit → Next/Đóng.
3. Home reads as a habitat, not a settings form. **Học ngay** is the only primary button.
4. Primary buttons pass WCAG AA (white on `#c2410c`).
5. Mood, correctness, and mission completion are each icon + text.
6. Keyboard-only users can finish a card and dismiss the popup.
7. Hungry/sad copy never blames the user.
8. No landing-page hero, no purple gradient, no emoji-as-icon in chrome.
