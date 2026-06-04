import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/Legal.module.css";

export const metadata: Metadata = {
  title: "Xóa dữ liệu người dùng | Cuộc hẹn 20 năm THPT Nghèn",
  description:
    "Hướng dẫn xóa dữ liệu người dùng cho công cụ hội khóa 2003-2006 THPT Nghèn.",
};

const CONTACT_EMAIL = "quanghd.it@gmail.com";

export default function DataDeletionPage() {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>
        ← Về trang chủ
      </Link>
      <h1 className={styles.title}>Xóa dữ liệu người dùng</h1>
      <p className={styles.updated}>Cập nhật lần cuối: 04/06/2026</p>

      <div className={styles.card}>
        <h2>Cách 1 — Tự xóa ngay trên ứng dụng (nhanh nhất)</h2>
        <ul>
          <li>
            Mở <Link href="/">trang Đua Top Sĩ Số</Link> và đăng nhập bằng đúng
            tài khoản Facebook bạn đã dùng.
          </li>
          <li>
            Kéo xuống cuối trang, bấm nút{" "}
            <strong>“Xóa dữ liệu của tôi”</strong>.
          </li>
          <li>
            Xác nhận. Toàn bộ dữ liệu điểm danh của bạn (tên, lớp, hội, ảnh đại
            diện) sẽ bị xóa ngay lập tức và bạn được đăng xuất.
          </li>
        </ul>

        <h2>Cách 2 — Gửi yêu cầu qua email</h2>
        <p>
          Nếu không tự đăng nhập được, hãy gửi email tới{" "}
          <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          với tiêu đề <strong>“Xóa dữ liệu hội khóa”</strong>, kèm tên Facebook
          bạn đã dùng để điểm danh. Chúng tôi sẽ xóa dữ liệu của bạn trong vòng
          tối đa 7 ngày và phản hồi xác nhận qua email.
        </p>

        <h2>Dữ liệu nào sẽ bị xóa?</h2>
        <p>
          Tên/biệt danh, lớp, hội nhóm, ảnh đại diện và mã định danh gắn với lượt
          điểm danh của bạn. Sau khi xóa, lớp và hội của bạn sẽ bị trừ 1 quân số
          trên bảng xếp hạng.
        </p>

        <p>
          Xem thêm tại{" "}
          <Link href="/privacy">Chính sách quyền riêng tư</Link>.
        </p>
      </div>
    </div>
  );
}
