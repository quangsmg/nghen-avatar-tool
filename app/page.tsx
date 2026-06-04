import type { Metadata } from "next";
import { MiniGame } from "@/components/MiniGame";

export const metadata: Metadata = {
  title: "Đua Top Sĩ Số — Cuộc hẹn 20 năm | THPT Nghèn",
  description:
    "Điểm danh đua top theo lớp và theo hội — Cuộc hẹn 20 năm, hội khóa 2003-2006 THPT Nghèn. Đăng nhập Facebook, chọn lớp, chọn hội và check-in!",
};

export default function Home() {
  return <MiniGame />;
}
