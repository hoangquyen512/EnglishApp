# Vocab Pet — Demo màn tài khoản

Mock Warm Companion (không phải app Tauri). Cùng token với demo nhà/pet.

```bash
# from repo root
python3 -m http.server 8765
```

Mở [http://localhost:8765/docs/uiux-demo/account.html](http://localhost:8765/docs/uiux-demo/account.html)

Hoặc mở `account.html` trực tiếp.

| Query | Màn |
| --- | --- |
| `login` | Đăng nhập |
| `register` | Tạo tài khoản (từ link trên login) |
| `forgot` | Quên mật khẩu — username + email |
| `forgot2` | Đặt mật khẩu mới (sau gửi mail) |
| `home` | Nhà — chip avatar/tên vào tài khoản |
| `account` | Thông tin tài khoản (xem) |
| `edit` | Chỉnh sửa thông tin |
| `logout` | Dialog đăng xuất |
| `changepw` | Dialog đổi mật khẩu |

`?shot=1` ẩn thanh chuyển màn (chụp ảnh).
