"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 기간 선택 — 프리셋 버튼 + "직접 선택" 달력 팝오버 (react-day-picker)
//
//  · 모든 날짜는 KST(Asia/Seoul) 기준이다. DayPicker 에 timeZone 을 주고, 날짜 ↔ "YYYY-MM-DD" 변환은
//    Intl(Asia/Seoul)로 한다 — 브라우저 시간대가 달라도 같은 날이 선택된다.
//  · 오늘 이후 날짜는 선택할 수 없고, 범위는 최대 1년(366일)이다. 넘으면 적용 버튼이 막히고 안내가 뜬다.
//  · 모바일(640px 이하)에서는 한 달만, 그 이상에서는 두 달을 보여준다.
//  · 768px 미만에서는 프리셋 줄 대신 "📅 9/28~10/25 ▾" 한 줄 버튼만 두고, 누르면 프리셋·달력이 담긴 시트가 열린다.
//  · 팝오버는 바깥을 누르거나 Esc 로 닫는다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { DateRange } from "react-day-picker";
import { MAX_RANGE_DAYS, PRESET_LABEL, PRESET_ORDER, matchPreset, presetRange, rangeLength, todayKst, type PresetKey } from "@/lib/gaRange";

const TZ = "Asia/Seoul";

// 달력(react-day-picker)은 처음 열 때(또는 "직접 선택" 위에 마우스를 올릴 때)만 내려받는다.
// 모바일에서는 기간 버튼을 누르는 순간에도 미리 불러온다. 실제 Next 프로덕션 빌드에서 첫 로드에 포함되지 않음을 확인했다.
const loadCalendar = () => import("./RangeCalendar");
const RangeCalendar = dynamic(loadCalendar, { ssr: false, loading: () => <div className="ga-skel" style={{ height: 300 }} aria-hidden="true" /> });
const kstFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Date → "YYYY-MM-DD" (KST) */
const toYmd = (d: Date) => kstFmt.format(d);
/** "YYYY-MM-DD" → 그날 KST 정오 (어느 시간대에서도 같은 날로 읽힌다) */
const fromYmd = (ymd: string) => new Date(`${ymd}T12:00:00+09:00`);

type Props = {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
};

export default function RangePicker({ from, to, onChange }: Props) {
  const today = todayKst();
  const active = matchPreset(from, to, today);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);
  const [months, setMonths] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [sheet, setSheet] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 화면 폭에 따라 보이는 달 수 (모바일 1개월)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setMonths(mq.matches ? 1 : 2);
    update();
    mq.addEventListener("change", update);
    const mm = window.matchMedia("(max-width: 767px)");
    const updateM = () => setIsMobile(mm.matches);
    updateM();
    mm.addEventListener("change", updateM);
    return () => {
      mq.removeEventListener("change", update);
      mm.removeEventListener("change", updateM);
    };
  }, []);

  // 바깥 클릭·Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openCustom = () => {
    setDraft({ from: fromYmd(from), to: fromYmd(to) });
    setOpen(true);
  };

  const draftFrom = draft?.from ? toYmd(draft.from) : null;
  const draftTo = draft?.to ? toYmd(draft.to) : draftFrom;
  const len = draftFrom && draftTo ? rangeLength(draftFrom, draftTo) : 0;
  const tooLong = len > MAX_RANGE_DAYS;
  const canApply = !!draftFrom && !!draftTo && !tooLong;

  const endMonth = useMemo(() => fromYmd(today), [today]);
  // 달력이 처음 열릴 때 보이는 달 — 종료일이 마지막 달에 오도록 (2개월 보기에서는 앞 달부터)
  const defaultMonth = useMemo(() => {
    const [y, m] = to.split("-").map(Number);
    const d = new Date(`${y}-${String(m).padStart(2, "0")}-15T12:00:00+09:00`);
    if (months === 2) d.setMonth(d.getMonth() - 1);
    return d;
  }, [to, months]);

  const apply = () => {
    if (!canApply || !draftFrom || !draftTo) return;
    onChange(draftFrom, draftTo);
    setOpen(false);
  };

  const short = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const rangeLabel = from === to ? short(from) : `${short(from)}~${short(to)}`;
  const presetButtons = (
    <>
      {PRESET_ORDER.map((k: PresetKey) => (
        <button
          key={k}
          type="button"
          aria-pressed={active === k}
          onClick={() => {
            const r = presetRange(k, today);
            setOpen(false);
            setSheet(false);
            onChange(r.from, r.to);
          }}
        >
          {PRESET_LABEL[k]}
        </button>
      ))}
      <button type="button" aria-pressed={active === null || open} aria-expanded={open} aria-haspopup="dialog" onPointerEnter={loadCalendar} onFocus={loadCalendar} onClick={() => (open ? setOpen(false) : openCustom())}>
        직접 선택
      </button>
    </>
  );

  const calendar = open ? (
        <div className="ga-cal" role="dialog" aria-label="기간 직접 선택">
          <RangeCalendar timeZone={TZ} months={months} defaultMonth={defaultMonth} endMonth={endMonth} selected={draft} onSelect={setDraft} />
          <div className="ga-cal-foot">
            <span className={"ga-cal-info" + (tooLong ? " is-bad" : "")}>
              {tooLong
                ? `최대 ${MAX_RANGE_DAYS}일(1년)까지 선택할 수 있습니다 — 현재 ${len}일`
                : draftFrom
                  ? `${draftFrom}${draftTo && draftTo !== draftFrom ? ` ~ ${draftTo}` : ""} · ${len}일`
                  : "시작일과 종료일을 차례로 눌러주세요"}
            </span>
            <span className="ga-cal-btns">
              <button type="button" onClick={() => setOpen(false)}>
                취소
              </button>
              <button type="button" className="is-primary" disabled={!canApply} onClick={() => { apply(); setSheet(false); }}>
                적용
              </button>
            </span>
          </div>
        </div>
  ) : null;

  return (
    <div className="ga-range" ref={wrapRef}>
      <div className="ga-presets" role="group" aria-label="기간 선택">
        {presetButtons}
      </div>
      <button type="button" className="ga-rbtn" aria-haspopup="dialog" aria-expanded={sheet} onPointerEnter={loadCalendar} onClick={() => { loadCalendar(); setSheet(true); }}>
        <span aria-hidden="true">📅</span> {rangeLabel} <span aria-hidden="true">▾</span>
      </button>

      {!isMobile && calendar}

      {isMobile && sheet && (
        <div className="ga-sheet-bg" onClick={() => { setSheet(false); setOpen(false); }}>
          <div className="ga-sheet" role="dialog" aria-label="기간 선택" onClick={(e) => e.stopPropagation()}>
            <div className="ga-sheet-head">
              <b>기간 선택</b>
              <button type="button" aria-label="닫기" onClick={() => { setSheet(false); setOpen(false); }}>×</button>
            </div>
            <div className="ga-sheet-presets" role="group" aria-label="기간 프리셋">
              {presetButtons}
            </div>
            {calendar}
          </div>
        </div>
      )}
    </div>
  );
}
