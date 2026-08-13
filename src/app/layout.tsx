import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — hỏi thăm hàng ngày`,
  description: "Nói chuyện tiếng Anh với Sora mỗi ngày.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650&family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <Providers>
          <div className="phone">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
