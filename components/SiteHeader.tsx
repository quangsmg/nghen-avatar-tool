import Link from "next/link";
import styles from "./SiteHeader.module.css";

type NavKey = "avatar" | "countdown" | "minigame";

const NAV_ITEMS: {
  key: NavKey;
  label: string;
  href?: string;
  soon?: boolean;
}[] = [
  { key: "minigame", label: "Đua Top Sĩ Số", href: "/" },
  { key: "avatar", label: "Khung avatar", href: "/avatar" },
  { key: "countdown", label: "Ảnh đếm ngược", href: "/countdown" },
];

export function SiteHeader({
  active,
  title,
  subtitle,
}: {
  active: NavKey;
  title: string;
  subtitle: React.ReactNode;
}) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Chọn công cụ">
        {NAV_ITEMS.map((item) => {
          if (item.soon || !item.href) {
            return (
              <span
                key={item.key}
                className={`${styles.navLink} ${styles.navDisabled}`}
                aria-disabled="true"
                title="Tính năng sắp ra mắt"
              >
                {item.label}
                <span className={styles.soon}>Sắp ra mắt</span>
              </span>
            );
          }
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navLink}${isActive ? ` ${styles.navActive}` : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.brandRow}>
        <img
          src="/files/logo.png"
          alt="Logo Trường THPT Nghèn"
          className={styles.logo}
          width={112}
          height={112}
          decoding="async"
        />
        <div className={styles.brandText}>
          <div className={styles.badge}>Cuộc hẹn 20 năm</div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
