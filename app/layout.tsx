import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tạo avatar — Cuộc hẹn 20 năm | THPT Nghèn",
  description:
    "Công cụ ghép ảnh vào khung avatar Facebook — Cuộc hẹn 20 năm, THPT Nghèn khóa 2003-2006.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
