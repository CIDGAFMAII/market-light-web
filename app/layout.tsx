import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Light",
  description: "基於 ESP32 OLED 與 RGB 提醒的低干擾市場小助手。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
