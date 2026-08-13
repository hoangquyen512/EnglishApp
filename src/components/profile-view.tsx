"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LEVEL_LABELS, PET_NAME } from "@/lib/constants";
import type { Level, Mood } from "@/lib/constants";

export function ProfileView(props: {
  displayName: string;
  level: Level;
  mood: Mood;
  moodNote: string | null;
}) {
  return (
    <section className="screen profile">
      <p className="eyebrow">Hồ sơ</p>
      <h2>{props.displayName}</h2>
      <p className="lede">
        {PET_NAME} nhớ mood và chủ đề qua từng ngày — không cần chọn icon.
      </p>
      <div className="card">
        <strong>Trình độ hiện tại</strong>
        <span>App tự ước lượng từ cách bạn nói</span>
        <div className="level">{LEVEL_LABELS[props.level]}</div>
      </div>
      <div className="card">
        <strong>Mood gần nhất</strong>
        <span>{props.moodNote || "Chưa rõ — Sora sẽ hỏi nhẹ khi chưa chắc."}</span>
      </div>
      <Link className="primary" href="/chat" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
        Quay lại đoạn chat
      </Link>
      <button className="danger" type="button" onClick={() => void signOut({ callbackUrl: "/login" })}>
        Đăng xuất
      </button>
    </section>
  );
}
