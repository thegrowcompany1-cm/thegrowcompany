"use client";

// 1기 세미나(운영/세일즈) 종료 안내 + 다음 일정 오픈 알림 폼.
// /edu/sales-ops · sales-ops2 · sales-ops3 의 결제 카드(SalesOpsPay) 자리에 들어간다. lib/salesOps.ts 의 SO_ENDED 가 true 일 때만 쓴다.
// 폼·저장은 components/edu/OpenNotifyForm.tsx (course="sales-ops") 가 맡는다.

import { NotifySection } from "@/components/edu/OpenNotifyForm";

export default function SalesOpsClosed({ page }: { page: string }) {
  return (
    <NotifySection
      course="sales-ops"
      page={page}
      tone="bare"
      title="1기 세미나가 마감되었습니다."
      sub="다음 일정 오픈 알림을 받아보세요"
    />
  );
}
