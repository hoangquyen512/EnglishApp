---
name: automating-vocab-pet-tests
description: Use when writing, extending, reviewing, or debugging automated tests for Vocab Pet / EnglishApp — Vitest, Testing Library, Playwright, flaky tests, missing coverage, quiz, flashcard, SRS, XP, mood, streak, missions, scheduler, Tauri, SQLite, deployment/installer, kiểm thử tự động, or when about to manually verify domain rules instead of adding a test.
---

# Automating Vocab Pet Tests

**Oracle là đặc tả, không phải implementation.** Luật XP / SRS / mood / mission / installer lấy từ `docs/ARCHITECTURE.md` và assert bằng **literal** (`5`, `50`, `14`). Import cùng constant với SUT = tautology.

Cổng duy nhất: `pnpm test` (`vitest run`). Không Jest. Không `pnpm tauri dev` để xác nhận hàm thuần.

## When to Use

Feature chạm quiz, SRS, pet, scheduler, SQLite, installer; test đỏ/flake; agent sắp mở app để “check giúp” một hàm.

**Không dùng** cho polish CSS-only. Không automate tray OS, toast, NSIS/DMG trên Linux CI.

## Chọn tầng (trước khi tạo file)

```
Hàm thuần  src/features|lib|config  →  Vitest *.test.ts (cùng folder)
React + props, không SQLite         →  Vitest + Testing Library *.test.tsx
getNextCard / submitAnswer          →  unit + mock src/db/* (không mở SQLite)
Hành trình UI, không native         →  Playwright :1420 + mock @tauri-apps/*
Tray / 2 cửa sổ / path user         →  1 smoke desktop hoặc checklist tay
```

Không DOM → unit. Có DOM, không OS → component. E2E chỉ khi bug chỉ xuất hiện lúc ráp phần.

App root = thư mục có `src/features/` + `src-tauri/` + script `test` (repo root **hoặc** `vocab-pet-app/`). Mở rộng 4 file có sẵn (`xp.test.ts`, `spaced-repetition.test.ts`, `scheduler.test.ts`, `deployment.test.ts`) trước khi tạo runner mới.

## Invariants — literal

| Luật | Oracle |
| --- | --- |
| Đúng / level | `+5` XP; mỗi `50` XP lên cấp, overflow giữ phần dư |
| SRS | đúng: `1,1,3,7,14`; sai: `0`; `mastered` khi `correctCount>=5` |
| Mood | 0d happy → 1d neutral → 2d sad → 3d+ hungry; **không chết** |
| Mission | `learn_new` / `review_wrong` / `topic_practice` độc lập |
| Scheduler | `<=0` hoặc NaN → `120_000` ms |
| Ship | targets `nsis`+`app`+`dmg`; cấm `msi`/`pkg`/`all`; NSIS `currentUser` |

Spec ≠ code (ví dụ `submitAnswer` gọi `markPetFed` cả khi sai): pin code, comment `// spec-drift`. Không sửa production trong PR test trừ khi được giao.

## Recipe

1. Target = export thuần (`applyXpGain`, `applyReview`, `moodFromLastFed`, `missionCountsToward`, `intervalMsFromMinutes`).
2. Inject `nowMs` / `random` / `now`. Cấm `Date.now()` trong assert.
3. Arrange → Act một hàm → Assert object literal.
4. Tên `it("levels up when XP fills a level")`.
5. `pnpm test` xanh mới dừng.

```ts
it("levels twice when gain crosses two thresholds", () => {
  expect(applyXpGain({ level: 1, xp: 40 }, 70)).toEqual({
    level: 3, xp: 10, leveledUp: true,
  });
});
```

Mock db / component / Playwright / `data-testid`: [references/patterns.md](references/patterns.md). P0–P2: [references/test-matrix.md](references/test-matrix.md).

Locator: `data-testid="vp-<surface>-<role>"` (`vp-popup-submit`). Không class Tailwind, không copy tiếng Việt.

## Cấm / red flags

| Excuse | Reality |
| --- | --- |
| "Cần E2E cho XP" | Hàm thuần — unit. |
| "Mở tauri cho chắc" | `pnpm test` là bằng chứng. |
| `sleep` / `waitForTimeout` | Inject timer / gọi `onTick`. |
| Assert bằng `XP_PER_LEVEL` | Tautology. Dùng `50`. |
| Thêm Jest/Cypress | Vitest đã có. |
| Test SQL string / Zustand | Test hành vi feature. |

Dừng nếu: file không chạy bằng `pnpm test`; E2E cho logic không DOM; snapshot HTML lớn; fail khi đổi class.

**REQUIRED BACKGROUND:** superpowers:test-driven-development khi thêm feature. Skill này chọn tầng + oracle.
