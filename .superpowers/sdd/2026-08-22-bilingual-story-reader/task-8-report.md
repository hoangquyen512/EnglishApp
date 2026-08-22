# Task 8 report

## Status

Implemented the 3-column bilingual story library on Home, replacing the previous
story lesson feed while preserving the existing Sora sidebar.

## Changes

- Added `HomeStoryLibrary` with story seeding/loading, 350 ms search debounce,
  filters, sorting, selection, favorites, share fallback, progress CTAs, and
  loading/empty/error states.
- Added `StoryDetailPanel` with story metadata, chapter selection without locks,
  favorite/share controls, and start/selected-chapter reader callbacks.
- Wired `HomeScreen` to use `yume-home--stories` and bubble the optional
  `onOpenReader(storyId, chapterId)` callback.
- Extended existing story CSS for card actions, chapter typography, favorite
  state, and keyboard focus indicators.
- Added a regression test proving chapters render without lock controls.

## Verification

- `npm exec --yes pnpm@9.15.0 -- test` — 43 files, 166 tests passed.
- `npm exec --yes pnpm@9.15.0 -- build` — TypeScript and Vite build passed.
- Browser smoke was unavailable because Cursor could not create a browser tab;
  the local Vite server started successfully at `http://127.0.0.1:1422/`.

## Commit

`feat(stories): add 3-column story library on home`
