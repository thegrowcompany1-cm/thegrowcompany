"use client";

// 기간 직접 선택 달력 — react-day-picker 와 그 스타일은 이 파일에만 있다.
// RangePicker 가 달력을 처음 열 때(또는 "직접 선택" 위에 마우스를 올릴 때) 지연 로딩한다.

import "react-day-picker/style.css";
import { DayPicker, type DateRange } from "react-day-picker";
import { ko } from "react-day-picker/locale";

type Props = {
  timeZone: string;
  months: number;
  defaultMonth: Date;
  endMonth: Date;
  selected: DateRange | undefined;
  onSelect: (r: DateRange | undefined) => void;
};

export default function RangeCalendar({ timeZone, months, defaultMonth, endMonth, selected, onSelect }: Props) {
  return (
    <DayPicker
      mode="range"
      locale={ko}
      timeZone={timeZone}
      numberOfMonths={months}
      defaultMonth={defaultMonth}
      endMonth={endMonth}
      disabled={{ after: endMonth }}
      selected={selected}
      onSelect={onSelect}
      weekStartsOn={0}
    />
  );
}
