# Vocab Pet — Account Design Spec (username + password)

Date: 2026-08-13  
Product: Vocab Pet (repo `EnglishApp`)  
Status: Ready for review  
Scope: Tài khoản tối giản — chỉ username và password. Không email, không verify email, không OAuth, không server đồng bộ.

Spec này là nguồn sự thật cho chức năng tài khoản. Nó **không** đổi pet XP/mood/missions, SRS, tray, popup 400×500, hay installer. Những phần đó vẫn khóa trong `docs/ARCHITECTURE.md` (PR #2) và UI Warm Companion (PR #3).

---

## 1. Context

Vocab Pet hiện là app desktop **một người / một máy**: SQLite local, onboarding = chọn pet, không có khái niệm đăng nhập. `pet_state` và `user_progress` là bảng singleton (một hàng, không `user_id`).

Yêu cầu sản phẩm (từ người dùng):

> Chỉ cần nhập username và password. Không cần email hay verify email.

Tên agent: **Chức năng tài khoản tối giản**.

### 1.1 Constraints đã khóa

| Constraint | Implication |
| --- | --- |
| Không email | Không gửi mail, không confirm link, không “quên mật khẩu qua email” |
| Không verify | Đăng ký xong là dùng được ngay |
| Desktop local-first (Tauri + SQLite) | Chưa có backend; thêm server là phạm vi lớn |
| Máy dùng chung có thể xảy ra | Username phải unique **trên máy này**, data phải tách theo tài khoản |
| Offline | Đăng ký / đăng nhập không được phụ thuộc mạng |
| Warm Companion UI | Màn hình auth phải cùng token (Be Vietnam Pro, terracotta-700, cream) |

### 1.2 Giả định (background agent — không hỏi được từng câu)

Các giả định dưới đây được **chốt trong spec**. Nếu sai, sửa spec trước khi viết plan.

1. Sản phẩm là **Vocab Pet desktop**, không phải web app riêng.
2. Tài khoản là **bắt buộc** — không có chế độ khách. Lần mở đầu tiên = đăng ký, rồi mới chọn pet.
3. Một máy có thể có **nhiều tài khoản** (hai người dùng chung laptop, hoặc “tài khoản học” / “tài khoản chơi”).
4. Phiên đăng nhập **giữ đến khi bấm Đăng xuất** (tray app không hỏi password mỗi lần hiện popup).
5. Cloud sync, leaderboard, đăng nhập Google — **không** thuộc spec này.
6. Đổi username — **không** thuộc spec này.
7. Người học là người Việt; copy UI bằng tiếng Việt.

---

## 2. Goal / non-goal

**Goal**

- Người dùng tạo tài khoản bằng username + password, rồi vào onboarding pet như hiện tại.
- Lần sau: đăng nhập bằng đúng cặp đó để thấy pet và tiến độ của mình.
- Đăng xuất → màn hình đăng nhập. Tài khoản khác trên cùng máy không thấy data của nhau.
- Quên mật khẩu: khôi phục bằng **mã khôi phục** (hiện một lần lúc đăng ký), không qua email.

**Non-goal (cấm lọt vào PR implementation)**

- Email, số điện thoại, OTP, captcha, OAuth, 2FA.
- Server, API cloud, đồng bộ nhiều máy.
- Reset password qua mail / SMS / admin.
- Phân quyền (admin / teacher / student).
- Xóa tài khoản kèm xuất file GDPR — chỉ xóa local row + cascade (mục 7.7).
- Đổi username.
- Avatar / profile social.
- Bắt nhập password mỗi lần mở popup.

---

## 3. Ba hướng — trade-off và khuyến nghị

### A. Hồ sơ local (khuyến nghị)

Username + password lưu trong SQLite trên máy. Hash Argon2id chạy ở **Rust**. Không server.

| Ưu | Nhược |
| --- | --- |
| Khớp kiến trúc hiện tại (Tauri + SQLite, offline) | Username unique chỉ trên **máy này**, không “tài khoản internet” |
| Zero hosting, zero email | Mất máy / xóa AppData = mất tài khoản |
| Nhiều người dùng chung máy được ngay | Không đăng nhập được máy khác |
| Có thể gắn `user_id` cloud sau này mà không đổi UX | Phải tự giải bài toán quên mật khẩu (mã khôi phục) |

**Phù hợp** vì yêu cầu là tối giản và sản phẩm chưa có backend.

### B. Backend username + password (không email)

Một API nhỏ: `POST /register`, `POST /login`, JWT. Username unique toàn cục.

| Ưu | Nhược |
| --- | --- |
| Đăng nhập được nhiều máy | Phải viết/host server, TLS, rate limit, backup |
| Username là identity thật | **Không email** ⇒ không verify, không reset chuẩn, dễ bị chiếm username |
| Sẵn sàng cho sync | Phá ràng buộc offline; lần đầu phải có mạng |
| | Phạm vi gấp nhiều lần so với “tối giản” |

**Không chọn** cho vòng này. Nếu sau này cần sync, spec A đã để `accounts.id` ổn định để map lên server.

### C. Khách mặc định + khóa mật khẩu tùy chọn

Giữ singleton như hiện tại. Password chỉ là PIN khóa cửa sổ chính.

| Ưu | Nhược |
| --- | --- |
| Ít schema change | Không phải “tài khoản”; không đăng ký / nhiều user |
| | Không tách tiến độ khi hai người dùng chung máy |
| | Username trở thành nhãn trang trí |

**Không chọn** — người dùng hỏi chức năng tài khoản (đăng ký + đăng nhập), không phải khóa màn hình.

**Quyết định:** ship **Approach A**.

---

## 4. Architecture

Auth sống ở **Rust** (hash, verify, session id). TypeScript chỉ gọi command và render form. JS **không** hash password và **không** nhận `password_hash` từ DB.

```
┌─────────────────────────────────────────────────────────────┐
│  Main window (880×640)                                      │
│   chưa session → AuthGate (Đăng nhập | Đăng ký)             │
│   có session, chưa pet → Onboarding (chọn pet) — giữ nguyên │
│   có session, có pet   → Home                               │
└────────────────────────────┬────────────────────────────────┘
                             │ invoke
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Rust commands (src-tauri/src/commands/auth.rs)             │
│   register / login / logout / change_password / recover     │
│   current_session                                           │
│   Argon2id (PHC string trong cột password_hash)             │
└────────────────────────────┬────────────────────────────────┘
                             ▼
              sqlite:vocab_pet.db
              accounts + app_session + user_id trên bảng tiến độ
              settings.json không chứa session (tránh đua với Zustand)
```

Popup **không** có màn hình auth. Nếu chưa đăng nhập mà tray bấm **Học ngay**, Rust/`show_popup_window` vẫn mở popup nhưng frontend popup hiện copy “Mở app để đăng nhập” + nút đóng — không lộ thẻ học. Scheduler tick khi chưa login: **không** bắn notification (tránh làm phiền trước khi có tài khoản).

### 4.1 Thành phần (một việc / một ranh giới)

| Unit | Việc | API công khai | Phụ thuộc |
| --- | --- | --- | --- |
| `commands/auth.rs` | Đăng ký, login, logout, đổi/khôi phục mật khẩu, session | Tauri commands dưới đây | SQLite, Argon2id |
| `db/accounts.ts` | Đọc session hiện tại cho UI (không SQL password) | `getCurrentAccount()` | `current_session` command |
| `features/auth` | Validate form phía client (độ dài, khớp confirm) | `validateUsername`, `validatePassword` | không |
| `components/auth/*` | AuthGate, LoginForm, RegisterForm, RecoveryReveal, ForgotForm | props onSubmit | `features/auth` + invoke |
| `AuthGate` (main) | Chọn cây: auth / onboarding / home | wrap existing App | session + `pet_state` |

Rust commands:

| Command | Input | Output |
| --- | --- | --- |
| `register_account` | `{ username, password }` | `{ userId, username, recoveryCode }` — `recoveryCode` **chỉ lần này** |
| `login_account` | `{ username, password }` | `{ userId, username }` |
| `logout_account` | none | `()` |
| `current_session` | none | `{ userId, username } \| null` |
| `change_password` | `{ currentPassword, newPassword }` | `()` |
| `recover_password` | `{ username, recoveryCode, newPassword }` | `{ userId, username }` (cũng đăng nhập) |
| `delete_account` | `{ password }` | `()` — xóa user đang login + cascade data |

Mọi command nhận password dạng plaintext **chỉ trong IPC nội bộ** (cùng máy). Không ghi log argument.

---

## 5. Data model

Migration mới (sau `016` trên nhánh scaffold), mỗi file một statement vì giới hạn sqlx.

### 5.1 `accounts`

```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  recovery_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

- `username`: đã chuẩn hóa (trim, không đổi hoa/thường khi so khớp nhờ `NOCASE`; lưu **đúng như user gõ** sau trim).
- `password_hash` / `recovery_hash`: chuỗi PHC Argon2id (`$argon2id$v=19$...`). Không lưu plaintext, không lưu salt tách cột (salt nằm trong PHC).
- Không cột email. Không cột `verified`. Không cột `role`.

### 5.2 Gắn `user_id`

Thêm cột nullable `user_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE` vào:

- `pet_state`
- `user_progress`
- `learning_progress`
- `study_sessions`
- `daily_missions`

Unique/singleton theo user:

- `pet_state`: unique `(user_id)` — một pet / tài khoản.
- `user_progress`: unique `(user_id)`.
- `daily_missions`: không thêm UNIQUE mới. Query/insert vẫn theo semantics hiện tại, **luôn** lọc `user_id = session`. Index `(user_id, mission_date)`.

Index khác: `learning_progress(user_id, vocabulary_id)`, `study_sessions(user_id, answered_at)`.

`user_id` trên các bảng cũ là `NULL` được ở schema (SQLite không ALTER dễ thành `NOT NULL`). **Application rule:** mọi INSERT sau khi có session phải ghi `user_id`. SELECT tiến độ / pet / missions luôn `WHERE user_id = ?`. Hàng `user_id IS NULL` chỉ tồn tại như data orphan trước lần đăng ký đầu (mục 5.4).

### 5.3 Session

Bảng riêng — **không** ghi vào `settings.json` (file đó đang bị Zustand persist chiếm, `write_app_settings` ghi đè cả file).

```sql
CREATE TABLE app_session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  logged_in_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Tối đa một hàng (`id = 1`). Login = `INSERT OR REPLACE`. Logout = `DELETE FROM app_session`. `current_session` join `accounts`. Không JWT, không lưu password.

Xóa tài khoản đang login: FK cascade xóa `app_session` → coi như logout.

### 5.4 Migration data cũ

Scaffold seed một hàng `user_progress` trống (migration `016`) và chỉ insert `pet_state` sau onboarding.

1. Tạo `accounts` và `app_session`.
2. `ALTER TABLE ... ADD COLUMN user_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE` trên `pet_state`, `user_progress`, `learning_progress`, `study_sessions`, `daily_missions` (nullable).
3. **Không** tự tạo tài khoản ghost.
4. `register_account` **đầu tiên trên máy** (bảng `accounts` đang trống):
   - Singleton (`pet_state`, `user_progress`): nếu có đúng một hàng `user_id IS NULL`, gán `user_id` mới. Nếu không có hàng — không tạo pet ở đây (onboarding làm). Scaffold seed đúng một `user_progress`; `pet_state` có sau onboarding.
   - Không-singleton (`learning_progress`, `study_sessions`, `daily_missions`): `UPDATE ... SET user_id = ? WHERE user_id IS NULL`.
5. Đăng ký thứ hai trở đi: không claim orphan. Insert `user_progress` trống cho user mới; `pet_state` chỉ insert sau onboarding.

Hai tài khoản trên máy trống (chưa từng onboarding): user 1 claim hàng `user_progress` seed; user 2 được insert `user_progress` mới. Mỗi người chọn pet riêng.

---

## 6. Quy tắc username và password

### Username

| Rule | Giá trị |
| --- | --- |
| Độ dài | 3–24 ký tự sau trim |
| Ký tự | `A–Z a–z 0–9 _ .` — không dấu, không khoảng trắng |
| Unique | Không phân biệt hoa thường (`alice` = `Alice`) |
| Reserved | `admin`, `root`, `system`, `guest` — từ chối (tránh nhầm UI sau này) |
| Hiển thị | Đúng như lúc đăng ký (sau trim) |

Validate **cùng rule** ở TypeScript (UX tức thì) và Rust (nguồn sự thật). Rust thắng.

### Password

| Rule | Giá trị |
| --- | --- |
| Độ dài | 8–128 ký tự |
| Complexity | Không bắt buộc chữ hoa / số / ký tự đặc biệt |
| Confirm | Bắt buộc lúc đăng ký, đổi mật khẩu, khôi phục |
| Hash | Argon2id, params: memory 19 MiB, iterations 2, parallelism 1 (OWASP 2023 interactive). Đổi params = version trong PHC, verify cũ vẫn được |
| Cấm | Trùng username (so khớp không phân biệt hoa thường) |

Không meter “mạnh/yếu” phức tạp. Một dòng gợi ý: “Ít nhất 8 ký tự. Không dùng lại username.”

---

## 7. Flows

Copy UI: tiếng Việt. English chỉ là nội dung học (không xuất hiện trên auth).

### 7.1 Đăng ký (first run hoặc từ link “Tạo tài khoản”)

1. Form: Username, Mật khẩu, Nhập lại mật khẩu. Primary: **Tạo tài khoản**. Secondary: **Đã có tài khoản**.
2. Client validate → invoke `register_account`.
3. Thành công: hiện **màn hình mã khôi phục** (bắt buộc, không skip):
   - Mã 16 ký tự, nhóm 4×4, charset Crockford Base32 không nhầm `0/O/1/I`.
   - Copy: “Lưu mã này. Không có email để gửi lại. Mất mật khẩu và mất mã thì không lấy lại được pet.”
   - Checkbox “Tôi đã lưu mã” mới enable **Tiếp tục**.
   - Nút **Sao chép**.
4. Tiếp tục → session đã set lúc register → **Onboarding chọn pet** (màn hiện tại). Claim data cũ nếu đã có pet thì **bỏ** onboarding.
   - `register_account` ghi `app_session` ngay (trước khi UI hiện mã). Nếu app tắt lúc đang xem mã: lần sau vẫn login; mã plaintext đã mất — user vẫn vào được bằng password vừa tạo.
5. Lỗi username trùng: “Tên này đã dùng trên máy. Chọn tên khác hoặc đăng nhập.”

Mã khôi phục: Rust generate, hash Argon2id vào `recovery_hash`, trả plaintext **một lần** trong response. Không ghi plaintext ra disk / log.

### 7.2 Đăng nhập

1. Form: Username, Mật khẩu. Primary: **Đăng nhập**. Links: **Tạo tài khoản**, **Quên mật khẩu**.
2. Sai username hoặc sai password: **cùng** message “Username hoặc mật khẩu không đúng.” (không tiết lộ user có tồn tại).
3. Đúng: ghi `app_session`, vào Home (hoặc Onboarding nếu chưa có pet).
4. Sau 5 lần sai liên tiếp **cùng username** trong 5 phút: khóa 30 giây. Message: “Thử lại sau 30 giây.” Đếm trong bộ nhớ process (đủ cho MVP desktop); reset khi login đúng hoặc restart app.

### 7.3 Giữ phiên / mở lại app

- Có hàng `app_session` join được `accounts` → không hiện auth. Popup học bình thường.
- Không có session / user đã xóa → AuthGate.
- Không hỏi lại password khi hiện popup hay khi máy sleep.

### 7.4 Đăng xuất

Từ Home: menu nhỏ cạnh tên username (góc, không tranh “Học ngay”) → **Đăng xuất**. Confirm một dòng: “Pet vẫn trên máy. Đăng nhập lại để học tiếp.” → `logout_account` → AuthGate.

Tray **Thoát** = quit process, **không** logout (lần mở sau vẫn vào Home). Đây là lựa chọn có chủ đích: tray app, không phải ngân hàng.

### 7.5 Đổi mật khẩu (đã login)

Home → menu tài khoản → **Đổi mật khẩu**: mật khẩu hiện tại, mật khẩu mới, nhập lại. Thành công: toast “Đã đổi mật khẩu.” Session giữ nguyên. Mã khôi phục **không** đổi.

### 7.6 Quên mật khẩu

AuthGate → **Quên mật khẩu**: username + mã khôi phục + mật khẩu mới + nhập lại.

- Sai mã hoặc sai username: “Không khôi phục được. Kiểm tra username và mã.”
- Đúng: hash password mới, **đăng nhập luôn**.
- Không cấp mã khôi phục mới trong flow này (YAGNI). User đã login có thể không rotate recovery trong MVP.

Mất cả password lẫn mã: không có đường cứu. Copy trên màn quên mật khẩu nói rõ. Không “xóa AppData” như hướng dẫn mặc định trên UI (người rành có thể tự xóa file DB — không document trên màn hình học).

### 7.7 Xóa tài khoản

Home → menu → **Xóa tài khoản**: gõ lại password + gõ username để confirm. Cascade xóa pet, progress, sessions, missions của user đó. User khác trên máy không bị ảnh hưởng. Về AuthGate.

---

## 8. UI (Warm Companion)

Không thêm route mới. Auth là view trong main WebView, cùng 880×640.

**Không** dùng visual companion / demo HTML trong spec này — auth là form ngắn, không phải so layout. Implementation lần sau dùng token PR #3:

- Nền `--stone-25`, panel trắng `--radius-lg`, primary `--terracotta-700` chữ trắng.
- Be Vietnam Pro 16px+. Focus ring `--focus`.
- Một PrimaryButton mỗi màn.
- Password field: type password + nút hiện/ẩn (icon Lucide `Eye` / `EyeOff`, `aria-label` “Hiện mật khẩu”).
- Lỗi: `--rose-50` well + text `--rose-700`, không chỉ màu.
- Username trên Home: `text-sm` `--stone-500`, không phải hero.

Màn hình (thứ tự):

1. **Đăng nhập** — mặc định khi đã có ≥1 account trên máy và chưa session.
2. **Đăng ký** — mặc định khi 0 account; cũng tới được từ link.
3. **Mã khôi phục** — chỉ sau register thành công, chặn back (tránh mất mã). Nút back bị disable.
4. **Quên mật khẩu**
5. **Đổi mật khẩu** / **Xóa tài khoản** — overlay/panel trên Home, không full-page marketing.

First-run copy:

- H1 đăng ký: “Tạo tài khoản”
- Sub: “Chỉ cần tên và mật khẩu. Không cần email.”
- H1 đăng nhập: “Chào lại”
- Sub: “Đăng nhập để gặp lại pet.”

---

## 9. Error handling

| Tình huống | Hành vi |
| --- | --- |
| Username trống / ngắn / ký tự lạ | Inline dưới field, không gọi Rust |
| Password < 8 hoặc > 128 | Inline |
| Confirm không khớp | Inline “Hai mật khẩu chưa giống nhau.” |
| Username trùng | Sau invoke, message mục 7.1 |
| Login sai | Message chung; lockout mục 7.2 |
| Recovery sai | Message chung mục 7.6 |
| DB locked / disk đầy | “Không lưu được tài khoản. Kiểm tra dung lượng đĩa.” + giữ form |
| Command panic | Không crash UI; toast lỗi generic “Có lỗi. Thử lại.” |

Không stack trace trên UI.

---

## 10. Security notes (đủ cho local MVP)

1. Hash và verify **chỉ trong Rust**. Frontend không `SELECT password_hash`.
2. Argon2id PHC string; `argon2::verify_encoded` (constant-time theo lib).
3. IPC password không đi mạng. Vẫn không `console.log` form values; không persist form.
4. Recovery code entropy: 16 char Crockford ≈ 80 bit — đủ chống đoán trên máy local.
5. Lockout 5/30s — chống anh/chị/em thử password, không chống attacker có file DB (họ hash-offline được; đó là giới hạn local-app, chấp nhận).
6. Không SQL string từ username (parameterized).
7. `delete_account` và `change_password` yêu cầu password hiện tại.
8. Không secret trên GitHub. Argon2 params hardcode trong Rust.

Không OS keyring trong MVP (thêm dependency, khác Windows/macOS). Session = một hàng `app_session` là đủ: app không phải password manager. Ai đã unlock OS thì mở được DB — password chỉ tách **hồ sơ**, không mã hóa file SQLite.

**Mã hóa DB (SQLCipher) = non-goal.** Nếu cần sau này, đó là spec riêng.

---

## 11. Testing

Pure tests (chạy `pnpm test` / `cargo test`, không cần GUI):

| Case | Layer |
| --- | --- |
| Username: accept `minh.anh_1`, reject `ab`, `a b`, `minh@anh`, `Admin` | TS + Rust |
| Password: reject 7 chars, reject = username, accept 8 chars | TS + Rust |
| Register unique NOCASE: `Minh` rồi `minh` fail | Rust |
| Login wrong password / unknown user → cùng error code | Rust |
| Recovery đúng đổi pass; recovery sai không đổi | Rust |
| First register claims orphan `pet_state` | Rust |
| Second user không thấy `learning_progress` của user 1 | Rust |
| Logout clears session; `current_session` null | Rust |
| Lockout after 5 failures | Rust |

UI: không bắt Cypress cho MVP. Manual: đăng ký → thấy mã → onboarding → logout → login → home cùng pet.

---

## 12. Thứ tự implement (khi spec được duyệt)

Không làm trong PR này. PR này **chỉ spec**.

1. Tests cho validate + auth commands (TDD).
2. Migration `accounts` + `user_id` + claim logic.
3. Rust commands.
4. AuthGate + forms (Warm Companion tokens).
5. Home: username + menu đăng xuất / đổi mật khẩu / xóa.
6. Popup + scheduler: chặn khi chưa session.
7. `pnpm test` + `cargo test` auth.

---

## 13. Open questions đã chốt (không để mở)

| Câu hỏi | Chốt |
| --- | --- |
| Local hay cloud? | Local (A) |
| Bắt buộc tài khoản hay khách? | Bắt buộc |
| Hỏi password mỗi lần mở app? | Không |
| Quên mật khẩu? | Mã khôi phục một lần lúc đăng ký |
| Nhiều user / máy? | Có, isolated |
| Email sau này? | Ngoài spec; schema không có cột email để khỏi “điền tạm” |

Nếu người dùng muốn cloud sync, viết spec mới — không nhồi vào vòng này.
