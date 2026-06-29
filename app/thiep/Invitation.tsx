import styles from "./Thiep.module.css";

export const IMG = "/files/thiep-moi.jpg";

// Vị trí mặc định của tên trên dòng "Kính gửi Thầy/Cô: ……" (theo % của ảnh).
export const POS = { x: 20.5, y: 49.3, size: 2.6 };

export function Invitation({
  name,
  x = POS.x,
  y = POS.y,
  size = POS.size,
}: {
  name: string;
  x?: number;
  y?: number;
  size?: number;
}) {
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
