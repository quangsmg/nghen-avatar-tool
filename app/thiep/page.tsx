import type { Metadata } from "next";
import styles from "./Thiep.module.css";

const IMG = "/files/thiep-moi.png";

// Vị trí mặc định của tên trên dòng "Kính gửi Thầy/Cô: ……" (tính theo % của ảnh).
// Có thể tinh chỉnh nhanh qua query: ?x=..&y=..&size=.. (không cần deploy lại).
const DEFAULT_X = 20.5; // % từ trái — điểm bắt đầu của dòng kẻ chấm
const DEFAULT_Y = 49.3; // % từ trên — trùng dòng kẻ
const DEFAULT_SIZE = 2.6; // cỡ chữ theo cqw (1cqw = 1% bề ngang thiệp)

type SP = {
  ten?: string;
  x?: string;
  y?: string;
  size?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const name = (sp.ten ?? "").trim();
  const title = name
    ? `Thư mời ${name} — Cuộc hẹn 20 năm THPT Nghèn`
    : "Thư mời — Cuộc hẹn 20 năm THPT Nghèn";
  const description =
    "Trân trọng kính mời Thầy/Cô tới dự ngày hội ngộ Cuộc hẹn 20 năm — Hội khóa 2003-2006 THPT Nghèn.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [IMG],
    },
  };
}

export default async function ThiepPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const name = (sp.ten ?? "").trim();
  const x = sp.x !== undefined ? Number(sp.x) : DEFAULT_X;
  const y = sp.y !== undefined ? Number(sp.y) : DEFAULT_Y;
  const size = sp.size !== undefined ? Number(sp.size) : DEFAULT_SIZE;

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.img}
          src={IMG}
          alt="Thư mời Cuộc hẹn 20 năm — THPT Nghèn"
          decoding="async"
        />
        {name && (
          <span
            className={styles.name}
            style={{ left: `${x}%`, top: `${y}%`, fontSize: `${size}cqw` }}
          >
            {name}
          </span>
        )}
      </div>
    </main>
  );
}
