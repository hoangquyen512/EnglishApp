# Yume — Floating Pet Companion Design

Date: 2026-08-15  
Product: Yume (desktop TOEIC flashcards + pet)  
Status: Ready for review  
Scope: Đổi trải nghiệm mặc định sang **pet nhỏ nổi trên màn hình**; click pet để bung **card học từ vựng bên trái**. Main desk chỉ mở từ tray “Mở app”.

Spec này **không** redesign bàn pet chính, không đổi SRS/missions, không đổi brand/icon pack ngoài những gì cần cho cửa sổ trong suốt.

---

## 1. Context

Yume (Tauri 2) đã có:

- **main** — bàn pet đầy đủ (status, preview thẻ, mode học, scheduler, missions, account).
- **popup** — cửa sổ always-on-top “Học ngay” (~420×680), frameless, hiện flashcard đầy đủ.

Hiện launch (debug) và nhiều luồng mở **main** trước; popup là cửa sổ học đứng riêng với chrome app truyền thống (header + card dọc), chưa cảm giác mascot nổi.

### 1.1 Quyết định đã chốt

| Quyết định | Lựa chọn |
| --- | --- |
| Surface mặc định | Popup companion; main chỉ từ tray “Mở app” |
| Card mặc định | Collapsed chỉ pet; click pet để mở/đóng card |
| Look | Collapsed: cửa sổ trong suốt chỉ avatar; Expanded: panel cream (card trái · pet phải) |
| Khi thu gọn | Đứng yên — không đổi thẻ, không TTS |
| Kiến trúc | **Một** cửa sổ popup, resize động (không tách 2 window) |

### 1.2 Goal / non-goal

**Goal**

1. Release launch → hiện pet nổi collapsed (always-on-top).
2. Click pet → expand sang trái với card học; click lại → collapse, pet không nhảy vị trí trên màn.
3. Expanded: timer 30s + auto-speak + Đã nhớ / Chưa nhớ như popup hiện tại.
4. Main desk giữ nguyên vai trò cấu hình / missions / onboarding / account.

**Non-goal**

- Hover-to-expand, auto-expand khi scheduler tick.
- Click-through desktop (pet không bắt chuột) — ngoài scope.
- Redesign HomeScreen layout.
- Web demo GitHub Pages bắt buộc có transparent OS-level (browser preview mô phỏng bằng CSS).

---

## 2. Architecture

### 2.1 Windows

| Window | Vai trò |
| --- | --- |
| `popup` | Companion mặc định: transparent, decorations false, alwaysOnTop, skipTaskbar |
| `main` | Desk đầy đủ: auth, onboard, settings, missions, preview |

**Popup sizes (logical px, có thể tinh chỉnh lúc implement):**

- Collapsed: ~120×120
- Expanded: ~420×560 (card + pet hàng ngang)

**Anchor rule:** khi đổi size, giữ **cạnh phải** của cửa sổ cố định trên màn hình (pet nằm sát cạnh phải khi expanded) để pet trông như đứng yên và card “trượt ra” bên trái. Tọa độ `y` không đổi.

### 2.2 Launch & tray

| Sự kiện | Hành vi |
| --- | --- |
| App start (release) | `show_popup_window` ở kích thước collapsed |
| App start (debug) | Có thể vẫn `show_main_window` để tiện dev; không chặn ship |
| Tray “Học ngay” | Show/focus popup (giữ collapsed nếu đang collapsed) |
| Tray “Mở app” | Show/focus main |
| Scheduler tick | Notify + show popup; **không** auto-expand |
| Đóng companion | Hide popup, không quit app |
| Esc / nút đóng (expanded) | Hide popup |

### 2.3 Approach (đã chọn)

Một cửa sổ popup + resize động. Không dùng hai cửa sổ pet/card chồng nhau; không biến main thành companion.

---

## 3. UI / interaction

### 3.1 Collapsed

- Chỉ `PetAvatar` (size lớn), mood indicator nhỏ nếu có.
- Nền webview trong suốt; không panel cream, không header.
- `data-tauri-drag-region` trên vùng pet để kéo cửa sổ.
- Click pet → expand.
- Không chạy `useFlashcardPlayer` timer advance; không `speakWord`; không `recordFlashcardEvent` outcome `viewed`.

### 3.2 Expanded

Layout trái → phải:

1. **Card cột** — illustration, word, IPA, meaning, example; nghe / prev / pause / next; Đã nhớ / Chưa nhớ.
2. **Pet cột** — avatar (click → collapse) + level/XP rút gọn (không full `PetStatus` với missions).

- Header mỏng: drag region + nút đóng (hide).
- Khi vừa expand: bật timer 30s + auto-speak thẻ hiện tại (nếu đã hydrate deck).
- Khi collapse: pause timer + `cancelSpeech`; **giữ** index thẻ đang xem.
- Phím tắt giữ như popup hiện tại khi expanded (Space pause, mũi tên, Esc hide).

### 3.3 Main desk

Không đổi composition hiện tại (`PetStatus` trái, preview + settings phải). Nút “Học ngay” vẫn `openStudyPopup()`.

---

## 4. Data flow

### 4.1 UI state

- `expanded: boolean` local trong popup shell (không cần persist giữa lần mở app; mặc định `false`).
- Deck / index: `useFlashcardPlayer` với cờ kiểu `active: expanded` (hoặc `paused` forced khi collapsed) để không advance khi thu.

### 4.2 Study content

- `contentType` / `topic` / `conversationTopic` từ `useStudyStore` — user đổi trên main, popup đọc cùng store (cùng process Tauri).
- Hydrate pet + deck khi popup có session (giống `AuthenticatedFlashcardStudy` hiện tại).

### 4.3 XP / events

| Trạng thái | viewed on advance | known / unknown |
| --- | --- | --- |
| Collapsed | Không | Không (UI ẩn) |
| Expanded | Có | Có |

### 4.4 Native APIs

- `tauri.conf.json`: popup `transparent: true`; width/height mặc định = collapsed.
- Frontend hoặc Rust command: set bounds với anchor cạnh phải (vd. `set_popup_companion_bounds { expanded: bool }` hoặc generic `set_popup_size` tính lại x từ right edge).
- Browser preview (`?window=popup`): CSS transparent/cream; `window.resizeTo` best-effort; không fail nếu browser chặn resize.

### 4.5 Auth / onboarding edge cases

| Tình huống | Collapsed | Click / expand |
| --- | --- | --- |
| Chưa login | Avatar placeholder hoặc pet demo tĩnh | Mở main + AuthGate; có thể hide popup |
| Đã login, chưa chọn pet | Placeholder | Mở main + Onboarding |
| Đã sẵn sàng học | Pet thật | Expand card + study |

Không bắt login trên chính surface collapsed ngoài CTA tối thiểu (tránh form auth trong widget 120px).

---

## 5. Components / files (dự kiến)

| Khu vực | Thay đổi |
| --- | --- |
| `src/components/popup/flashcard-popup.tsx` | Shell collapsed/expanded; thay header full-bleed hiện tại |
| `src/components/popup/*` (mới nếu cần) | `CompanionPet`, layout expanded row |
| `src/components/flashcard/use-flashcard-player.ts` | Tôn trọng `active` / forced pause khi collapsed |
| `src/lib/tauri.ts` | Helpers resize/bounds; browser fallback |
| `src-tauri/tauri.conf.json` | transparent + default size |
| `src-tauri/src/commands/window.rs` (+ lib register) | Bounds/anchor nếu làm phía Rust |
| `src-tauri/src/lib.rs` | Release setup: show popup thay vì chỉ main |
| `src-tauri/src/tray.rs` | Giữ mapping; xác nhận “Học ngay” → popup |
| `src/config/deployment.test.ts` | Cập nhật kích thước / transparent expectations |
| Unit tests mới | Anchor math; player inactive khi collapsed |

---

## 6. Testing

**Automated**

- Anchor/size helper: expand tăng width về phía trái; collapse về collapsed size, right edge không đổi.
- Player: `active: false` → không advance, không speak.
- Deployment config: popup transparent + collapsed dimensions.

**Manual (Tauri Windows)**

1. Cold start release → pet nổi collapsed.
2. Click → card trái + pet phải; TTS + 30s rotate.
3. Click pet → collapse; vị trí pet ổn định; không còn TTS.
4. Tray “Mở app” → desk đầy đủ; đổi mode vocabulary → mở lại popup thấy đúng mode.
5. Scheduler tick khi đang làm việc → popup hiện collapsed, không nhảy expand.
6. Chưa login: click companion → main auth.

---

## 7. Open implementation notes (không phải TBD sản phẩm)

- Exact px collapsed/expanded có thể chỉnh sau khi đo `PetAvatar` + card compact — hành vi anchor và trạng thái mới là bắt buộc.
- Windows transparency + shadow: ưu tiên silhouette pet rõ; nếu OS artifact, fallback nền gần-transparent / shadow nhẹ chỉ quanh avatar (vẫn đạt “mascot”, không khung app đầy đủ khi collapsed).
- Debug launch mở main: chấp nhận được miễn release path đúng popup-first.
