# Vocab Pet — Account Design Spec (username + password)

Date: 2026-08-13  
Product: Vocab Pet (repo `EnglishApp`)  
Status: Ready for review (revision 2)  
Scope: Tài khoản tối giản. Đăng ký / đăng nhập chỉ username + password. **Không** verify email, không OAuth, không server đồng bộ. Email **chỉ** dùng cho quên mật khẩu.

Spec này là nguồn sự thật cho chức năng tài khoản. Nó **không** đổi pet XP/mood/missions, SRS, tray, popup 400×500, hay installer. Những phần đó vẫn khóa trong `docs/ARCHITECTURE.md` (PR #2) và UI Warm Companion (PR #3).

**Revision 2:** quên mật khẩu không còn mã khôi phục. User nhập email → hệ thống gửi **mật khẩu mặc định** tới mail, lưu email vào account; lần quên sau phải nhập **đúng email đã lưu**. Sau khi gửi mail, hiện form: mật khẩu mặc định + mật khẩu mới + nhập lại → đổi mật khẩu.

---

## 1. Context

Vocab Pet hiện là app desktop **một người / một máy**: SQLite local, onboarding = chọn pet, không có khái niệm đăng nhập. `pet_state` và `user_progress` là bảng singleton (một hàng, không `user_id`).

Yêu cầu sản phẩm:

1. Đăng ký / đăng nhập: chỉ username và password. Không bắt email lúc tạo tài khoản. Không verify email.
2. Quên mật khẩu: nhập email → gửi mật khẩu mặc định tới email đó → lưu email vào thông tin account. Lần quên tiếp theo phải nhập **đúng email đã lưu**. Sau nút gửi mail: màn hình mật khẩu mặc định, mật khẩu mới, nhập lại mật khẩu mới, đổi mật khẩu.

Tên agent: **Chức năng tài khoản tối giản**.

### 1.1 Constraints đã khóa

| Constraint | Implication |
| --- | --- |
| Không email lúc đăng ký | Form đăng ký không có field email. Cột `accounts.email` bắt đầu `NULL` |
| Không verify email | Không link xác nhận, không OTP, không chặn login vì email chưa confirm |
| Email chỉ khi quên mật khẩu | Cần SMTP (mạng) **cho flow này**; đăng ký / đăng nhập vẫn offline |
| Desktop local-first (Tauri + SQLite) | Account vẫn local; không backend user-directory. Mailer là lệnh gửi SMTP từ app |
| Máy dùng chung có thể xảy ra | Username unique **trên máy này**; data tách theo tài khoản |
| Warm Companion UI | Màn hình auth cùng token (Be Vietnam Pro, terracotta-700, cream) |

### 1.2 Giả định đã chốt

1. Sản phẩm là **Vocab Pet desktop**, không phải web app riêng.
2. Tài khoản **bắt buộc** — không chế độ khách. Lần mở đầu tiên = đăng ký, rồi chọn pet.
3. Một máy có thể có **nhiều tài khoản**.
4. Phiên **giữ đến khi bấm Đăng xuất** (popup không hỏi password).
5. Cloud sync, OAuth, Google login — **không** thuộc spec này.
6. Đổi username — **không**.
7. Copy UI tiếng Việt.
8. Màn quên mật khẩu có **username + email**. Username chọn đúng account (lúc đăng ký chưa có email, không thể tìm account chỉ bằng mail lần đầu).
9. **Mật khẩu mặc định** = mật khẩu tạm hệ thống **sinh mới mỗi lần gửi** (8 ký tự, dễ gõ). Không phải một chuỗi cố định cho mọi user (`123456`). Hash Argon2id **thay** `password_hash` hiện tại khi gửi mail thành công — password cũ hết hiệu lực.
10. Màn sau khi gửi có **ba ô nhập** (mật khẩu mặc định / mật khẩu mới / nhập lại). App **không** hiện plaintext mật khẩu mặc định trên UI — user đọc trong hộp thư. Field không pre-fill.
11. Gửi mail thất bại → **không** lưu email, **không** đổi password.

---

## 2. Goal / non-goal

**Goal**

- Tạo tài khoản bằng username + password, rồi onboarding pet như hiện tại.
- Lần sau: đăng nhập bằng cặp đó để thấy pet và tiến độ của mình.
- Đăng xuất → màn đăng nhập. Tài khoản khác trên cùng máy không thấy data của nhau.
- Quên mật khẩu theo flow email + mật khẩu mặc định (mục 7.6).

**Non-goal (cấm lọt vào PR implementation)**

- Bắt nhập email lúc đăng ký; link verify; OTP; captcha; OAuth; 2FA.
- Server user-directory, đồng bộ nhiều máy, JWT cloud.
- Mã khôi phục (Crockford) — **đã bỏ** ở revision 2.
- Reset qua SMS / admin.
- Phân quyền (admin / teacher / student).
- Xuất file GDPR khi xóa — chỉ cascade local (mục 7.7).
- Đổi username. Avatar / profile social.
- Hỏi password mỗi lần mở popup.

---

## 3. Ba hướng — trade-off và khuyến nghị

### A. Hồ sơ local + SMTP cho quên mật khẩu (khuyến nghị)

Username + password trong SQLite trên máy. Hash Argon2id ở **Rust**. Quên mật khẩu: app gửi SMTP (crate `lettre`) tới email user nhập.

| Ưu | Nhược |
| --- | --- |
| Đăng ký / login khớp kiến trúc hiện tại, offline | Username unique chỉ trên **máy này** |
| Đúng flow email người dùng mô tả | Cần cấu hình SMTP; quên mật khẩu cần mạng |
| Nhiều hồ sơ trên một máy | SMTP credentials phải nằm ngoài git |
| Không host user-server | Ai có file DB vẫn hash-offline được (giới hạn local-app) |

**Chọn A.** Account vẫn local. Chỉ thêm mailer cho một flow.

### B. Backend username + password + mailer trên server

API `register` / `login` / `forgot`. Email và hash nằm server.

| Ưu | Nhược |
| --- | --- |
| Đăng nhập nhiều máy | Phạm vi lớn: host, TLS, backup |
| SMTP không nhét vào app cài | Phá offline ngay cả login |
| | Không khớp “tối giản” / desktop local-first |

**Không chọn** vòng này.

### C. Mã khôi phục local (revision 1)

Hiện mã một lần lúc đăng ký, không email.

**Không chọn** — người dùng đã thay bằng gửi mật khẩu mặc định qua email.

**Quyết định:** ship **Approach A**, với flow quên mật khẩu revision 2.

---

## 4. Architecture

Auth sống ở **Rust** (hash, verify, session, gửi mail). TypeScript chỉ gọi command và render form. JS **không** hash password, **không** nhận `password_hash`, **không** nhận plaintext mật khẩu mặc định từ command gửi mail.

```
┌─────────────────────────────────────────────────────────────┐
│  Main window (880×640)                                      │
│   chưa session → AuthGate (Đăng nhập | Đăng ký | Quên MK)   │
│   có session, chưa pet → Onboarding (chọn pet) — giữ nguyên │
│   có session, có pet   → Home                               │
└────────────────────────────┬────────────────────────────────┘
                             │ invoke
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Rust: commands/auth.rs + mailer.rs                         │
│   register / login / logout / change_password               │
│   request_password_reset / confirm_password_reset           │
│   current_session / update_account_email                    │
│   Argon2id; SMTP via lettre                                 │
└────────────────────────────┬────────────────────────────────┘
                             ▼
              sqlite:vocab_pet.db
              accounts (username, password_hash, email)
              app_session + user_id trên bảng tiến độ
              settings.json không chứa session
                             │
                             ▼
              SMTP  →  hộp thư user  (mật khẩu mặc định)
```

Popup **không** có màn hình auth. Tray **Học ngay** khi chưa login: popup copy “Mở app để đăng nhập” + đóng. Scheduler khi chưa login: **không** bắn notification.

### 4.1 Thành phần

| Unit | Việc | API công khai | Phụ thuộc |
| --- | --- | --- | --- |
| `commands/auth.rs` | Đăng ký, login, logout, đổi MK, reset, session | commands dưới đây | SQLite, Argon2id, `mailer` |
| `mailer.rs` | Gửi một loại mail: mật khẩu mặc định | `send_default_password(to, username, default_password)` | SMTP env |
| `db/accounts.ts` | Đọc session cho UI (không SQL password) | `getCurrentAccount()` | `current_session` |
| `features/auth` | Validate username / password / email format | `validateUsername`, `validatePassword`, `validateEmail` | không |
| `components/auth/*` | AuthGate, Login, Register, ForgotEmail, ForgotChangePassword | props onSubmit | `features/auth` + invoke |
| `AuthGate` (main) | Cây: auth / onboarding / home | wrap App | session + `pet_state` |

`mailer.rs` không biết SQLite. `auth.rs` không nói SMTP host — chỉ gọi `send_default_password`. Test auth bằng mailer fake.

### 4.2 Rust commands

| Command | Input | Output |
| --- | --- | --- |
| `register_account` | `{ username, password }` | `{ userId, username, email: null }` |
| `login_account` | `{ username, password }` | `{ userId, username, email }` |
| `logout_account` | none | `()` |
| `current_session` | none | `{ userId, username, email } \| null` |
| `change_password` | `{ currentPassword, newPassword }` | `()` — đã login |
| `request_password_reset` | `{ username, email }` | `{ ok: true }` — **không** trả mật khẩu mặc định |
| `confirm_password_reset` | `{ username, defaultPassword, newPassword }` | `{ userId, username, email }` (đăng nhập luôn) |
| `update_account_email` | `{ password, email }` | `{ email }` — đã login; đổi / gán email |
| `delete_account` | `{ password }` | `()` |

Mọi password / default password chỉ đi IPC nội bộ. Không log argument. `request_password_reset` thành công **không** set `app_session` — user phải hoàn tất màn đổi mật khẩu (hoặc login bằng mật khẩu mặc định vừa nhận).

### 4.3 SMTP

Biến môi trường (không commit, không nhét vào binary public):

| Biến | Vai trò |
| --- | --- |
| `VOCABPET_SMTP_HOST` | Host, ví dụ `smtp.gmail.com` |
| `VOCABPET_SMTP_PORT` | Mặc định `587` STARTTLS |
| `VOCABPET_SMTP_USER` | SMTP user |
| `VOCABPET_SMTP_PASS` | SMTP password / app password |
| `VOCABPET_SMTP_FROM` | From, ví dụ `Vocab Pet <noreply@...>` |

Thiếu config: `request_password_reset` trả lỗi `mail_not_configured` → UI “Chưa cấu hình gửi email. Không gửi được mật khẩu mặc định.”

Mail:

- Subject: `Mật khẩu mặc định Vocab Pet`
- Body (text): chào, username, mật khẩu mặc định, “Mở app → Quên mật khẩu (bước 2) hoặc Đăng nhập bằng mật khẩu này, rồi đổi mật khẩu mới.”
- Không HTML marketing.

---

## 5. Data model

Migration mới (sau `016` trên nhánh scaffold), mỗi file một statement vì giới hạn sqlx.

### 5.1 `accounts`

```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

- `username`: trim; so khớp `NOCASE`; lưu đúng như user gõ sau trim.
- `password_hash`: PHC Argon2id. Không plaintext, không salt tách cột.
- `email`: `NULL` đến lần quên mật khẩu đầu (hoặc đến lúc user cập nhật khi đã login). So khớp `NOCASE`. Lưu lowercase sau trim (tránh `A@x.com` vs `a@x.com` lúc “phải đúng email”).
- Không cột `verified`. Không `recovery_hash`. Không `role`.
- Không UNIQUE bắt buộc trên `email` (nhiều account `NULL`; quên MK luôn kèm username). Index thường `(email)` để lookup.

### 5.2 Gắn `user_id`

Thêm cột nullable `user_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE` vào:

- `pet_state`
- `user_progress`
- `learning_progress`
- `study_sessions`
- `daily_missions`

Unique/singleton theo user:

- `pet_state`: unique `(user_id)` — một pet / tài khoản. SQLite cho nhiều `NULL`.
- `user_progress`: unique `(user_id)`.
- `daily_missions`: không thêm UNIQUE mới. Query/insert lọc `user_id = session`. Index `(user_id, mission_date)`.

Index khác: `learning_progress(user_id, vocabulary_id)`, `study_sessions(user_id, answered_at)`.

`user_id` nullable ở schema (SQLite khó ALTER thành `NOT NULL`). **Application rule:** INSERT sau khi có session phải có `user_id`. SELECT tiến độ / pet / missions luôn `WHERE user_id = ?`.

### 5.3 Session

Không ghi `settings.json` (Zustand persist chiếm file).

```sql
CREATE TABLE app_session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  logged_in_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Tối đa một hàng (`id = 1`). Login / `confirm_password_reset` = `INSERT OR REPLACE`. Logout = `DELETE`. Xóa account đang login: cascade xóa session.

### 5.4 Migration data cũ

Scaffold seed một hàng `user_progress` trống (`016`); `pet_state` chỉ sau onboarding.

1. Tạo `accounts` và `app_session`.
2. `ALTER TABLE ... ADD COLUMN user_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE` trên năm bảng trên (nullable).
3. Không tạo tài khoản ghost.
4. `register_account` **đầu tiên** (`accounts` đang trống):
   - Singleton (`pet_state`, `user_progress`): nếu đúng một hàng `user_id IS NULL`, gán `user_id` mới.
   - Không-singleton: `UPDATE ... SET user_id = ? WHERE user_id IS NULL`.
5. Đăng ký sau: không claim orphan. Insert `user_progress` trống; `pet_state` sau onboarding.

---

## 6. Quy tắc username, password, email

### Username

| Rule | Giá trị |
| --- | --- |
| Độ dài | 3–24 sau trim |
| Ký tự | `A–Z a–z 0–9 _ .` — không dấu, không khoảng trắng |
| Unique | Không phân biệt hoa thường (`alice` = `Alice`) |
| Reserved | `admin`, `root`, `system`, `guest` |
| Hiển thị | Đúng lúc đăng ký (sau trim) |

Validate TS (UX) và Rust (nguồn sự thật). Rust thắng.

### Password (mật khẩu user chọn)

| Rule | Giá trị |
| --- | --- |
| Độ dài | 8–128 |
| Complexity | Không bắt chữ hoa / số / ký tự đặc biệt |
| Confirm | Bắt buộc lúc đăng ký, đổi MK (đã login), màn sau gửi mail |
| Hash | Argon2id, memory 19 MiB, iterations 2, parallelism 1 (OWASP 2023 interactive) |
| Cấm | Trùng username (NOCASE) |

Gợi ý UI: “Ít nhất 8 ký tự. Không dùng lại username.”

### Mật khẩu mặc định (hệ thống sinh)

| Rule | Giá trị |
| --- | --- |
| Độ dài | đúng 8 |
| Charset | `A–Z` trừ `I O`, `a–z` trừ `l`, `2–9` — tránh nhầm ký tự khi đọc mail |
| TTL | Là password hiện tại của account cho đến khi user đổi (màn 7.6 bước 2 hoặc Đổi mật khẩu khi đã login) |
| Không | Trả về frontend từ `request_password_reset`; không ghi plaintext ra disk / log |

### Email

| Rule | Giá trị |
| --- | --- |
| Format | Một `@`, local + domain có dấu `.`, không khoảng trắng; max 254 |
| Lưu | `trim` + lowercase |
| Lần quên đầu | `accounts.email IS NULL` → nhận email này, lưu nếu gửi SMTP thành công |
| Lần quên sau | Phải **trùng** `accounts.email` (đã lowercase) |
| Đăng ký | Không có field |

---

## 7. Flows

Copy UI: tiếng Việt.

### 7.1 Đăng ký

1. Form: Username, Mật khẩu, Nhập lại mật khẩu. Primary: **Tạo tài khoản**. Secondary: **Đã có tài khoản**. **Không** field email.
2. Validate → `register_account`.
3. Thành công: `app_session` set → Onboarding chọn pet. Claim data cũ nếu đã có pet thì bỏ onboarding.
4. Username trùng: “Tên này đã dùng trên máy. Chọn tên khác hoặc đăng nhập.”

### 7.2 Đăng nhập

1. Form: Username, Mật khẩu. Primary: **Đăng nhập**. Links: **Tạo tài khoản**, **Quên mật khẩu**.
2. Sai username hoặc sai password: cùng câu “Username hoặc mật khẩu không đúng.”
3. Đúng: ghi `app_session` → Home (hoặc Onboarding nếu chưa pet).
4. 5 lần sai liên tiếp cùng username trong 5 phút: khóa 30 giây. Đếm in-memory; reset khi login đúng hoặc restart app.

Sau khi `request_password_reset` thành công, mật khẩu cũ không còn. User có thể **Đăng nhập** bằng mật khẩu mặc định trong mail, hoặc đi tiếp bước 2 của quên mật khẩu.

### 7.3 Giữ phiên / mở lại app

- Có `app_session` join được `accounts` → không hiện auth.
- Không session / user đã xóa → AuthGate.
- Không hỏi lại password khi hiện popup hay máy sleep.

### 7.4 Đăng xuất

Home: menu cạnh username → **Đăng xuất**. Confirm: “Pet vẫn trên máy. Đăng nhập lại để học tiếp.” → AuthGate.

Tray **Thoát** = quit process, **không** logout.

### 7.5 Đổi mật khẩu (đã login)

Menu tài khoản → **Đổi mật khẩu**: mật khẩu hiện tại, mật khẩu mới, nhập lại. Toast “Đã đổi mật khẩu.” Session giữ nguyên. Email không đổi.

### 7.6 Quên mật khẩu

Hai màn, không skip màn 2 về login bằng back **sau khi đã gửi thành công** — có link “Đăng nhập” nếu user muốn vào bằng mật khẩu mặc định.

**Màn 1 — nhập email**

- Fields: Username, Email.
- Primary: **Gửi mail**.
- Secondary: **Quay lại đăng nhập**.
- Copy: “Lần đầu: email này sẽ lưu vào tài khoản. Lần sau phải dùng đúng email đó.”

`request_password_reset`:

| Tình huống | Hành vi |
| --- | --- |
| Username không tồn tại | Cùng lỗi generic: “Không gửi được. Kiểm tra username và email.” Không tiết lộ user có hay không. Vẫn tốn ~cùng thời gian (hash dummy / delay) |
| Username có, `email` đang `NULL`, format email hợp lệ | Sinh mật khẩu mặc định → **gửi SMTP** → thành công thì `password_hash` = hash mặc định, `email` = email đã lowercase, `updated_at` now. Rồi mở màn 2 |
| Username có, `email` đã có, input **trùng** | Sinh mặc định mới → gửi → thành công thì cập nhật `password_hash` (email giữ nguyên). Mở màn 2 |
| Username có, `email` đã có, input **khác** | Generic “Không gửi được. Kiểm tra username và email.” Không gửi, không đổi hash |
| SMTP fail / chưa cấu hình | Không lưu email, không đổi hash. Message cụ thể: chưa cấu hình / “Không gửi được email. Thử lại.” |
| Email format sai | Inline, không gọi Rust |

Gửi thành công: toast hoặc banner màn 2 “Đã gửi mật khẩu mặc định tới {email}.” (hiện đúng địa chỉ user vừa gõ, đã lowercase).

**Màn 2 — đổi mật khẩu** (sau **Gửi mail** thành công)

- Không hỏi lại username; UI giữ username + email từ màn 1 để gọi `confirm_password_reset`.
- Fields (cả ba type password + hiện/ẩn):
  1. **Mật khẩu mặc định** — user gõ từ mail, không pre-fill, không hiện giá trị hệ thống sinh
  2. **Mật khẩu mới**
  3. **Nhập lại mật khẩu mới**
- Primary: **Đổi mật khẩu**
- Link: **Đăng nhập** (nếu đã nhớ mặc định và muốn vào Home trước)

`confirm_password_reset`:

- Verify `defaultPassword` khớp `password_hash` hiện tại của username.
- `newPassword` theo rule mục 6; khác mật khẩu mặc định; confirm khớp (confirm chỉ check ở client + Rust so `newPassword`).
- Thành công: hash mật khẩu mới, set `app_session`, vào Home / Onboarding.
- Sai mặc định: “Mật khẩu mặc định không đúng.” Không tiết lộ thêm. Cùng lockout 5/30s theo username như login.

Không có đường “gửi lại” tự động trên màn 2. User **Quay lại** màn 1 và gửi lần nữa (mật khẩu mặc định mới, cái cũ trong mail hết hiệu lực khi gửi thành công lần sau).

### 7.7 Xóa tài khoản

Menu → **Xóa tài khoản**: password + gõ lại username. Cascade pet, progress, sessions, missions. AuthGate.

### 7.8 Email trên thông tin account (đã login)

Menu hiện email hoặc “Chưa lưu email”. **Cập nhật email**: mật khẩu hiện tại + email mới. `update_account_email` lưu lowercase. Lần quên sau phải dùng email mới. Không gửi mail xác nhận (vẫn không verify).

---

## 8. UI (Warm Companion)

Auth là view trong main WebView 880×640. Token PR #3:

- Nền `--stone-25`, panel trắng `--radius-lg`, primary `--terracotta-700` chữ trắng.
- Be Vietnam Pro 16px+. Focus ring `--focus`.
- Một PrimaryButton mỗi màn.
- Password: type password + Lucide `Eye` / `EyeOff`, `aria-label` “Hiện mật khẩu”.
- Lỗi: `--rose-50` + `--rose-700`, không chỉ màu.
- Username trên Home: `text-sm` `--stone-500`.

Màn hình:

1. **Đăng nhập** — mặc định khi ≥1 account, chưa session.
2. **Đăng ký** — mặc định khi 0 account.
3. **Quên mật khẩu màn 1** — username + email.
4. **Quên mật khẩu màn 2** — mặc định + mới + nhập lại.
5. **Đổi mật khẩu / Cập nhật email / Xóa tài khoản** — panel trên Home.

Copy:

- H1 đăng ký: “Tạo tài khoản”
- Sub: “Chỉ cần tên và mật khẩu. Không cần email.”
- H1 đăng nhập: “Chào lại”
- Sub: “Đăng nhập để gặp lại pet.”
- H1 quên màn 1: “Quên mật khẩu”
- H1 quên màn 2: “Đặt mật khẩu mới”

---

## 9. Error handling

| Tình huống | Hành vi |
| --- | --- |
| Username trống / ngắn / ký tự lạ | Inline, không gọi Rust |
| Password < 8 hoặc > 128 | Inline |
| Confirm không khớp | Inline “Hai mật khẩu chưa giống nhau.” |
| Email format sai | Inline “Email không hợp lệ.” |
| Username trùng lúc đăng ký | Mục 7.1 |
| Login sai | Message chung; lockout 7.2 |
| Reset màn 1 sai user/email | Generic mục 7.6 |
| Reset màn 2 sai mặc định | “Mật khẩu mặc định không đúng.” |
| SMTP / chưa cấu hình | Mục 7.6; account không đổi |
| Mật khẩu mới = mật khẩu mặc định | Inline “Chọn mật khẩu khác mật khẩu mặc định.” |
| DB locked / disk đầy | “Không lưu được tài khoản. Kiểm tra dung lượng đĩa.” |
| Command panic | Toast “Có lỗi. Thử lại.” Không stack trace |

---

## 10. Security notes

1. Hash / verify **chỉ Rust**. Frontend không `SELECT password_hash`.
2. Argon2id PHC; verify constant-time theo lib.
3. Không `console.log` form. Không persist form.
4. `request_password_reset` không trả plaintext mật khẩu mặc định.
5. Gửi SMTP **trước** khi commit email + hash mới. Fail → rollback (không commit).
6. Lockout 5/30s trên login và `confirm_password_reset`.
7. Username/email parameterized SQL.
8. `delete_account`, `change_password`, `update_account_email` cần password hiện tại.
9. SMTP secrets không trên GitHub.
10. Generic error màn 1 tránh dò username/email.

Giới hạn chấp nhận: mật khẩu mặc định 8 ký tự đi qua email (SMTP thường plaintext tới mailbox). Ai đọc được inbox thì reset được — đúng ý “chứng minh email”. App local không mã hóa DB.

**SQLCipher = non-goal.**

---

## 11. Testing

Mailer inject fake trong unit test (không SMTP thật).

| Case | Layer |
| --- | --- |
| Username: accept `minh.anh_1`, reject `ab`, `a b`, `minh@anh`, `Admin` | TS + Rust |
| Password: reject 7 chars, reject = username, accept 8 | TS + Rust |
| Email: accept `a.b@x.vn`, reject `a@b`, `a b@x.com` | TS + Rust |
| Register unique NOCASE | Rust |
| Register không ghi email | Rust |
| Login sai → cùng error code | Rust |
| Reset lần đầu: lưu email, đổi hash, gọi mailer 1 lần | Rust |
| SMTP fail lần đầu: email vẫn NULL, hash cũ | Rust |
| Reset lần 2 đúng email: gửi, hash mới | Rust |
| Reset lần 2 sai email: không gửi, hash không đổi | Rust |
| Username không tồn tại: không gửi, error generic | Rust |
| `confirm_password_reset` đúng mặc định + new → session | Rust |
| `confirm` sai mặc định → không đổi hash mới | Rust |
| First register claims orphan `pet_state` | Rust |
| User 2 không thấy progress user 1 | Rust |
| Logout clears session | Rust |
| Lockout after 5 failures | Rust |
| `update_account_email` rồi reset bằng email cũ fail | Rust |

Manual: đăng ký (không email) → logout → quên MK → nhận mail (môi trường có SMTP) → màn 2 → Home cùng pet.

---

## 12. Thứ tự implement (khi spec được duyệt)

Không làm trong PR này. PR này **chỉ spec**.

1. Tests validate + auth commands + fake mailer (TDD).
2. Migration `accounts` (có `email`) + `user_id` + claim.
3. Rust auth commands + `mailer.rs`.
4. AuthGate + đăng ký/đăng nhập + hai màn quên MK.
5. Home: username, email, menu đăng xuất / đổi MK / cập nhật email / xóa.
6. Popup + scheduler: chặn khi chưa session.
7. `pnpm test` + `cargo test` auth.

---

## 13. Open questions đã chốt

| Câu hỏi | Chốt |
| --- | --- |
| Local hay cloud account? | Local (A) |
| Email lúc đăng ký? | Không |
| Verify email? | Không |
| Quên mật khẩu? | Email + mật khẩu mặc định gửi mail; lần sau phải đúng email đã lưu |
| Hiện plaintext mặc định trên app? | Không — chỉ trong email; màn 2 là ô nhập |
| Mật khẩu mặc định cố định mọi user? | Không — sinh 8 ký tự mỗi lần gửi |
| Quên MK có username? | Có (bind account khi chưa có email) |
| Bắt buộc tài khoản? | Có |
| Hỏi password mỗi lần mở app? | Không |
| Nhiều user / máy? | Có, isolated |

SMTP credentials cần khi implement (không phải lúc review spec).
