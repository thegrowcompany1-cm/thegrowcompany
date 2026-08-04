import { createClient } from "@supabase/supabase-js";

// 브라우저용 Supabase 클라이언트 (publishable key — 클라이언트 노출 가능)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
