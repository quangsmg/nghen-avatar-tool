import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Cuộc hẹn 20 năm | THPT Nghèn khóa 2003-2006",
  description:
    "Bộ công cụ hội khóa: Đua Top Sĩ Số, khung avatar và ảnh đếm ngược — Cuộc hẹn 20 năm, THPT Nghèn khóa 2003-2006.",
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
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
