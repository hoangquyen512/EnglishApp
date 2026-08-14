# Floating Pet Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the always-on-top popup a floating pet companion that starts collapsed (transparent avatar only), expands left on click to show a study card, and keep the main desk available only via tray “Mở app”.

**Architecture:** One Tauri `popup` window with dynamic resize that keeps the window’s **right edge** fixed. Pure TypeScript helpers own size/anchor math and study-active gating; the React popup shell owns `expanded` state; `useFlashcardPlayer` only advances/speaks when `active` is true. Release launch shows the popup collapsed; main remains the full desk.

**Tech Stack:** Tauri 2, React 18, TypeScript, Zustand, Vitest, TailwindCSS

**Spec:** `docs/superpowers/specs/2026-08-15-floating-pet-companion-design.md`

## Global Constraints

- Popup companion is the default surface; main desk only from tray “Mở app” (and explicit show-main paths for auth/onboarding).
- Collapsed: transparent window, avatar only; no timer advance, no TTS, no `viewed` XP.
- Expanded: cream panel, card on the **left**, pet on the **right**; 30s rotate + auto-speak + known/unknown.
- Resize must keep the window **right edge** fixed; `y` unchanged.
- One popup window only (no second card window).
- Do not redesign `HomeScreen` layout, SRS, or missions.
- Copy remains Vietnamese via `src/constants/ui.ts`.
- Exact px may be tuned later; start with collapsed `120×120` and expanded `420×560`.

## File map

| File | Responsibility |
| --- | --- |
| `src/features/companion/window-geometry.ts` | Collapsed/expanded sizes + right-edge-anchored bounds math |
| `src/features/companion/window-geometry.test.ts` | Unit tests for anchor math |
| `src/features/vocabulary/companion-study.ts` | Pure gates: speak / tick advance only when study active |
| `src/features/vocabulary/companion-study.test.ts` | Unit tests for those gates |
| `src/features/vocabulary/timer.ts` | Unchanged helpers; still used by gates |
| `src/components/flashcard/use-flashcard-player.ts` | Accept `active`; wire gates + cancel speech when inactive |
| `src/lib/tauri.ts` | `setCompanionWindowBounds(expanded)` + browser fallback |
| `src-tauri/tauri.conf.json` | Popup `transparent: true`, default collapsed size |
| `src-tauri/capabilities/default.json` | Allow `set_size` / `set_position` / `outer_position` / `outer_size` as needed |
| `src/config/deployment.test.ts` | Assert transparent + collapsed dimensions |
| `src/components/popup/flashcard-popup.tsx` | Collapsed/expanded companion shell |
| `src/components/popup/companion-pet-button.tsx` | Clickable/draggable pet control |
| `src/index.css` / popup root class | Transparent body only for popup window |
| `src-tauri/src/lib.rs` | Release setup: show popup (collapsed) |
| `README.md` | Short note: launch opens companion; “Mở app” opens desk |

---

### Task 1: Companion window geometry helper

**Files:**
- Create: `src/features/companion/window-geometry.ts`
- Create: `src/features/companion/window-geometry.test.ts`
- Modify: `src/features/companion/index.ts` (create if missing; export geometry constants/helpers)

**Interfaces:**
- Consumes: none
- Produces:
  - `COMPANION_COLLAPSED_SIZE = { width: 120, height: 120 }`
  - `COMPANION_EXPANDED_SIZE = { width: 420, height: 560 }`
  - `companionBounds(input: { expanded: boolean; x: number; y: number; width: number; height: number }): { x: number; y: number; width: number; height: number }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  COMPANION_COLLAPSED_SIZE,
  COMPANION_EXPANDED_SIZE,
  companionBounds,
} from "./window-geometry";

describe("companionBounds", () => {
  it("expands left while keeping the right edge fixed", () => {
    const current = { expanded: false, x: 800, y: 200, width: 120, height: 120 };
    const next = companionBounds({ ...current, expanded: true });
    expect(next).toEqual({
      x: 800 + 120 - COMPANION_EXPANDED_SIZE.width,
      y: 200,
      width: COMPANION_EXPANDED_SIZE.width,
      height: COMPANION_EXPANDED_SIZE.height,
    });
    expect(next.x + next.width).toBe(current.x + current.width);
  });

  it("collapses toward the right edge without moving y", () => {
    const current = {
      expanded: true,
      x: 500,
      y: 90,
      width: COMPANION_EXPANDED_SIZE.width,
      height: COMPANION_EXPANDED_SIZE.height,
    };
    const next = companionBounds({ ...current, expanded: false });
    expect(next).toEqual({
      x: 500 + COMPANION_EXPANDED_SIZE.width - COMPANION_COLLAPSED_SIZE.width,
      y: 90,
      width: COMPANION_COLLAPSED_SIZE.width,
      height: COMPANION_COLLAPSED_SIZE.height,
    });
    expect(next.x + next.width).toBe(current.x + current.width);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/companion/window-geometry.test.ts`

Expected: FAIL (module not found / export missing)

- [ ] **Step 3: Write minimal implementation**

```ts
export const COMPANION_COLLAPSED_SIZE = { width: 120, height: 120 } as const;
export const COMPANION_EXPANDED_SIZE = { width: 420, height: 560 } as const;

export function companionBounds(input: {
  expanded: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}): { x: number; y: number; width: number; height: number } {
  const size = input.expanded ? COMPANION_EXPANDED_SIZE : COMPANION_COLLAPSED_SIZE;
  const right = input.x + input.width;
  return {
    x: right - size.width,
    y: input.y,
    width: size.width,
    height: size.height,
  };
}
```

Export from `src/features/companion/index.ts` (keep existing `PET_NAME` export if that file already exists).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/companion/window-geometry.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/companion/window-geometry.ts src/features/companion/window-geometry.test.ts src/features/companion/index.ts
git commit -m "feat: add companion window geometry helpers"
```

---

### Task 2: Study-active gates for collapsed companion

**Files:**
- Create: `src/features/vocabulary/companion-study.ts`
- Create: `src/features/vocabulary/companion-study.test.ts`
- Modify: `src/features/vocabulary/index.ts` (re-export the new helpers)
- Modify: `src/components/flashcard/use-flashcard-player.ts`

**Interfaces:**
- Consumes: `shouldAdvanceCard` from `./timer`
- Produces:
  - `shouldSpeakOnCard(input: { autoSpeak: boolean; active: boolean }): boolean`
  - `shouldTickAdvance(input: { active: boolean; paused: boolean; remainingMs: number }): boolean`
  - `useFlashcardPlayer({ ..., active?: boolean })` — default `active: true` so `HomeScreen` unchanged

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { shouldSpeakOnCard, shouldTickAdvance } from "./companion-study";

describe("companion study gates", () => {
  it("does not speak when inactive", () => {
    expect(shouldSpeakOnCard({ autoSpeak: true, active: false })).toBe(false);
    expect(shouldSpeakOnCard({ autoSpeak: true, active: true })).toBe(true);
    expect(shouldSpeakOnCard({ autoSpeak: false, active: true })).toBe(false);
  });

  it("does not advance when inactive even if timer elapsed", () => {
    expect(shouldTickAdvance({ active: false, paused: false, remainingMs: 0 })).toBe(false);
    expect(shouldTickAdvance({ active: true, paused: true, remainingMs: 0 })).toBe(false);
    expect(shouldTickAdvance({ active: true, paused: false, remainingMs: 0 })).toBe(true);
    expect(shouldTickAdvance({ active: true, paused: false, remainingMs: 1000 })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/vocabulary/companion-study.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement helpers and wire the hook**

```ts
import { shouldAdvanceCard } from "./timer";

export function shouldSpeakOnCard(input: { autoSpeak: boolean; active: boolean }): boolean {
  return input.autoSpeak && input.active;
}

export function shouldTickAdvance(input: {
  active: boolean;
  paused: boolean;
  remainingMs: number;
}): boolean {
  return input.active && !input.paused && shouldAdvanceCard(input.remainingMs);
}
```

In `use-flashcard-player.ts`:

- Add `active?: boolean` to the input (default `true`).
- Card-change effect: call `speakWord` only when `shouldSpeakOnCard({ autoSpeak: input.autoSpeak, active: input.active !== false })`.
- When `active` becomes `false`, call `cancelSpeech()` (effect dependency on `active`).
- Interval tick: advance only when `shouldTickAdvance({ active: input.active !== false, paused: Boolean(pausedAt.current), remainingMs: left })`.
- Still update `progress` / `remaining` while inactive is optional; prefer **freezing** remaining display when inactive by skipping the interval body early when `!active` (after reading current values once), or keep computing but never advancing — either is fine if tests for gates pass and popup uses `active={expanded}`.

- [ ] **Step 4: Run tests**

Run: `pnpm exec vitest run src/features/vocabulary/companion-study.test.ts src/features/vocabulary/timer.ts`

Expected: companion-study tests PASS. Also run `pnpm test` if quick; fix any type errors in the hook.

- [ ] **Step 5: Commit**

```bash
git add src/features/vocabulary/companion-study.ts src/features/vocabulary/companion-study.test.ts src/features/vocabulary/index.ts src/components/flashcard/use-flashcard-player.ts
git commit -m "feat: gate flashcard speak and advance on companion active"
```

---

### Task 3: Tauri popup config + deployment assertions

**Files:**
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src-tauri/capabilities/default.json`
- Modify: `src/config/deployment.test.ts`

**Interfaces:**
- Consumes: `COMPANION_COLLAPSED_SIZE` values (120 / 120) — hardcode the same numbers in conf and test to avoid importing TS into conf
- Produces: popup window config `{ transparent: true, width: 120, height: 120, ...existing flags }`

- [ ] **Step 1: Write the failing deployment assertions**

Replace the popup size test and extend the `TauriConf` type:

```ts
interface TauriConf {
  productName: string;
  identifier: string;
  app: {
    windows: Array<{
      label: string;
      title: string;
      width: number;
      height: number;
      transparent?: boolean;
      alwaysOnTop?: boolean;
      decorations?: boolean;
      skipTaskbar?: boolean;
    }>;
  };
  bundle: {
    targets: string | string[];
    windows?: { nsis?: { installMode?: string } };
  };
}

it("configures the companion popup as a small transparent always-on-top window", () => {
  const popup = loadConf().app.windows.find((window) => window.label === "popup");
  expect(popup?.width).toBe(120);
  expect(popup?.height).toBe(120);
  expect(popup?.transparent).toBe(true);
  expect(popup?.alwaysOnTop).toBe(true);
  expect(popup?.decorations).toBe(false);
  expect(popup?.skipTaskbar).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/config/deployment.test.ts`

Expected: FAIL on width/height/transparent

- [ ] **Step 3: Update Tauri config and capabilities**

In `src-tauri/tauri.conf.json` for the `popup` window:

- `width`: 120
- `height`: 120
- `transparent`: true
- keep `decorations: false`, `alwaysOnTop: true`, `skipTaskbar: true`, `resizable: false`, `visible: false`

In `src-tauri/capabilities/default.json`, add permissions needed for frontend bounds updates:

```json
"core:window:allow-set-size",
"core:window:allow-set-position",
"core:window:allow-outer-position",
"core:window:allow-outer-size"
```

(If the schema names differ slightly in this Tauri version, use the closest `core:window:allow-*` equivalents that enable `setSize` / `setPosition` / reading outer position+size.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/config/deployment.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src-tauri/tauri.conf.json src-tauri/capabilities/default.json src/config/deployment.test.ts
git commit -m "feat: configure transparent collapsed companion popup window"
```

---

### Task 4: Frontend helper to apply companion bounds

**Files:**
- Modify: `src/lib/tauri.ts`
- Create: `src/lib/companion-window.ts` (thin wrapper importing geometry + tauri APIs — keeps `tauri.ts` from growing further if preferred)
- Optional test: pure path already covered in Task 1; no browser mock required

**Interfaces:**
- Consumes: `companionBounds`, `isTauri`, `@tauri-apps/api/webviewWindow`
- Produces: `setCompanionWindowBounds(expanded: boolean): Promise<void>`

- [ ] **Step 1: Implement `setCompanionWindowBounds`**

Preferred location: `src/lib/companion-window.ts` exported and re-used from the popup.

```ts
import { companionBounds } from "../features/companion/window-geometry";
import { isTauri } from "./tauri";

export async function setCompanionWindowBounds(expanded: boolean): Promise<void> {
  if (!isTauri()) {
    try {
      const size = expanded
        ? { width: 420, height: 560 }
        : { width: 120, height: 120 };
      // best-effort; browsers may ignore
      window.resizeTo(size.width, size.height);
    } catch {
      // ignore
    }
    return;
  }

  const { getCurrentWebviewWindow, LogicalPosition, LogicalSize } = await import(
    "@tauri-apps/api/webviewWindow"
  );
  // Note: LogicalPosition/LogicalSize may live in @tauri-apps/api/dpi — import from the correct Tauri 2 module used in this repo.
  const win = getCurrentWebviewWindow();
  const position = await win.outerPosition();
  const outer = await win.outerSize();
  // Convert physical→logical if scale factor APIs are required on this platform.
  const next = companionBounds({
    expanded,
    x: position.x,
    y: position.y,
    width: outer.width,
    height: outer.height,
  });
  await win.setSize(new LogicalSize(next.width, next.height));
  await win.setPosition(new LogicalPosition(next.x, next.y));
}
```

**Implementer note:** Inspect `@tauri-apps/api` types in `node_modules` and match this project’s Tauri 2 import paths (`dpi` vs `webviewWindow`). Keep **right-edge math** via `companionBounds` regardless of physical/logical conversion details. Prefer operating in one unit consistently (all logical or all physical).

For browser preview, also accept that position won’t stay anchored; CSS layout still shows card-left / pet-right.

- [ ] **Step 2: Smoke-check TypeScript**

Run: `pnpm exec tsc --noEmit`

Expected: no errors from the new module

- [ ] **Step 3: Commit**

```bash
git add src/lib/companion-window.ts src/lib/tauri.ts
git commit -m "feat: apply companion window bounds with right-edge anchor"
```

---

### Task 5: Companion popup UI (collapsed / expanded)

**Files:**
- Modify: `src/components/popup/flashcard-popup.tsx`
- Create: `src/components/popup/companion-pet-button.tsx`
- Modify: `src/index.css` (optional helper class `.companion-root` with transparent background)
- Modify: `src/App.tsx` only if needed to set `document.documentElement` class when `windowKind === "popup"`

**Interfaces:**
- Consumes: `setCompanionWindowBounds`, `useFlashcardPlayer({ active: expanded, autoSpeak: true, ... })`, `PetAvatar`, `FlashcardFace`, `DEMO_PET`, `dismissStudyPopup`, `showMainWindow`
- Produces: popup UX matching the spec

- [ ] **Step 1: Add `CompanionPetButton`**

```tsx
import { PetAvatar } from "../pet/pet-avatar";
import type { PetState } from "../../types";

export function CompanionPetButton(props: {
  pet: PetState;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={props.onToggle}
      className="relative border-0 bg-transparent p-0"
      data-tauri-drag-region
    >
      <PetAvatar pet={props.pet} size="lg" />
    </button>
  );
}
```

**Drag vs click:** If drag-region swallows clicks on Windows, wrap avatar in an inner non-drag button and keep a thin outer drag handle, or use `onMouseDown` + movement threshold. Prefer keeping **click-to-toggle** reliable; dragging can use a small grip or the Tauri drag region on padding around the avatar.

- [ ] **Step 2: Rewrite `FlashcardPopup` shell**

Behavior checklist:

1. Local `const [expanded, setExpanded] = useState(false)`.
2. On toggle: `setExpanded`, then `void setCompanionWindowBounds(next)`.
3. Collapsed UI: transparent full-window flex center with `CompanionPetButton` only (use real `pet` or `DEMO_PET` / placeholder when missing).
4. Expanded UI: cream rounded panel, header (drag + close), row `FlashcardFace` (left) + pet column (right, click collapses) with compact level/XP text.
5. `useFlashcardPlayer({ ..., autoSpeak: true, active: expanded, onAdvance })` only inside authenticated ready-to-study branch.
6. Root classes: collapsed → `bg-transparent`; expanded → cream panel on transparent window background.
7. Set `document.documentElement` / `body` background transparent while popup mounts; restore on unmount. Main window must keep cream/paper tokens.

Keyboard (expanded only): Space pause, arrows next/prev, Esc `dismissStudyPopup`.

- [ ] **Step 3: Browser preview check**

Run: `pnpm dev` and open `http://localhost:1420/?window=popup`

Expected: collapsed pet; click expands card-left layout; click pet collapses.

- [ ] **Step 4: Commit**

```bash
git add src/components/popup/flashcard-popup.tsx src/components/popup/companion-pet-button.tsx src/index.css src/App.tsx
git commit -m "feat: render floating companion collapsed and expanded study UI"
```

---

### Task 6: Auth / onboarding handoff from companion

**Files:**
- Modify: `src/components/popup/flashcard-popup.tsx`
- Modify: `src/lib/tauri.ts` if `showMainWindow` needs a browser no-op already present (it does)

**Interfaces:**
- Consumes: `useAuthStore`, `useAppStore`, `showMainWindow`, `hidePopupWindow` / `dismissStudyPopup`
- Produces: click paths for not-ready users

- [ ] **Step 1: Implement edge-case toggle behavior**

When user clicks pet:

| Condition | Action |
| --- | --- |
| `!session` | `showMainWindow()` then optionally `dismissStudyPopup()`; do not expand |
| `session && !pet` (after hydrate) | `showMainWindow()` for onboarding; do not expand |
| ready | toggle expand / collapse as Task 5 |

Collapsed visuals for not-ready: still show `DEMO_PET` avatar so the mascot is visible.

- [ ] **Step 2: Manual reason through browser**

With `?window=popup` and logged-out localStorage (or cleared), click pet → main auth should be the intended desktop path; in browser, `showMainWindow` is no-op so at least do not expand study UI without session.

- [ ] **Step 3: Commit**

```bash
git add src/components/popup/flashcard-popup.tsx
git commit -m "feat: route companion clicks to main when login or onboard needed"
```

---

### Task 7: Release launch shows companion; docs touch-up

**Files:**
- Modify: `src-tauri/src/lib.rs`
- Modify: `README.md` (tray / launch paragraphs only)
- Confirm: `src-tauri/src/tray.rs` already maps “Học ngay” → popup, “Mở app” → main (no change unless left-click tray should stay “Mở app” — leave as-is)

**Interfaces:**
- Consumes: `show_popup_window`, `show_main_window`
- Produces: release startup opens popup

- [ ] **Step 1: Update setup launch**

In `src-tauri/src/lib.rs` setup:

```rust
#[cfg(debug_assertions)]
{
    let _ = show_main_window(app.handle().clone());
}
#[cfg(not(debug_assertions))]
{
    let _ = show_popup_window(app.handle().clone());
}
```

Ensure `show_popup_window` does not reset size to expanded; default conf size is collapsed. Do **not** auto-expand on show (scheduler / “Học ngay” keep current expanded state; fresh process starts collapsed).

- [ ] **Step 2: Update README briefly**

Reflect:

- Release start → floating companion (collapsed pet).
- Tray “Học ngay” → companion; “Mở app” → full desk.
- Click pet → study card on the left.

- [ ] **Step 3: Run full unit suite**

Run: `pnpm test`

Expected: all pass, including deployment + geometry + companion-study

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/lib.rs README.md
git commit -m "feat: open floating companion on release launch"
```

---

### Task 8: Manual Tauri verification (no commit unless fixes)

**Files:** none planned (fix commits only if bugs found)

- [ ] **Step 1: Run desktop app**

Run: `pnpm tauri dev` (debug will still open main — also open companion via tray “Học ngay” or `show_popup_window`)

For release-path check, either `pnpm tauri build` smoke or temporarily flip the cfg to show popup in debug, then revert.

- [ ] **Step 2: Verify checklist from spec §6**

1. Companion appears always-on-top, collapsed, transparent around pet.
2. Click pet → expands left; card readable; TTS + 30s rotate.
3. Click pet → collapses; pet position stable (right edge fixed); TTS stops.
4. “Mở app” → desk unchanged; change study mode → companion uses same mode.
5. Scheduler / “Học ngay” shows companion without forcing expand.
6. Logged-out click → main auth.

- [ ] **Step 3: If bugs, fix with focused commits**

Use messages like `fix: keep companion right edge stable on DPI scale`.

---

## Self-review (author)

| Spec requirement | Task |
| --- | --- |
| Popup-first companion, main via “Mở app” | 7 |
| Collapsed transparent avatar; click toggle | 5 |
| Card left · pet right when expanded | 5 |
| Freeze study when collapsed | 2, 5 |
| Right-edge anchor resize | 1, 4 |
| Transparent conf + collapsed default size | 3 |
| No auto-expand on scheduler/show | 5, 7 |
| Auth/onboard handoff | 6 |
| No HomeScreen redesign | (explicit non-touch) |
| Deployment tests updated | 3 |

No TBD placeholders left in task steps. Types for `companionBounds` / study gates are consistent across tasks.
