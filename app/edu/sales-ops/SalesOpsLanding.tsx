'use client';

import { useState, type ReactNode } from 'react';
import s from './SalesOpsLanding.module.css';
import {
  SO_CAPACITY,
  SO_DATE,
  SO_PLACE,
  SO_PRICE_NORMAL,
  SO_PRICE_STORY,
  SO_TIME,
  soFormatCapacity,
  soFormatPrice,
} from '@/lib/salesOps';

/* ─────────────────────────────────────────────
 * 피트니스 성장 마스터키 세미나 · 모바일 우선 랜딩
 * - applySection: 기존 신청 폼/결제 컴포넌트를 그대로 넣는 슬롯 (id="so-apply" 유지)
 * - onRoleChange: 칩 선택값을 기존 폼의 직책 선택과 연동할 때 사용
 * ───────────────────────────────────────────── */

export type RoleId = 'trainer' | 'manager' | 'owner';

const ROLES: Record<RoleId, { name: string; line: string; take: string[] }> = {
  trainer: {
    name: '강사·트레이너',
    line: '영업하는 사람처럼 보일까 봐, 권하지 못하고 있다면',
    take: ['영업 부담 없이 전문가로서 권하는 법', '회원의 마음을 여는 질문 한 줄', '몰입시키는 한 줄 권유화법'],
  },
  manager: {
    name: '실장·팀장',
    line: '상담은 매번 열심인데, 등록률은 매번 들쭉날쭉하다면',
    take: ['상담 등록률을 끌어올리는 실전 화법', '재등록이 정해지는 첫 4주 관리 루틴', '이탈을 막는 응대 기준'],
  },
  owner: {
    name: '원장·점장',
    line: '내가 하루만 빠져도 센터가 흔들린다면',
    take: ['센터 숫자를 한 장으로 읽는 운영판', 'FC·매니저에게 맡길 일의 기준', '대표 없이 돌아가는 업무 분장'],
  },
};

const SALES_PAIRS = [
  { bad: '주사요? 에이~ 땀 흘리셔야죠.', good: '운동이 적금이라면, 주사는 대출입니다.' },
  { bad: '3개월보단 12개월이 훨씬 저렴해요.', good: '도화지 10장과 100장, 어떤 완성도를 원하세요?' },
];

// TODO: 김재강 대표께 받은 실제 하소연으로 교체
const OPS_PAINS = [
  '원장님 오늘 안 나오세요? 상담은 내일 다시…',
  '이번 달 매출이 왜 빠졌는지 모르겠어요',
  'PT 재등록은 담당 쌤 따라 나갔어요',
];

const SYSTEM_SHOTS = [
  { src: '/edu/sales-ops/ops/ops-02-dashboard.webp', label: '대시보드 · 숫자로 읽는 센터' },
  { src: '/edu/sales-ops/ops/ops-03-today.webp', label: '오늘 할 일 · 맡겨도 도는 업무' },
  { src: '/edu/sales-ops/ops/ops-04-pt.webp', label: 'PT 관리 · 재등록 첫 4주' },
  { src: '/edu/sales-ops/ops/ops-01-promo.webp', label: '홍보일지 · 지도로 기록' },
];

// TODO: 영상별 실제 상황 제목으로 교체
const VIDEOS = [
  { src: '/edu/sales-ops/videos/sales-01.mp4', title: "'생각해볼게요' 할 때" },
  { src: '/edu/sales-ops/videos/sales-02.mp4', title: '가격 비교할 때' },
  { src: '/edu/sales-ops/videos/sales-03.mp4', title: '시간 없다고 할 때' },
  { src: '/edu/sales-ops/videos/sales-04.mp4', title: '주사·다이어트약 물을 때' },
];

// 3건 이상 모이면 채우기. 비어 있으면 섹션 자체가 숨겨짐
const REVIEWS: { metric: string; body: string; who: string }[] = [];

// 오너 확정 답변(2026-10-20). 답이 빈 항목은 노출 안 됨. 강의자료·녹화본, 부분 수강 문항은 두지 않는다.
const FAQS = [
  { q: '환불은 언제까지 되나요?', a: '강의 5일 전까지는 100% 환불이 가능합니다. 정원이 한정된 강의라 그 이후에는 환불이 불가합니다.' },
  { q: '단체로 신청할 수 있나요?', a: '단체 예약이 가능합니다.' },
  { q: '주차 가능한가요?', a: '가능합니다. 최초 30분은 무료이며, 이후에는 시간당 3,000원입니다. 인근 공영주차장이나 대중교통 이용을 권장드립니다.' },
  // TODO 대표님 확인: 증빙 발행 가능 여부와 신청 방법
  { q: '세금계산서·현금영수증 발행되나요?', a: '' },
];

// 일자·시간·장소·정원·가격은 lib/salesOps.ts 상수만 수정한다 (이 파일에 값을 쓰지 않는다).
// 히어로 한 줄용 짧은 표기 — "2026.11.21(토)" → "11.21(토)", "13:00~17:00" → "13–17시". 모양이 다르면 원문을 쓴다.
const SHORT_DATE = SO_DATE.replace(/^\d{4}\./, '');
const SHORT_TIME = (() => {
  const m = SO_TIME.match(/^(\d{1,2}):00~(\d{1,2}):00$/);
  return m ? `${m[1]}–${m[2]}시` : SO_TIME;
})();

// 2부 카드 하단 — 황현진 저서 표지 (높이 60px 가로 한 줄)
const BOOKS = [
  { src: '/edu/sales-ops/salesbook1.png', title: '팔리는 한 문장은 다르다' },
  { src: '/edu/sales-ops/salesbook2.png', title: '잘 파는 사람은 이렇게 팝니다' },
  { src: '/edu/sales-ops/salesbook3.png', title: '세일즈, 말부터 바꿔라' },
  { src: '/edu/sales-ops/salesbook4.png', title: '설득의 정석' },
];

const APPLY_HREF = '#so-apply';

export default function SalesOpsLanding({
  applySection,
  onRoleChange,
}: {
  applySection?: ReactNode;
  onRoleChange?: (role: RoleId) => void;
}) {
  const [role, setRole] = useState<RoleId>('trainer');
  const active = ROLES[role];
  const faqs = FAQS.filter((f) => f.a.trim());

  const pick = (id: RoleId) => {
    setRole(id);
    onRoleChange?.(id);
  };

  return (
    <main className={s.page}>
      {/* 1. HERO */}
      <section id="so-hero" data-track-section="hero" className={s.hero}>
        <p className={s.eyebrowDark}>더그로우 × 리얼세일즈 · 피트니스 성장 마스터키 세미나</p>
        <h1 className={s.h1}>
          열심히 하는데
          <br />
          숫자가 그대로라면,
          <br />
          <span className={s.accentText}>
            바꿀 건 노력이 아니라
            <br />
            방법입니다.
          </span>
        </h1>

        <div className={s.roleBlock}>
          <p className={s.roleLabel}>나는</p>
          <div className={s.chips} role="tablist" aria-label="직책 선택">
            {(Object.keys(ROLES) as RoleId[]).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={role === id}
                className={role === id ? `${s.chip} ${s.chipOn}` : s.chip}
                onClick={() => pick(id)}
              >
                {ROLES[id].name}
              </button>
            ))}
          </div>
          <p className={s.roleLine}>“{active.line}”</p>
        </div>

        <div className={s.speakers}>
          <figure className={s.speaker}>
            <div className={s.speakerImg}>
              <img src="/consultants/kim-jaegang.jpg" alt="김재강 대표" />
              <span className={s.tag}>1부 운영</span>
            </div>
            <figcaption>
              <strong>김재강</strong>
              <span>52개 센터 총괄 · 10년 운영</span>
            </figcaption>
          </figure>
          <figure className={s.speaker}>
            <div className={s.speakerImg}>
              <img src="/edu/sales-ops/hwang-hyunjin.webp" alt="황현진 대표" />
              <span className={s.tag}>2부 매출</span>
            </div>
            <figcaption>
              <strong>황현진</strong>
              <span>세일즈 저서 4권 · 전 NS홈쇼핑</span>
            </figcaption>
          </figure>
        </div>

        <div className={s.heroInfo}>
          <p className={s.meta}>
            {SHORT_DATE} {SHORT_TIME} · 서울 당산 · 정원 {soFormatCapacity(SO_CAPACITY)}
          </p>
          <p className={s.priceRow}>
            <s className={s.strike}>{soFormatPrice(SO_PRICE_NORMAL)}</s>
            <span>스토리 인증가</span>
            <strong className={s.priceBig}>{soFormatPrice(SO_PRICE_STORY)}</strong>
          </p>
          <a href={APPLY_HREF} className={s.cta}>
            {soFormatPrice(SO_PRICE_STORY)}으로 신청하기
          </a>
        </div>
      </section>

      {/* 2. 역할별 가져가는 것 */}
      <section data-track-section="target" className={s.sectionTight}>
        <div className={s.card}>
          <p className={s.small}>
            <b>{active.name}</b> · 가져가는 것 3가지
          </p>
          <ol className={s.takeList}>
            {active.take.map((t, i) => (
              <li key={t}>
                <span className={s.num}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. 세일즈: 흔한 대답 vs 배우는 대답 */}
      <section data-track-section="problem" className={s.section}>
        <p className={s.eyebrow}>2부 · 매출치트키</p>
        <h2 className={s.h2}>
          같은 상담,
          <br />한 문장 차이로 등록이 갈립니다
        </h2>
        {SALES_PAIRS.map((p) => (
          <div key={p.good} className={s.pair}>
            <div className={s.pairBad}>
              <span className={s.pairLabel}>흔한 대답</span>
              <s>“{p.bad}”</s>
            </div>
            <div className={s.pairGood}>
              <span className={s.pairLabelAccent}>세미나에서 배우는 대답</span>
              <strong>“{p.good}”</strong>
            </div>
          </div>
        ))}
      </section>

      {/* 4. 운영 고통 */}
      <section data-track-section="ops" className={`${s.section} ${s.white}`}>
        <p className={s.eyebrow}>1부 · 운영치트키</p>
        <h2 className={s.h2}>
          원장이 빠지는 날,
          <br />
          매출도 같이 빠진다면
        </h2>
        <div className={s.bubbles}>
          {OPS_PAINS.map((t) => (
            <p key={t} className={s.bubble}>
              {t}
            </p>
          ))}
        </div>
        <p className={s.punch}>
          감이 아니라 숫자로,
          <br />
          사람이 아니라 구조로.
        </p>
      </section>

      {/* 5. GROW SYSTEM */}
      <section data-track-section="system" className={s.sectionScroll}>
        <p className={s.eyebrowMuted}>GROW SYSTEM</p>
        <h2 className={s.h2}>
          원장 없이 도는 센터,
          <br />
          실제 화면으로 보여드립니다
        </h2>
        <div className={s.hscroll}>
          {SYSTEM_SHOTS.map((shot) => (
            <figure key={shot.src} className={s.shot}>
              <img src={shot.src} alt={shot.label} loading="lazy" />
              <figcaption>{shot.label}</figcaption>
            </figure>
          ))}
        </div>
        <p className={s.hint}>← 옆으로 넘겨보세요</p>
      </section>

      {/* 6. 타임테이블 */}
      <section data-track-section="curriculum" className={`${s.section} ${s.white}`}>
        <h2 className={s.h2}>하루 4시간, 두 개의 열쇠</h2>
        <article className={s.part}>
          <header>
            <span>13:00–15:00 · 김재강</span>
            <b>1부</b>
          </header>
          <h3>운영치트키</h3>
          <p>
            <b>숫자의 기술</b> — 유효회원·객단가·유지율, 매일 보는 운영판
          </p>
          <p>
            <b>위임의 기술</b> — FC·매니저 역할 분담, 대표 없이 도는 업무
          </p>
        </article>
        <article className={s.part}>
          <header>
            <span>15:00–17:00 · 황현진</span>
            <b>2부</b>
          </header>
          <h3>매출치트키</h3>
          <p>
            <b>권유의 기술</b> — 마음을 여는 질문 한 줄, 몰입시키는 권유화법
          </p>
          <p>
            <b>호감의 기술</b> — 이탈을 막고 재등록을 부르는 관계
          </p>
          <div className={s.books} aria-label="황현진 대표 저서">
            {BOOKS.map((b) => (
              <img key={b.src} src={b.src} alt={`${b.title} 표지`} height={60} loading="lazy" />
            ))}
          </div>
        </article>
      </section>

      {/* 7. 영상 */}
      <section data-track-section="video" className={s.section}>
        <h2 className={s.h2}>
          말로 설명하기보다,
          <br />
          30초 보여드릴게요
        </h2>
        <div className={s.videoGrid}>
          {VIDEOS.map((v) => (
            <figure key={v.src} className={s.video}>
              <video src={v.src} controls playsInline preload="metadata" />
              <figcaption>{v.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 8. 후기 (3건 이상일 때만 노출) */}
      {REVIEWS.length >= 3 && (
        <section data-track-section="review" className={`${s.section} ${s.white}`}>
          <h2 className={s.h2}>먼저 들어본 분들</h2>
          {REVIEWS.map((r) => (
            <div key={r.who} className={s.review}>
              <strong>{r.metric}</strong>
              <p>{r.body}</p>
              <span>{r.who}</span>
            </div>
          ))}
        </section>
      )}

      {/* 9. 신청 — 기존 폼/결제 컴포넌트를 슬롯으로 */}
      <section id="so-apply" data-track-section="form" className={s.section}>
        <h2 className={s.h2}>신청 안내</h2>
        <dl className={s.infoTable}>
          <div>
            <dt>일시</dt>
            <dd>
              {SO_DATE} {SO_TIME}
            </dd>
          </div>
          <div>
            <dt>장소</dt>
            <dd>{SO_PLACE}</dd>
          </div>
          <div>
            <dt>정원</dt>
            <dd>{soFormatCapacity(SO_CAPACITY)}</dd>
          </div>
        </dl>
        {applySection}
      </section>

      {/* 10. FAQ (답변 있는 항목만) */}
      {faqs.length > 0 && (
        <section data-track-section="faq" className={s.faq}>
          <p className={s.faqTitle}>자주 묻는 질문</p>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}
