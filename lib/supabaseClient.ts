import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True khi đã cấu hình đủ biến môi trường Supabase. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Client Supabase dùng ở phía trình duyệt. Trả về null nếu chưa cấu hình env
 * để app vẫn build/chạy được (hiển thị thông báo cấu hình thay vì crash).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Supabase trả token ở hash (#access_token=...) sau khi đăng nhập
        // Facebook -> dùng implicit để client tự đọc hash và tạo phiên.
        flowType: "implicit",
      },
    })
  : null;

export type ClassRow = {
  id: string;
  label: string;
  sort_order: number;
};

export type FactionRow = {
  id: string;
  name: string;
  created_at: string;
};

export type PlayerRow = {
  id: string;
  display_name: string;
  class_id: string | null;
  faction_id: string | null;
  avatar_url: string | null;
  created_at: string;
};
