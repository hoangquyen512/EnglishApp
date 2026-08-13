# Cổng regression — mỗi feature xong là chạy lại toàn bộ

## Iron law

```
Feature/bugfix code đã viết? Chưa xong.
Chỉ xong khi: bash scripts/run-regression.sh  →  exit 0
```

Một file test mới xanh **không** phải regression. Regression = mọi test hiện có + build + e2e (nếu có).

## Khi nào kích hoạt

| Sự kiện | Ai chạy | Lệnh |
| --- | --- | --- |
| Agent vừa xong chức năng / bugfix | Agent (bắt buộc, local) | `bash scripts/run-regression.sh` |
| Mở / cập nhật pull request | GitHub Actions `Regression` | cùng script |
| Push `main` | GitHub Actions `Regression` | cùng script |
| Chạy tay | `workflow_dispatch` trên tab Actions | cùng script |

Không có đường tắt. Không `vitest run src/foo.test.ts` làm bằng chứng merge.

## Script làm gì

`scripts/run-regression.sh`:

1. Tìm app root: repo root **hoặc** `vocab-pet-app/` (cần `package.json` + `src/features` hoặc `src-tauri`).
2. `pnpm install --frozen-lockfile` (nếu có lock).
3. `pnpm test` — **không** truyền path.
4. `pnpm build` nếu có script (tsc + Vite).
5. `pnpm test:e2e` nếu có script.
6. Exit ≠ 0 → feature chưa xong.

App chưa có trên branch (như `main` hiện tại): script in skip và exit 0. Khi scaffold/feature merge vào, CI tự chạy full suite — không cần sửa workflow.

`REGRESSION_SKIP_INSTALL=1` chỉ khi `node_modules` đã chắc chắn đủ (local lặp). CI không set biến này.

## CI

`.github/workflows/regression.yml` — `pull_request` + `push` `main` + `workflow_dispatch`.

Trên GitHub: Settings → Rules → require check **Regression / Full suite** trước khi merge `main`. Agent không set được branch protection; người maintain bật một lần.

## Excuse

| Excuse | Reality |
| --- | --- |
| "Chỉ đụng một hàm, test file đó đủ" | Regression bắt regression. Chạy full. |
| "CI sẽ chạy sau" | Local phải xanh trước. CI là cổng thứ hai, không thay local. |
| "Hết thời gian, merge đi" | Đỏ = chưa xong. |
| "Tôi chạy test:watch rồi" | Watch một file ≠ suite. |
| "Tauri dev OK" | Không phải automation regression. |
| "Linux không có WebView" | Script không chạy `tauri`. `pnpm test` + `pnpm build` là đủ trên CI. |
