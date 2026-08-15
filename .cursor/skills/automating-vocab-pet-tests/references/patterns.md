# Patterns — Vocab Pet automation

## 1. Clock và RNG

Domain đã inject. Test phải truyền vào — không dựa tường hệ thống.

```ts
const now = Date.parse("2026-08-13T00:00:00.000Z");
expect(moodFromLastFed("2026-08-10T00:00:00.000Z", now)).toBe("hungry");

// RNG xác định: luôn 0 → shuffle ổn định
const choices = buildChoices("nước", ["thời gian", "nước", "người", "năm"], 4, () => 0);
```

Cần fake timer cho scheduler: `vi.useFakeTimers()` rồi `vi.advanceTimersByTime(120_000)`. Vẫn inject `intervalMsFromMinutes` khi chỉ test đổi phút→ms.

## 2. Mở rộng file test hiện có

Cùng folder với SUT:

| SUT | Test |
| --- | --- |
| `src/features/pet-state/xp.ts` (+ mood/streak/missions) | `xp.test.ts` |
| `src/features/vocabulary/spaced-repetition.ts` + `quiz.ts` | `spaced-repetition.test.ts` |
| `src/features/scheduler/index.ts` | `scheduler.test.ts` |
| `src-tauri/tauri.conf.json` | `src/config/deployment.test.ts` |

Thêm `describe` mới trong file đó. Đừng tạo `tests/unit/xp.spec.ts`.

`vite.config.ts` hiện `include: ["src/**/*.test.ts"]` và `environment: "node"`. Khi thêm `*.test.tsx`:

```ts
test: {
  environment: "node",
  include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  environmentMatchGlobs: [["src/**/*.test.tsx", "jsdom"]],
}
```

Cài `@testing-library/react` `@testing-library/user-event` `@testing-library/jest-dom` `jsdom` — chỉ khi viết test component đầu tiên.

## 3. Mock `src/db/*` — không mock SUT

`getNextCard` / `submitAnswer` / `applyXpAndRefresh` gọi SQLite. Unit chúng bằng `vi.mock("../../db")` (đường dẫn từ file feature).

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitAnswer } from "./index";

vi.mock("../../db", () => ({
  getSessionStats: vi.fn(),
  lastSessionDate: vi.fn(),
  getVocabularyById: vi.fn(),
  getPhraseById: vi.fn(),
  insertStudySession: vi.fn(),
  getLearningProgress: vi.fn(),
  upsertLearningProgress: vi.fn(),
  listVocabulary: vi.fn(),
  // ...chỉ hàm mà SUT import
}));

vi.mock("../pet-state", async () => {
  const actual = await vi.importActual("../pet-state");
  return {
    ...actual,
    applyMissionProgress: vi.fn().mockResolvedValue([]),
    completeMissionXp: vi.fn(),
    applyXpAndRefresh: vi.fn().mockResolvedValue({ leveledUp: false }),
    markPetFed: vi.fn().mockResolvedValue({ mood: "happy", level: 1, xp: 5 }),
    refreshUserProgress: vi.fn(),
  };
});
```

Assert: `isCorrect`, `applyXpAndRefresh` được gọi với `5` khi đúng và **không** gọi khi sai (nếu đó là hành vi hiện tại). Đừng assert toàn bộ SQL.

## 4. Component — props in, callback out

Không hydrate Zustand + SQLite trong component test. Render screen với props giả.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeScreen } from "./home-screen";

it("starts study from home", async () => {
  const user = userEvent.setup();
  const onStudyNow = vi.fn();
  render(
    <HomeScreen
      pet={petFixture}
      missions={[]}
      contentType="vocabulary"
      topic={null}
      intervalMinutes={2}
      onContentType={vi.fn()}
      onTopic={vi.fn()}
      onInterval={vi.fn()}
      onStudyNow={onStudyNow}
    />,
  );
  await user.click(screen.getByTestId("vp-home-study-now"));
  expect(onStudyNow).toHaveBeenCalledOnce();
});
```

Khi thêm testid vào component (cùng PR với test):

```tsx
<PrimaryButton data-testid="vp-home-study-now" onClick={onStudyNow}>
  {UI.studyNow}
</PrimaryButton>
```

Không `getByText("Học ngay")` làm locator chính.

## 5. Playwright (tầng 4) — chỉ sau P0 unit xanh

- Base URL `http://localhost:1420` (Vite trong `vite.config.ts`)
- Mock `@tauri-apps/api` / plugin SQL / notification ở `src/lib/tauri.ts` khi `import.meta.env.MODE === "test"`
- 1 spec happy path: onboard → home → mở popup (nếu popup cùng SPA query `?window=popup` — chỉ viết khi app hỗ trợ; **đừng** bịa route)
- Cấm `page.waitForTimeout`
- Không chạy Playwright trên Linux agent nếu chưa có browser + mock Tauri ổn định

Hai WebView Tauri (`main` / `popup`) **không** phải hai URL production. `App.tsx` chọn tree theo `getCurrentWebviewWindow().label`. Test browser phải stub label.

## 6. Fixture tối thiểu

```ts
export const petFixture = {
  id: 1,
  petName: "Mèo",
  level: 1,
  xp: 0,
  mood: "happy" as const,
  streakDays: 0,
  lastFedAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  speciesId: 1,
  currentStageId: 1,
  spriteKey: "cat_egg",
  speciesName: "Mèo",
};
```

Đặt `src/test/fixtures.ts` khi fixture dùng ở ≥2 file. Một file thì để local.

## 7. Chạy và phạm vi CI

```bash
bash scripts/run-regression.sh   # bắt buộc sau mỗi feature — full suite
pnpm test:watch                  # local, không phải bằng chứng xong
```

Script đã gồm `pnpm test` (mọi file) + `pnpm build` + `pnpm test:e2e` nếu có. Cùng lệnh chạy trên GitHub Actions (`Regression`). Chi tiết: [regression-gate.md](regression-gate.md).

Linux cloud agent: `pnpm test` + `pnpm build` là đủ. `pnpm tauri dev` / `tauri build` cần WebView/GTK — đừng lấy fail native làm fail test domain.

## 8. Drift spec ↔ code

Khi viết test orchestration, đọc cả `submitAnswer` lẫn ARCHITECTURE. Lệch đã biết:

- Spec: feed pet khi trả lời **đúng**. Code: `markPetFed` sau mọi câu trả lời.
- Spec: XP +5 khi đúng. Code: đúng.
- UI spec: popup phím 1–4 / Enter / Esc. Scaffold hiện tại có thể chưa gắn phím — test component chỉ thêm khi handler tồn tại.

Pin code. Ghi 1 comment `// spec-drift: ...`. Không "sửa giúp" logic pet trong PR chỉ có skill/test trừ khi được giao.
