# Yume — Home Screen Design Prompt (Full)

> Dùng file này làm brief đầy đủ khi design lại màn **Home** trên Figma / với designer / AI design.
> Ngày: 2026-08-21 · Canvas: cửa sổ desktop `main` · App: Yume

---

## 1. One-liner brief

Thiết kế lại màn **Home** của Yume — app desktop học tiếng Anh (TOEIC flashcard) kèm pet companion **Sora** — theo mood **bầu trời đêm / vũ trụ ấm**, pet là trung tâm cảm xúc, CTA học 5 phút là hành động chính, kèm 3 lối tắt và streak/account.

---

## 2. Product context

| Item | Value |
|------|--------|
| App name | **Yume** |
| Default pet name | **Sora** (user có thể đổi tên; design dùng “Sora” làm mẫu) |
| Platform | Windows + macOS desktop (Tauri 2), **không phải mobile** |
| Window | `main` — onboarding, home, settings, missions |
| Companion window | `popup` — floating pet (ngoài scope Home, nhưng Home mở study/float từ đây) |
| Domain | Flashcards, XP, mood, SRS, missions sống ở TypeScript; Home là hub điều hướng học |

**Tone:** ấm, nhẹ, companion-first, “học như chơi với pet” — không corporate LMS, không dashboard analytics dày.

---

## 3. Frame & technical constraints

| Constraint | Spec |
|------------|------|
| Frame size | **880 × 640 px** (khớp `tauri.conf.json` main window) |
| Orientation | Landscape desktop |
| Safe padding | ≥ 20–28 px mép trái/phải; ≥ 16–20 px mép trên/dưới |
| Grid | 8 pt |
| Clipping | Nội dung không bị cắt ở 880×640; không assume scroll dài |
| Density | Một composition rõ trong 1 viewport — không nhiều section marketing |

---

## 4. Typography

| Role | Family | Weight | Ghi chú |
|------|--------|--------|---------|
| Brand / titles / pet name | **Fraunces** | SemiBold (600–700) | Display, tracking hơi chặt |
| UI body / labels / hints | **Be Vietnam Pro** | Regular 400, Medium 500, SemiBold 600, Bold 700 | UI tiếng Việt |

**Cấm:** Inter, Roboto, Arial, system-ui làm font chính.

**Gợi ý scale (Home):**
- Brand “Yume”: ~22 px Fraunces
- Eyebrow: ~11 px Bold, uppercase + letter-spacing rộng
- Headline: ~24 px Fraunces
- Action label: ~13 px Bold
- Action hint: ~11 px Regular
- CTA: ~12 px Bold
- Whisper: ~11 px
- Streak / account: ~11 px Medium–SemiBold

---

## 5. Color & atmosphere (direction)

**Background:** full-bleed galaxy / night sky (ảnh hoặc gradient vũ trụ sâu). Không nền phẳng một màu.

**Palette gợi ý (từ Home hiện tại):**
- Deep night: `#0B0D24` / `#10122F` / `#090A22`
- Text primary (cream): `#FFF8EB` / amber-50
- Text muted (violet): `#C4B5FD` / `#DDD6FE`
- CTA gradient: violet → indigo (`#A78BFA` → `#6366F1`)
- Brand glow: amber / gold soft
- Glass chips: `white` @ ~10–15% + border white ~15%
- Pet orb: radial cream → gold → rose → soft purple
- Pet text on orb: `#523F67` / `#725B73`
- Action tones:
  - Tra từ: sky / blue
  - Nói với Sora: rose / fuchsia
  - Chuyện hôm nay: amber / orange

**Effects:** soft vignette, subtle glow quanh pet, shadow sâu nhẹ (`rgba(4,8,30,0.4+)`). Tránh neon glow dày, multi-layer shadow ồn.

**Contrast:** text trên nền tối đạt AA; hint có thể soft hơn nhưng vẫn đọc được.

---

## 6. Jobs to be done (Home)

1. Nhận diện brand **Yume** ngay viewport đầu
2. Cảm nhận pet **Sora** (tên + trạng thái nhẹ)
3. Bắt đầu học nhanh: **Bắt đầu 5 phút**
4. Chọn mode học: **Từ vựng** | **Giao tiếp**
5. Mở 3 lối tắt: Tra từ / Chat / Chuyện hôm nay
6. Xem streak + vào Account
7. Đọc “lời thì thầm” (quote) ở chân trang

---

## 7. Information architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│  [Logo] Yume              [🔥 streak chip] [Avatar + name]   │
├─────────────────────────────────────────────────────────────┤
│ Sky title                                                    │
│  EYEBROW                                                     │
│  Headline                                                    │
├─────────────────────────────────────────────────────────────┤
│ Main stage                                                   │
│                                                              │
│     [Action 1]        PET HUB         [Action 2]             │
│                      (avatar)                                │
│                      pet name                                │
│                      status                                  │
│                   [CTA Start]                                │
│              [Từ vựng | Giao tiếp]                           │
│                      [Action 3]                              │
│                                                              │
│  (Layout A/B/C có thể sắp xếp lại Action 1–3 — xem §10)      │
├─────────────────────────────────────────────────────────────┤
│ Whisper footer                                               │
│  Label · Quote — Author                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. UI copy (locked — Vietnamese)

Dùng đúng chuỗi sau (trừ khi PM đổi copy riêng):

| Key / Element | Copy |
|---------------|------|
| Brand | Yume |
| `homeSkyLabel` | Bầu trời đêm nay |
| `homeSkyTitle` | Mỗi hành tinh mở ra một điều thú vị. |
| `homeSkyMapLabel` | Bầu trời học tiếng Anh của Yume |
| `homePetDreaming` | đang mơ một điều hay |
| `homeStartStudy` | Bắt đầu 5 phút |
| Mode vocabulary | Từ vựng |
| Mode phrases | Giao tiếp |
| Quick lookup title | Tra từ nhanh |
| `homeLookupHint` | Khám phá một từ mới |
| Companion (home action) | Nói với Sora |
| `homeChatHint` | Luyện một cuộc hội thoại |
| `homeDailyStory` | Chuyện hôm nay |
| `homeDailyStoryHint` | 2 phút đọc song ngữ |
| Streak format | `{n} ngày cùng Sora` (vd: `3 ngày cùng Sora`) |
| Streak icon | 🔥 (optional, hiện đang dùng) |
| `homeWhisperLabel` | Lời thì thầm hôm nay |
| `homeWhisperQuote` | The future depends on what you do today. |
| `homeWhisperAuthor` | Mahatma Gandhi |
| Account | `displayName` hoặc `username` (vd mẫu: Quyen) |

**Headline variants (optional explore — không bắt buộc):**
- A (giữ metaphor): *Mỗi hành tinh mở ra một điều thú vị.*
- B (desk): *Học cùng Sora — rõ ràng, ấm áp.*
- C (dock): *Chọn một vì sao — bắt đầu nhẹ nhàng.*

---

## 9. Interaction / behavior (design đúng flow)

| Control | Behavior |
|---------|----------|
| Logo / brand | Brand presence (không bắt buộc link) |
| Streak chip | Informative; có thể mở account/missions sau — Home chỉ cần hiện |
| Avatar + name | → Account screen |
| Pet avatar | → Floating study / expand pet overlay |
| CTA **Bắt đầu 5 phút** | → Floating study (cùng intent với click pet) |
| Toggle **Từ vựng** | `contentType = vocabulary` |
| Toggle **Giao tiếp** | `contentType = phrase` |
| **Tra từ nhanh** | → Quick lookup |
| **Nói với Sora** | → Companion chat |
| **Chuyện hôm nay** | → story/phrase flow (`contentType` phrase) |
| Window close | Hide to tray (không quit) — không cần vẽ chrome OS |

**States cần design:**
- Default
- Mode: Từ vựng selected / Giao tiếp selected
- CTA hover / focus-visible
- Action (planet/tile) hover / focus-visible
- Account chip hover
- (Nice-to-have) Pet hover scale nhẹ

---

## 10. Layout directions (chọn 1 hoặc hybrid)

### Option A — Night Sky 2.0
- Giữ metaphor **bầu trời / quỹ đạo**
- Pet hub trung tâm
- 3 actions như “hành tinh”: trái (Tra từ), phải (Nói với Sora), dưới (Chuyện hôm nay)
- Orbit rings trang trí (thin, low opacity)
- CTA + mode toggle ngay dưới pet, trên action dưới

**Khi chọn A:** ưu tiên cảm xúc + brand vũ trụ; cần kiểm soát chồng lớp CTA vs action dưới.

### Option B — Desk Companion
- Bớt “game map”, dễ scan
- Soft glass panel giữa
- Pet + CTA + toggle xếp dọc trung tâm
- 3 actions = **hàng tile** phía dưới panel

**Khi chọn B:** ưu tiên clarity trên cửa sổ nhỏ 880×640.

### Option C — Constellation Dock
- Pet + CTA nửa trên
- 3 actions nằm trên **dock** kính/cong phía dưới
- Có thể có arc/dash orbit nối pet → dock

**Khi chọn C:** ưu tiên CTA rõ + actions luôn reachable ở mép dưới.

---

## 11. Component inventory (Figma)

Tạo / tái sử dụng:

1. **Header / Brand** — logo mark + “Yume”
2. **Streak chip** — fire + text
3. **Account chip** — avatar 24 + truncated name
4. **Sky title block** — eyebrow + headline
5. **Pet hub** — glow orb + face/avatar slot + name + status
6. **CTA Start** — icon play + “Bắt đầu 5 phút”
7. **Mode toggle** — 2 segments (selected / unselected)
8. **Action control** (Planet hoặc Tile) — icon + label + hint; 3 tonal variants
9. **Whisper footer** — label + quote + author
10. (Optional) Orbit ring / dock shell — decorative only

**Icons:** bộ 3 đồng bộ (lookup / chat / story). Prefer soft illustrative hoặc flat glow; không mix style lệch nhau. Pet face: dùng asset pet thật của app nếu có; placeholder chỉ tạm.

---

## 12. Visual do / don’t

**Do**
- Một composition, brand + pet hub làm neo
- Full-bleed sky atmosphere
- Fraunces + Be Vietnam Pro
- CTA rõ, actions secondary rõ hierarchy
- Glass chips nhẹ, glow pet có kiểm soát

**Don’t**
- Dashboard / stat strips / nhiều card hero
- Purple-on-white generic AI look
- Cream + terracotta “AI brochure” look
- Broadsheet / newspaper dense columns
- Overlay badge/sticker trên hero media
- Hardcode Inter; bỏ pet khỏi trung tâm
- Nhồi mission list / settings vào Home

---

## 13. Accessibility & usability

- Hit target actions ≥ ~44×44 px (orb ~88 px preferred)
- Focus ring rõ trên nền tối
- Không dựa màu đơn thuần để phân mode (selected = fill + contrast text)
- Truncate `displayName` hợp lý (~max 10–16 chars hiển thị)
- Whisper có thể rút gọn trên width hẹp nhưng đủ 1 dòng nếu được

---

## 14. Deliverables checklist

- [ ] Frame `Home / 880×640` — default
- [ ] Variant mode Từ vựng selected
- [ ] Variant mode Giao tiếp selected
- [ ] Hover states: CTA, Action ×3, Account
- [ ] Components local (đúng inventory §11)
- [ ] Annotation spacing / radius / color tokens (ngắn)
- [ ] (Optional) So sánh A / B / C cạnh nhau nếu chưa chốt hướng

---

## 15. Out of scope (không vẽ trên Home)

- Onboarding / login full flows
- Settings, learning program deep screens
- Quiz / flashcard face chi tiết
- Popup companion window chrome
- Tray menu
- XP/mood math visualization (trừ khi gắn nhẹ vào pet — không bắt buộc)

---

## 16. References

| Resource | Link / path |
|----------|-------------|
| Figma draft 3 options | https://www.figma.com/design/nktr6yq7R3DBrKWw3w71wq |
| Current Home source | `src/components/shared/home-screen.tsx` |
| UI copy source | `src/constants/ui.ts` |
| Fonts | `src/assets/fonts/` (Fraunces, Be Vietnam Pro) |
| Galaxy asset | `src/assets/home-galaxy.png` |
| Action icons | `src/assets/home-actions/` |
| Architecture | `docs/ARCHITECTURE.md` |
| Window size | `src-tauri/tauri.conf.json` → main `880×640` |

---

## 17. Short prompt (paste nhanh cho AI)

```
Design the Yume desktop Home screen at 880×640. Yume is a TOEIC flashcard
app with a Tamagotchi pet named Sora. Mood: warm night-sky / galaxy,
companion-first, not a dashboard. Fonts: Fraunces (titles) + Be Vietnam Pro (UI).
Vietnamese UI only.

Required: header (Yume logo, streak “3 ngày cùng Sora”, avatar+name);
eyebrow “Bầu trời đêm nay” + headline; central Pet hub (Sora, “đang mơ một điều hay”);
primary CTA “Bắt đầu 5 phút”; toggle “Từ vựng | Giao tiếp”; three secondary
actions — “Tra từ nhanh”, “Nói với Sora”, “Chuyện hôm nay” each with short hint;
footer whisper “Lời thì thầm hôm nay · The future depends on what you do today. — Mahatma Gandhi”.

Explore layout A (orbit planets), B (desk tiles), or C (bottom constellation dock).
Full-bleed galaxy background, soft glass chips, violet-indigo CTA, amber brand text.
No Inter, no dense cards, no marketing clutter.
```

---

## 18. Handoff note cho implement (sau khi design chốt)

- Logic domain giữ ở TypeScript (`src/features/`, `src/stores/`)
- Copy chỉ sửa qua `src/constants/ui.ts` (Vietnamese UI)
- Component Home: `src/components/shared/home-screen.tsx`
- Không nhúng SQL trong UI
- Verify bằng `pnpm test` nếu đổi behavior; visual có thể `pnpm tauri dev`

---

*End of prompt.*
