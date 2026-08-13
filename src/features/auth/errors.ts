export function errorCode(err: unknown): string {
  if (typeof err === "string") {
    return err;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return "unknown";
}

const MESSAGES: Record<string, string> = {
  invalid_username: "Username 3–24 ký tự, chỉ chữ, số, dấu chấm và gạch dưới.",
  reserved_username: "Tên này không dùng được.",
  invalid_password: "Ít nhất 8 ký tự. Không dùng lại username.",
  password_matches_username: "Mật khẩu không được trùng username.",
  username_taken: "Tên này đã dùng trên máy. Chọn tên khác hoặc đăng nhập.",
  auth_failed: "Username hoặc mật khẩu không đúng.",
  lockout: "Thử lại sau 30 giây.",
  reset_failed: "Không gửi được. Kiểm tra username và email.",
  mail_not_configured: "Chưa cấu hình gửi email. Không gửi được mật khẩu mặc định.",
  mail_send_failed: "Không gửi được email. Thử lại.",
  default_password_wrong: "Mật khẩu mặc định không đúng.",
  password_same_as_default: "Chọn mật khẩu khác mật khẩu mặc định.",
  invalid_email: "Email không hợp lệ.",
  invalid_display_name: "Tối đa 40 ký tự.",
  invalid_avatar: "Chỉ nhận JPEG, PNG hoặc WebP.",
  avatar_too_large: "Ảnh tối đa 2 MB.",
  not_logged_in: "Hãy đăng nhập.",
  confirm_mismatch: "Hai mật khẩu chưa giống nhau.",
  disk_full: "Không lưu được tài khoản. Kiểm tra dung lượng đĩa.",
};

export function errorMessage(err: unknown): string {
  const code = errorCode(err);
  return MESSAGES[code] ?? "Có lỗi. Thử lại.";
}
