import styles from "./AvatarStudio.module.css";

const DEMOS = [
  {
    src: "/files/demo1.png",
    alt: "Bước 1: chọn ảnh và căn trong khung trên công cụ",
    caption: "Chọn ảnh và căn mặt trong vòng tròn",
  },
  {
    src: "/files/demo2.png",
    alt: "Bước 2: tải file PNG về máy",
    caption: "Tải ảnh PNG 1080×1080 về máy",
  },
  {
    src: "/files/demo3.png",
    alt: "Bước 3: cập nhật ảnh đại diện trên Facebook",
    caption: "Đặt làm avatar trên Facebook",
  },
] as const;

export function GuidePanel() {
  return (
    <aside className={styles.guideCard} aria-labelledby="guide-heading">
      <h2 id="guide-heading" className={styles.guideTitle}>
        Hướng dẫn từng bước
      </h2>
      <p className={styles.guideWarn}>
        Lưu ý: nên mở link công cụ trong trình duyệt (Safari, Chrome…) để tải ảnh. Trong app (Telegram, Zalo, Facebook…) thường không lưu được file.
      </p>
      <ol className={styles.steps}>
        <li>
          <strong>Chọn ảnh</strong> — Bấm &quot;Chọn ảnh&quot;, chọn file JPG/PNG
          trên máy hoặc điện thoại (nên chọn ảnh rõ mặt, đủ sáng).
        </li>
        <li>
          <strong>Căn chỉnh</strong> — Giữ và kéo để đưa mặt vào vòng tròn. Cuộn
          chuột hoặc dùng thanh Zoom; trên điện thoại có thể chụm hai ngón để
          phóng to / thu nhỏ.
        </li>
        <li>
          <strong>Tải về</strong> — Bấm &quot;Tải ảnh về máy&quot; để lưu file PNG
          vuông 1080×1080.
        </li>
        <li>
          <strong>Đặt làm avatar Facebook/Zalo</strong>.
        </li>
      </ol>

      <h3 className={styles.demoHeading}>Ảnh mẫu minh họa</h3>
      <div className={styles.demoList}>
        {DEMOS.map((d) => (
          <figure key={d.src} className={styles.demoFig}>
            <img
              src={d.src}
              alt={d.alt}
              className={styles.demoImg}
              loading="lazy"
              decoding="async"
            />
            <figcaption className={styles.demoCap}>{d.caption}</figcaption>
          </figure>
        ))}
      </div>
    </aside>
  );
}
