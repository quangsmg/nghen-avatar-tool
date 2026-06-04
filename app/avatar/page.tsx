import type { Metadata } from "next";
import { AvatarStudio } from "@/components/AvatarStudio";

export const metadata: Metadata = {
  title: "Tạo avatar — Cuộc hẹn 20 năm | THPT Nghèn",
  description:
    "Công cụ ghép ảnh vào khung avatar Facebook — Cuộc hẹn 20 năm, THPT Nghèn khóa 2003-2006.",
};

export default function AvatarPage() {
  return <AvatarStudio />;
}
