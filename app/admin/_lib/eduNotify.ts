// /admin/notify 공용 조회 — 화면과 CSV 가 같은 함수를 쓴다 (두 곳의 목록이 어긋나지 않게).
// 서버 전용: guard.ts 의 AdminContext(db)를 받아 쓴다. "use client" 파일에서 import 하지 않는다.

import type { AdminContext } from "./guard";
import { EDU_NOTIFY_COURSES } from "@/lib/eduNotify";
import type { EduNotifyCourse } from "@/lib/eduNotify";

export type NotifyRow = {
  id: string;
  created_at: string;
  course: string;
  name: string;
  phone: string;
  email: string | null;
  region: string | null;
  role: string | null;
  privacy_agree: boolean;
  marketing_agree: boolean;
  page: string | null;
};

const COLUMNS = "id, created_at, course, name, phone, email, region, role, privacy_agree, marketing_agree, page";

/** 최신순 목록. course 가 null 이면 전체 */
export async function loadNotifies(
  ctx: AdminContext,
  course: EduNotifyCourse | null,
  limit: number,
): Promise<{ rows: NotifyRow[]; error?: string }> {
  let q = ctx.db.from("edu_notify").select(COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (course) q = q.eq("course", course);
  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as NotifyRow[] };
}

/** 과정별 접수 건수 */
export async function countNotifies(ctx: AdminContext): Promise<{ counts: Record<string, number>; error?: string }> {
  const counts: Record<string, number> = {};
  let error: string | undefined;
  await Promise.all(
    EDU_NOTIFY_COURSES.map(async (c) => {
      const { count, error: e } = await ctx.db
        .from("edu_notify")
        .select("id", { count: "exact", head: true })
        .eq("course", c);
      counts[c] = count ?? 0;
      if (e && !error) error = e.message;
    }),
  );
  return { counts, error };
}
