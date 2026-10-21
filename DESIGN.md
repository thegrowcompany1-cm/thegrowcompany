# DESIGN.md — 더그로우컴퍼니 디자인 규칙

두 층으로 나뉜다.

- **1층 사이트 공통**: 지금 코드에 실제로 있는 값만 적었다. 출처 파일을 옆에 둔다. 값이 코드와 다르면 코드가 맞고 이 문서를 고친다.
- **2층 개인 브랜딩(대본 톤)**: 개인 브랜딩 랜딩(첫 대상 `/consulting/diagnosis/hwang-hyunjin`)에 쓰는 시안 기준 규칙. 아직 코드에 없는 값은 "추가 필요"로 표시했다.

이 문서는 외부 사이트의 DESIGN.md를 받아 온 것이 아니다.

---

## 0. 작업 원칙

- 스택: Next.js 16.2.9 (App Router) · React 19.2 · Tailwind CSS 4 (`@import "tailwindcss"`, `tailwind.config` 없음, 토큰은 `app/globals.css`의 `@theme`) · TypeScript. 새 규칙은 `AGENTS.md`의 "Next.js가 다르다" 경고를 따라 `node_modules/next/dist/docs/`를 먼저 읽는다.
- 사용자에게 보이는 문구에 **물음표(질문형 후킹) 금지**. 단언형으로 쓴다. 인용한 상담 대사만 예외.
- 근거 없는 수치·고객사·후기를 만들지 않는다. 가격·일시·장소는 lib 상수로 둔다.
- 사진은 **실제 인물·자체 사진만** 쓴다. 공개 사진 컬렉션 검색(`design-taste-frontend`의 `assets.mjs` 등)은 이 프로젝트에서 쓰지 않는다.
- 인스타그램 링크·임베드는 랜딩에 두지 않는다(외부 이탈 방지).
- 폼의 `action`, `token`, `source`, 필드 이름과 GA·fbq 이벤트 코드는 건드리지 않는다.

---

## 1층. 사이트 공통

### 1.1 색 (`app/globals.css`, `components/*`)

| 용도 | 값 | 출처 |
|---|---|---|
| 브랜드 초록(토큰) | `#009519` (`--color-brand`), dark `#007a14`, light `#00b81f` | globals.css `@theme` |
| 헤더·푸터 링크 hover | `#009519` | Header.tsx, Footer.tsx |
| 랜딩 강조 초록 | `#22B573` (진단 허브·멘토·세미나 랜딩 공통) | diagnosis/page.tsx, 멘토 페이지 |
| 진단 상담 폼 초록 | `#4CAF50` / hover `#45a049` | 멘토 페이지 `FORM_HTML` |
| 본문 배경 | `#111111`, 글자 `#EEEEEE` | globals.css `body` |
| 섹션 배경(다크) | `#0A0A0A`, 교차 `#0d0d0d`, 카드 `#141414`, 이미지 자리 `#1c1c1c` | diagnosis/page.tsx |
| 헤더·푸터 배경 | `#111111`, 구분선 `border-white/10` | Header.tsx, Footer.tsx |
| 보조 글자(다크 위) | `#CCCCCC`(내비), `text-gray-400`(푸터·카드 설명), `text-gray-500` | Header.tsx, Footer.tsx |

초록이 두 값(`#009519` 토큰, `#22B573` 랜딩)으로 갈라져 있다. 새 페이지는 **랜딩이면 `#22B573`, 사이트 크롬(헤더·푸터·링크 hover)이면 `#009519`** 를 쓴다. 통일은 별도 결정 사항.

### 1.2 글꼴

- 사이트 기본: **Noto Sans KR** — `next/font/google`, 굵기 300/400/500/700/900, `display: swap`, 변수 `--font-noto-sans-kr` → Tailwind `--font-sans` (`app/layout.tsx`, `globals.css`).
- Pretendard는 **전역으로 로드되지 않는다.** startup·community 페이지와 SalesOps2가 각자 CSS를 `@import`/`<link>`로 불러온다. 진단 멘토 페이지는 글꼴 목록에 `'Pretendard'`를 앞세우지만 로드하지 않아 실제로는 다음 글꼴로 떨어진다. Pretendard를 쓰려면 그 페이지에서 직접 로드한다.
- 한글 줄바꿈은 `word-break: keep-all`(랜딩) / `break-keep`(Tailwind).

### 1.3 레이아웃·여백

- 컨테이너: 헤더·푸터 `max-w-7xl`, 진단 허브·멘토 상단 `max-w-6xl`, 로고 마퀴 `max-w-5xl`, 클로징 `max-w-2xl`. 좌우 패딩 `px-4 sm:px-6 lg:px-8`.
- 헤더: `sticky top-0 z-50`, 높이 `h-20 lg:h-24`, 스크롤 시 그림자 `0 4px 24px rgba(0,0,0,.6)`.
- 섹션 상하: 허브 `py-16 sm:py-20`(큰 섹션), 멘토 상세 랜딩 내부 `60px`(모바일 `48px`), 랜딩 내부 폭 `820px`.
- 격자 간격: 카드 `gap-4 sm:gap-5`. 카드 반경 `rounded-2xl`(허브), 랜딩 내부 카드 14~18px.

### 1.4 컴포넌트 규격

- **허브 멘토 카드**: `rounded-2xl border border-white/10 bg-[#141414]`, 사진 `aspect-[3/4] object-cover object-top`, hover `-translate-y-1` + `border-[#22B573]`.
- **CTA 버튼(허브)**: `rounded-full bg-[#22B573] px-8 py-4 text-base font-extrabold text-white`, hover `#1c9e63`.
- **라벨**: `text-xs font-bold uppercase tracking-widest text-[#22B573]`.
- **진단 상담 폼**(`FORM_HTML`, 멘토 페이지 공통): 폭 `max-width: 800px`, 흰 배경, 헤더 `linear-gradient(135deg,#4CAF50,#45a049)` 글자 22px/700, 입력칸 높이 패딩 `12px 15px`·테두리 `1px #ddd`·반경 4px, 제출 버튼 `padding 14px 60px`·반경 25px·16px/600. 구조(네이티브 form + hidden iframe, 상단·하단 2개, `source="진단상담"`)는 바꾸지 않는다.
- **멘토 상세 랜딩(다크)**: 클래스 접두사 `hjy-`/`hhj-` 등 페이지별 접두사, 제목 28px(모바일 23px)/800, 리드 18px(16px), 섹션 사이 60px(48px).
- 하단 "이런 서비스도 있어요" 추천 카드와 `ConsultantCarousel`은 모든 멘토 페이지에서 그대로 쓴다.

### 1.5 모션

- 허용: hover 이동, 진입 시 한 번 재생되는 페이드·카운트업.
- 사이트에 이미 있는 로고 마퀴·히어로 패닝은 유지하되 **새 페이지에 장식용 무한 애니메이션을 추가하지 않는다.** `prefers-reduced-motion`은 반드시 존중한다.

---

## 2층. 개인 브랜딩(대본 톤)

세일즈작가·멘토 개인을 앞세우는 랜딩에 쓴다. 사이트 크롬(헤더·푸터)은 1층 그대로 두고 **본문 영역만** 이 층을 따른다. 1층의 다크 랜딩과 달리 종이 대본처럼 밝고 절제된 톤이다.

### 2.1 색

| 용도 | 값 |
|---|---|
| 배경 | `#FFFFFF` |
| 먹색(본문·제목·테두리) | `#1C1A17` |
| 보조 글자 | `#6B6358` |
| 구분선 | `#CFC6B8` |
| 카드 배경 | `#F6F6F4` |
| 포인트(교정펜) | `#C8321F` — **한 가지뿐**. 줄 긋기·밑줄·번호·교정 표시에만 |
| 다크 섹션 | `#1C1A17`, **페이지당 1개** (클로징 또는 한 문장 강조용) |

대비: 흰 배경 위 `#1C1A17` / `#6B6358` / `#C8321F` 모두 4.5:1 이상을 쓴다(구현 후 반드시 측정). 다른 강조색을 더하지 않는다.

### 2.2 글꼴 — 추가 필요

- 헤드라인: **Noto Serif KR** 900/700 — 현재 코드에 없다. `next/font/google`로 해당 페이지(또는 `layout`)에서 로드한다.
- 본문: **Noto Sans KR** — 사이트 기본이라 추가 로드 없음. Pretendard는 이 사이트에서 전역 로드가 아니므로 개인 브랜딩 층의 본문은 Noto Sans KR로 둔다.
- 손글씨 포인트: **Nanum Pen Script** — 현재 코드에 없다(`next/font/google` 추가 필요). 한 화면에 1~2곳만(교정 메모, 서명).
- 크기 위계: 헤드라인(세리프) / 본문 16px, 행간 1.7 / 보조·라벨 13px. 본문 단락 최대 폭 약 34em.

### 2.3 모양

- 상자: **1px `#1C1A17` 테두리**, 모서리 반경 **0**, **그림자 없음**.
- 리스트: **목차형** — 번호 + 얇은 구분선(`#CFC6B8`) + 굵은 한 줄 + 보조 한 줄. 불릿 점·이모지 아이콘을 쓰지 않는다.
- 카드는 `#F6F6F4` 바탕 한 종류. 안에 또 카드를 넣지 않는다.
- 강조: 단어 단위 `#C8321F` 밑줄/교정 표시. 문단 전체 색칠 금지.
- 사진: 실제 인물·자체 촬영만. 책 표지·영상 포스터는 저장소 안 파일(`/edu/sales-ops/…`)을 쓴다.

### 2.4 구성 순서(권장)

1. 히어로: 왼쪽 정렬 세리프 헤드라인 + 한 줄 설명 + 인물 사진. 가운데 정렬 다크 히어로를 쓰지 않는다.
2. 증거(경력·수치·책) — 목차형 리스트.
3. 대본 예시(하수↔고수) — 구분선 목록.
4. 솔루션 표(프로그램·시간·커리큘럼).
5. 신청 폼(1층 폼 규격 유지).
6. 서명 + 다크 섹션 1개.

### 2.5 금지 패턴

- 보라 계열, 그라데이션 배경, 유리 효과(blur·반투명 패널).
- 이모지 아이콘, 색 박스 안의 아이콘 장식.
- 똑같은 3열 카드 반복.
- 가운데 정렬 다크 히어로.
- 끝없이 도는 장식 애니메이션(shimmer, 무한 회전, 배경 패닝).
- 물음표 후킹 카피.
- 근거 없는 수치, 실명 고객사 로고 임의 사용(텍스트로 쓸 때도 본인 확인 후).

---

## 3. 현재 황현진 페이지 상태 (참고, 수정하지 않음)

- 경로: `app/consulting/diagnosis/hwang-hyunjin/page.tsx` (+ `layout.tsx`). 커밋 `bc67e2d`.
- 허준영 페이지(`heo-junyoung/page.tsx`)를 **복제한 템플릿 기반**이다. 클래스 접두사 `hhj-`, 상세 영역은 `DETAIL_HTML` 문자열(`dangerouslySetInnerHTML` + 스크립트 주입) 구조.
- 지금은 **1층의 다크 랜딩 톤**(`#0A0A0A` 배경, 초록 `#22B573` 강조, 카드·2열 대조표)이라 2층 규칙과 다르다. 2층으로 옮기는 작업은 별도로 진행한다.
- 폼·캐러셀·추천 카드·메타·구조화 데이터는 템플릿 그대로 유지한다.

---

## 4. 설치된 보조 스킬(프로젝트 `.claude/skills`)

- `design-taste-frontend`: 방향 제안·검사 스크립트. **사진 검색(`assets.mjs`)은 쓰지 않는다.** 스킬이 만든 작업 폴더 `.taste-skill/`은 커밋하지 않는다.
- `web-design-guidelines`: UI 코드를 가이드라인에 맞춰 점검(실행 때 규칙을 원격에서 가져온다).
- `agent-browser`: 브라우저 자동화 CLI. 로컬 개발 서버 확인에만 쓴다.
- `.claude/settings.json`, `settings.local.json`은 건드리지 않는다.
