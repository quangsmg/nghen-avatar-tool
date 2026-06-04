-- =====================================================================
--  Mini Game "Đua Top Sĩ Số" — Cuộc hẹn 20 năm THPT Nghèn (2003–2006)
--  Chạy file này trên project Supabase của bạn (SQL Editor hoặc CLI).
-- =====================================================================

-- ---------- 1. Bảng LỚP ----------
create table if not exists public.classes (
  id          text primary key,            -- ví dụ '12/1'
  label       text not null,
  sort_order  int  not null default 0
);

-- ---------- 2. Bảng HỘI / BANG PHÁI ----------
create table if not exists public.factions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);
-- Tên hội không phân biệt hoa thường để tránh trùng "Hội Bàn Cuối" / "hội bàn cuối"
create unique index if not exists factions_name_lower_key
  on public.factions (lower(name));

-- ---------- 3. Bảng NGƯỜI ĐIỂM DANH (mỗi tài khoản FB = 1 dòng) ----------
create table if not exists public.players (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null,
  class_id      text references public.classes (id),
  faction_id    uuid references public.factions (id) on delete set null,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists players_class_idx   on public.players (class_id);
create index if not exists players_faction_idx on public.players (faction_id);

-- ---------- 4. RLS ----------
alter table public.classes  enable row level security;
alter table public.factions enable row level security;
alter table public.players  enable row level security;

-- classes: ai cũng đọc được (để hiển thị bảng xếp hạng)
drop policy if exists classes_read on public.classes;
create policy classes_read on public.classes
  for select using (true);

-- factions: ai cũng đọc; người đã đăng nhập được tạo hội mới
drop policy if exists factions_read on public.factions;
create policy factions_read on public.factions
  for select using (true);

drop policy if exists factions_insert on public.factions;
create policy factions_insert on public.factions
  for insert to authenticated with check (true);

-- players: ai cũng đọc (leaderboard); chỉ tự thêm/sửa dòng của chính mình
drop policy if exists players_read on public.players;
create policy players_read on public.players
  for select using (true);

drop policy if exists players_insert on public.players;
create policy players_insert on public.players
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists players_update on public.players;
create policy players_update on public.players
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- 5. Tự cập nhật updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists players_touch on public.players;
create trigger players_touch before update on public.players
  for each row execute function public.touch_updated_at();

-- ---------- 6. Seed dữ liệu lớp 12/1 .. 12/8 ----------
insert into public.classes (id, label, sort_order) values
  ('12/1','Lớp 12/1',1),
  ('12/2','Lớp 12/2',2),
  ('12/3','Lớp 12/3',3),
  ('12/4','Lớp 12/4',4),
  ('12/5','Lớp 12/5',5),
  ('12/6','Lớp 12/6',6),
  ('12/7','Lớp 12/7',7),
  ('12/8','Lớp 12/8',8)
on conflict (id) do nothing;

-- ---------- 7. Seed vài hội vui cho không khí ----------
insert into public.factions (name) values
  ('Hội bàn cuối huyền thoại'),
  ('Hội gái ế bền vững'),
  ('Hội trốn học chuyên nghiệp'),
  ('Hội mọt sách năm ấy')
on conflict do nothing;
