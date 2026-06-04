import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links}>
        <Link href="/privacy">Chính sách quyền riêng tư</Link>
        <span aria-hidden>·</span>
        <Link href="/data-deletion">Xóa dữ liệu người dùng</Link>
      </nav>
      <p className={styles.copy}>
        Cuộc hẹn 20 năm — Hội khóa 2003-2006 THPT Nghèn
      </p>
    </footer>
  );
}
