import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/Legal.module.css";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư | Cuộc hẹn 20 năm THPT Nghèn",
  description:
    "Chính sách quyền riêng tư của công cụ hội khóa 2003-2006 THPT Nghèn.",
};

const CONTACT_EMAIL = "quanghd.it@gmail.com";

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>
        ← Về trang chủ
      </Link>
      <h1 className={styles.title}>Chính sách quyền riêng tư</h1>
      <p className={styles.updated}>Cập nhật lần cuối: 04/06/2026</p>

      <div className={styles.card}>
        <h2>1. Về công cụ này</h2>
        <p>
          Đây là công cụ phi lợi nhuận phục vụ sự kiện “Cuộc hẹn 20 năm — Hội
          khóa 2003-2006 THPT Nghèn”, gồm trò chơi điểm danh “Đua Top Sĩ Số” và
          các công cụ tạo ảnh. Chính sách này mô tả dữ liệu chúng tôi thu thập và
          cách sử dụng.
        </p>

        <h2>2. Dữ liệu chúng tôi thu thập</h2>
        <ul>
          <li>
            <strong>Khi bạn đăng nhập bằng Facebook:</strong> chỉ tên công khai,
            ảnh đại diện và mã định danh (ID) do Facebook cung cấp (quyền{" "}
            <em>public_profile</em>). Chúng tôi <strong>không thu thập email</strong>,
            mật khẩu, tin nhắn, danh sách bạn bè hay bất kỳ dữ liệu nào khác.
          </li>
          <li>
            <strong>Thông tin bạn tự nhập:</strong> tên/biệt danh thời đi học,
            lớp (12/1–12/8…) và tên hội nhóm bạn chọn hoặc tạo.
          </li>
          <li>
            <strong>Ảnh bạn tải lên</strong> ở công cụ tạo avatar/ảnh đếm ngược
            được xử lý ngay trên trình duyệt của bạn và <em>không</em> được gửi
            hay lưu trên máy chủ.
          </li>
        </ul>

        <h2>3. Mục đích sử dụng</h2>
        <ul>
          <li>Hiển thị tên và ảnh đại diện của bạn trên bảng xếp hạng điểm danh.</li>
          <li>Đếm số thành viên theo lớp và theo hội để xếp hạng.</li>
          <li>
            Dùng đăng nhập Facebook để hạn chế tài khoản ảo cày điểm gian lận.
          </li>
        </ul>

        <h2>4. Lưu trữ &amp; chia sẻ</h2>
        <p>
          Dữ liệu điểm danh được lưu trên nền tảng cơ sở dữ liệu Supabase. Chúng
          tôi <strong>không bán, không chia sẻ</strong> dữ liệu của bạn cho bên
          thứ ba vì mục đích quảng cáo. Tên và ảnh đại diện của người đã điểm
          danh được hiển thị công khai trên bảng xếp hạng cho các thành viên hội
          khóa cùng xem.
        </p>

        <h2>5. Thời gian lưu trữ</h2>
        <p>
          Dữ liệu được giữ tới khi kết thúc sự kiện hội khóa hoặc tới khi bạn yêu
          cầu xóa, tùy điều kiện nào đến trước.
        </p>

        <h2>6. Quyền của bạn</h2>
        <p>
          Bạn có thể xem, chỉnh sửa hoặc xóa dữ liệu của mình bất cứ lúc nào. Xem
          hướng dẫn tại trang{" "}
          <Link href="/data-deletion">Xóa dữ liệu người dùng</Link>.
        </p>

        <h2>7. Liên hệ</h2>
        <p>
          Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ:{" "}
          <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <h2>8. Thay đổi chính sách</h2>
        <p>
          Chính sách có thể được cập nhật; phiên bản mới nhất luôn hiển thị tại
          trang này.
        </p>
      </div>
    </div>
  );
}
