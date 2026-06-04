import type { Metadata } from "next";
import { CountdownStudio } from "@/components/CountdownStudio";

export const metadata: Metadata = {
  title: "Ảnh đếm ngược — Cuộc hẹn 20 năm | THPT Nghèn",
  description:
    "Tạo ảnh đếm ngược tới ngày hội khóa 18/07/2026 kèm câu quote cảm động — Cuộc hẹn 20 năm, THPT Nghèn khóa 2003-2006.",
};

export default function CountdownPage() {
  return <CountdownStudio />;
}
