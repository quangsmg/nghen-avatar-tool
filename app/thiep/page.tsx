import type { Metadata } from "next";
import { Invitation, IMG, POS } from "./Invitation";

type SP = {
  ten?: string;
  x?: string;
  y?: string;
  size?: string;
};

const DESC =
  "Trân trọng kính mời Thầy/Cô tới dự ngày hội ngộ Cuộc hẹn 20 năm — Hội khóa 2003-2006 THPT Nghèn.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const name = (sp.ten ?? "").trim();
  const title = name
    ? `Thư mời Thầy/Cô ${name} — Cuộc hẹn 20 năm THPT Nghèn`
    : "Thư mời — Cuộc hẹn 20 năm THPT Nghèn";
  return {
    title,
    description: DESC,
    openGraph: { title, description: DESC, images: [IMG] },
  };
}

// Trang này giữ lại để nhập tay (?ten=) và tinh chỉnh vị trí (?x=&y=&size=).
// Link gửi khách dùng /thiep/<mã> để ngắn gọn và không lộ tên.
export default async function ThiepPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const name = (sp.ten ?? "").trim();
  const x = sp.x !== undefined ? Number(sp.x) : POS.x;
  const y = sp.y !== undefined ? Number(sp.y) : POS.y;
  const size = sp.size !== undefined ? Number(sp.size) : POS.size;
  return <Invitation name={name} x={x} y={y} size={size} />;
}
