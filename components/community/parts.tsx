// 시설 위탁운영 랜딩 공통 조각 — 서버/클라이언트 어디서든 쓸 수 있는 순수 마크업(훅 없음)
import type { ReactNode } from "react";

export const FORM_ID = "cm-form";

/** 배경은 화면 전체 폭, 내용은 가운데 기둥. wide 는 데스크톱(1024px 이상)에서 880px(숫자·표·리포트·비교), 아니면 560px */
export function Block({ n, tone, children, cls = "", id, wide }: { n: number; tone: "dk" | "wt"; children: ReactNode; cls?: string; id?: string; wide?: boolean }) {
  return (
    <section className={`cm-b cm-${tone} ${cls}`.trim()} data-b={n} id={id}>
      <div className={`cm-in${wide ? " w" : ""}`}>{children}</div>
    </section>
  );
}

/** 문장 안의 핵심 수치 강조 */
export function Em({ children }: { children: ReactNode }) {
  return <b className="cm-em">{children}</b>;
}
export function BigIn({ children }: { children: ReactNode }) {
  return <span className="cm-bigin">{children}</span>;
}

/** 형광 박스 — 헤드라인 핵심 구절 1곳 */
export function Hl({ children }: { children: ReactNode }) {
  return <em className="cm-hl">{children}</em>;
}

export function Btn({ label }: { label: string }) {
  return (
    <a className="cm-btn" href={`#${FORM_ID}`} data-cta="1">
      {label}
    </a>
  );
}

export function Bubble({ side, children }: { side: "l" | "r"; children: ReactNode }) {
  return (
    <div className={`cm-bub ${side}`}>
      <p>{children}</p>
    </div>
  );
}

export type CardItem = { title: string; eyebrow?: string; lines?: string[]; body?: string; price?: string; badge?: string; rec?: boolean; note?: string };

export function Cards({ items, cols = 1, num }: { items: CardItem[]; cols?: 1 | 2 | 3 | 4; num?: boolean }) {
  return (
    <div className={`cm-cards${cols > 1 ? ` c${cols}` : ""}`}>
      {items.map((c, i) => (
        <div key={c.title} className={`cm-card${c.rec ? " rec" : ""}`}>
          {c.badge ? <span className="cm-badge">{c.badge}</span> : null}
          {num ? <div className="cm-num">{i + 1}</div> : null}
          <h3>
            {c.eyebrow ? <em>{c.eyebrow}</em> : null}
            {c.title}
          </h3>
          {c.body ? <p>{c.body}</p> : null}
          {c.note ? <div className="cm-note">{c.note}</div> : null}
          {c.price ? <div className="cm-price">{c.price}</div> : null}
          {c.lines ? (
            <ul>
              {c.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export type RepBar = { label: string; value: number; text: string; dark?: boolean };

/** 리포트 예시 카드 - 배지는 항상 제목 위에 보인다. bars 는 위 숫자에 맞춘 막대(최대값 대비 길이) */
export function ReportMock({ title, rows, bars, barMax }: { title: string; rows: [string, string][]; bars?: RepBar[]; barMax?: number }) {
  const max = barMax ?? Math.max(...(bars ?? []).map((b) => b.value), 1);
  return (
    <div className="cm-rep">
      <span className="cm-rep-badge">예시 · 실제 단지 데이터 아님</span>
      <div className="cm-rep-t">{title}</div>
      <div className="cm-rep-g">
        {rows.map(([k, v]) => (
          <div key={k} className="cm-rep-r">
            <span>{k}</span>
            <b className={v.length > 7 ? "s" : undefined}>{v}</b>
          </div>
        ))}
      </div>
      {bars ? (
        <div className="cm-rep-bars">
          {bars.map((b) => (
            <div key={b.label} className="cm-rep-bar">
              <span>{b.label}</span>
              <div className="trk">
                <i className={b.dark ? "k" : undefined} style={{ width: `${(b.value / max) * 100}%` }} />
              </div>
              <b>{b.text}</b>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type ScenarioItem = { title: string; situation: string; steps: string[]; outcome: string };

/** 운영 시나리오 카드 - 가상 예시. 실적·후기처럼 읽히지 않게 라벨을 고정하고 기대 변화는 "목표로 합니다" 어미만 쓴다 */
export function Scenarios({ items, cols }: { items: ScenarioItem[]; cols?: 1 | 2 | 3 }) {
  return (
    <div className={`cm-cards cm-scns${cols && cols > 1 ? ` c${cols}` : ""}`}>
      {items.map((c) => (
        <article key={c.title} className="cm-scn">
          <span className="cm-scn-tag">운영 시나리오 · 가상 예시</span>
          <h3>{c.title}</h3>
          <div className="cm-scn-k">상황</div>
          <p>{c.situation}</p>
          <div className="cm-scn-k">더그로우가 하는 일</div>
          <ul>
            {c.steps.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="cm-scn-k">기대 변화</div>
          <p className="cm-scn-o">{c.outcome}</p>
        </article>
      ))}
    </div>
  );
}

export function Ph({ label }: { label: string }) {
  return <div className="cm-ph">{label}</div>;
}

export function Checks({ items }: { items: string[] }) {
  return (
    <ul className="cm-chk">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function Steps({ items }: { items: { t: string; d?: string }[] }) {
  return (
    <ol className="cm-steps">
      {items.map((s) => (
        <li key={s.t}>
          {s.t}
          {s.d ? <span>{s.d}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="cm-faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Photo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cm-photo" src={src} alt={alt} loading="lazy" decoding="async" />;
}

export function Hero({ img, eyebrow, children, top }: { img: string; eyebrow: string; children: ReactNode; top?: ReactNode }) {
  return (
    <section className="cm-b cm-hero cm-dk" data-b={1}>
      <div className="cm-hero-bg" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" />
      <div className="cm-hero-ov" aria-hidden="true" />
      <div className="cm-in w">
        <div className="cm-hero-in">
          {top}
          <p className="cm-ey">{eyebrow}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

/** 폼 블록 머리말 + 폼을 받는 마지막 블록 */
export function FormBlock({ n, head, sub, children }: { n: number; head: ReactNode; sub?: string; children: ReactNode }) {
  return (
    <Block n={n} tone="dk" id={FORM_ID}>
      <h2>{head}</h2>
      {sub ? <p className="cm-sub cm-gap2" style={{ fontSize: 17, fontWeight: 600, color: "#D5DCD8" }}>{sub}</p> : null}
      {children}
    </Block>
  );
}
