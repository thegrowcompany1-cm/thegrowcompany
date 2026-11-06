// 창업 신규 랜딩 2종이 함께 쓰는 서버 컴포넌트 조각 (스타일은 styles.ts 의 접두사 클래스)
import type { ReactNode } from "react";

export function emphasize(text: string): ReactNode {
  const parts = text.split(/\[(.+?)\]/g);
  return parts.map((t, i) => (i % 2 === 1 ? <em key={i}>{t}</em> : t));
}

export function SectionHead({ p, no, label, title, lead }: { p: string; no: string; label: string; title: string; lead?: string }) {
  return (
    <div className={`${p}-head ${p}-rv`}>
      <div className={`${p}-eyebrow`}>
        <b>{no}</b>
        {label}
      </div>
      <h2 className={`${p}-h2`}>{emphasize(title)}</h2>
      {lead ? <p className={`${p}-lead`}>{lead}</p> : null}
    </div>
  );
}

export function Faq({ p, items }: { p: string; items: { q: string; a: string }[] }) {
  return (
    <div className={`${p}-faq ${p}-rv`}>
      {items.map((it) => (
        <details key={it.q}>
          <summary>{it.q}</summary>
          <p>{it.a}</p>
        </details>
      ))}
    </div>
  );
}

/** 표 - 데스크톱은 열 표, 모바일은 항목별 카드. cols 는 grid-template-columns 값, hlCol 은 강조할 열(0부터) */
export function Table({
  p,
  cols,
  head,
  rows,
  hlCol,
}: {
  p: string;
  cols: string;
  head: string[];
  rows: string[][];
  hlCol?: number;
}) {
  return (
    <div className={`${p}-tbl ${p}-rv`} style={{ ["--cols" as string]: cols }}>
      <div className={`${p}-th`} aria-hidden="true">
        {head.map((h, i) => (
          <span key={h} className={i === hlCol ? "hl" : undefined}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r[0]} className={`${p}-tr`}>
          {r.map((c, i) => (
            <div
              key={i}
              className={`${p}-td${i === 0 ? " k" : ""}${i === hlCol ? " hl" : ""}`}
              data-l={i === 0 ? undefined : head[i]}
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Steps({ p, items }: { p: string; items: { t: string; d: string }[] }) {
  return (
    <ol className={`${p}-steps`}>
      {items.map((s, i) => (
        <li key={s.t} className={`${p}-step ${p}-rv`}>
          <span className={`${p}-sn`}>{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className={`${p}-st`}>{s.t}</h3>
            <p className={`${p}-sd`}>{s.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
