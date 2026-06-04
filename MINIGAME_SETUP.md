# Hướng dẫn cấu hình Mini Game "Đua Top Sĩ Số"

Game đã có sẵn code (trang chủ `/`). Cần 3 việc cấu hình bên ngoài để chạy thật.

## 1. Tạo bảng dữ liệu trên Supabase
Mở **Supabase Dashboard → SQL Editor → New query**, dán toàn bộ nội dung file
[`supabase/migrations/0001_minigame.sql`](supabase/migrations/0001_minigame.sql)
rồi **Run**. File này tạo bảng `classes`, `factions`, `players`, bật RLS, và
seed sẵn lớp 12/1–12/12 + vài hội mẫu.

> Muốn thêm/bớt lớp: sửa phần seed `insert into public.classes ...`.

## 2. Bật đăng nhập Facebook
Bạn cần một **Facebook App** (https://developers.facebook.com):
1. Tạo app loại *Consumer*, thêm sản phẩm **Facebook Login**.
2. Vào **Facebook Login → Settings**, thêm **Valid OAuth Redirect URI**:
   ```
   https://jqfaphxxrbagxomwjzuv.supabase.co/auth/v1/callback
   ```
3. Lấy **App ID** và **App Secret** (Settings → Basic). Ở mục **Basic**, điền:
   - **Privacy Policy URL:** `https://<domain-cua-ban>/privacy`
   - **User Data Deletion → Data Deletion Instructions URL:**
     `https://<domain-cua-ban>/data-deletion`

   (Thay `<domain-cua-ban>` bằng domain Vercel thật, vd `nghen.vercel.app`.)
   Sau đó chuyển app sang chế độ **Live**.
4. Trong **Supabase Dashboard → Authentication → Providers → Facebook**: bật
   provider, dán **Client ID** (App ID) và **Client Secret** (App Secret), Save.
5. Trong **Authentication → URL Configuration**: đặt **Site URL** là domain
   Vercel của bạn (vd `https://nghen.vercel.app`) và thêm vào **Redirect URLs**
   cả domain production lẫn `http://localhost:3000` để test.

## 3. Biến môi trường
Lấy ở **Supabase Dashboard → Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://jqfaphxxrbagxomwjzuv.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/publishable key

Đặt 2 biến này ở **Vercel → Project → Settings → Environment Variables** (cho
Production + Preview), và tạo file `.env.local` ở máy để chạy `npm run dev`
(xem mẫu trong `.env.local.example`). Anon key là khóa công khai, an toàn để lộ
ở client.

## Cách hoạt động
- Mỗi tài khoản Facebook = 1 dòng trong `players` (khóa chính trùng user id) →
  không cày trùng điểm được.
- Bảng xếp hạng đếm số `players` theo `class_id` (lớp) và `faction_id` (hội),
  tự làm mới mỗi 15 giây.
- RLS: ai cũng đọc được bảng xếp hạng; chỉ người đã đăng nhập mới tạo hội và chỉ
  được thêm/sửa đúng dòng của mình.
