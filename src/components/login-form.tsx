"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_NAME, PET_NAME } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Không đăng ký được");
          return;
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(mode === "login" ? "Email hoặc mật khẩu chưa đúng" : "Đăng nhập sau đăng ký thất bại");
        return;
      }
      router.push("/chat");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="screen auth">
      <p className="eyebrow">{APP_NAME}</p>
      <h2>Một người bạn hỏi thăm mỗi ngày.</h2>
      <p className="lede">
        Nói chuyện bằng tiếng Anh. {PET_NAME} lắng nghe — học khi bạn muốn, không khi bạn đang tâm sự.
      </p>
      <form onSubmit={onSubmit}>
        {error ? <p className="error">{error}</p> : null}
        {mode === "register" ? (
          <div className="field">
            <label htmlFor="name">Tên hiển thị</label>
            <input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pass">Mật khẩu</label>
          <input
            id="pass"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="primary" type="submit" disabled={pending}>
          {pending ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>
      <button
        className="ghost"
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
      >
        {mode === "login" ? "Tạo tài khoản" : "Đã có tài khoản? Đăng nhập"}
      </button>
    </section>
  );
}
