# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- 헬스장·필라테스·PT 스튜디오 센터 대표와 예비 창업자. 창업, 위탁운영, 진단 컨설팅, 교육 세미나를 알아보고 상담 신청 폼이나 결제로 넘어간다.
- 시설 담당자. 아파트 입주자대표회의·관리소장, 기업·호텔·공공기관, 대학교 시설 담당자가 시설 위탁운영(/consulting/community 계열 랜딩 3종)을 검토한다.
- 방문 경로는 메타 광고·검색·블로그가 주이고, 모바일에서 들어오는 비중이 높다고 가정한다(미확인).

## Product Purpose

더그로우컴퍼니는 헬스장·필라테스 창업, 매장·시설 위탁운영, 진단 컨설팅, 그로우 에듀 교육을 파는 피트니스 비즈니스 컨설팅 회사다. 사이트의 일은 방문자가 상담 신청 폼을 제출하거나 세미나를 결제하게 만드는 것이다. 성공은 신청 건수와 결제 전환이다.

## Positioning

창업부터 운영까지 한 팀이 끝까지 간다. 입지, 인테리어, 오픈, 운영을 따로 맡기지 않는다. (확정된 차별점. 카피에는 이미 헬스장·필라테스 창업 250회, 52개 센터 총괄 운영 경험, 10년+ 현장 운영, 그로우 에듀 재교육, 계열사 그로우 인테리어가 사실로 쓰여 있다.)

## Operating Context

- 서비스별 상세 랜딩이 따로 있다: 창업(/consulting/startup, takeover, location), 위탁(/consulting/outsourcing 계열), 시설 위탁운영(/consulting/community 계열), 진단(/consulting/diagnosis), 교육(/edu 계열), 채용(/recruit).
- 광고 전용 랜딩(/consulting/startup2·3, /consulting/outsourcing2, /consulting/community2·3)은 noindex이며 헤더 메뉴·메인·sitemap에 노출하지 않는다.
- 상담 신청은 숨김 iframe 폼 제출로 Google Apps Script에 쌓이고, 측정은 GA4와 메타 픽셀(경로별 픽셀 매핑)로 한다.
- 헤더·푸터·세미나 팝업은 app/layout.tsx와 공용 컴포넌트가 맡는다.

## Capabilities and Constraints

- 스택: Next.js 16(App Router) · React 19 · Tailwind 4 · TypeScript. AGENTS.md 경고에 따라 코드를 쓰기 전에 `node_modules/next/dist/docs/`를 먼저 읽는다.
- 사용자에게 보이는 문구에 물음표 금지(인용한 대사만 예외). 단언형으로 쓴다.
- 근거 없는 수치·고객사·후기 금지. 가격·일시·장소는 lib 상수로 관리한다.
- 사진은 실제 인물·자체 사진만 쓴다. 공개 사진 컬렉션 검색은 쓰지 않는다.
- 폼의 action·token·source·필드 이름과 GA·메타 픽셀 코드는 바꾸지 않는다. 바꾸면 시트 집계가 끊긴다.
- 인스타그램 링크·임베드는 랜딩에 두지 않는다.
- 빌드는 C:\Work\thegrowcompany 경로에서 한다(F:는 subst라 Turbopack이 실패한다).

## Brand Commitments

- 브랜드 초록(`#009519`)과 로고 파일(`/logos/thegrow-logo.png`)을 쓴다. 세부 값은 DESIGN.md에 있다.
- 서비스 명칭은 코드·카피에 이미 쓰는 이름을 그대로 쓴다(올인원 창업 패키지, 입지·상권·부동산 임장, 인수창업, 그로우 에듀, 그로우 인테리어).

## Evidence on Hand

- 카피에 이미 있는 사실: 헬스장·필라테스 창업 250회, 52개 센터 총괄 운영 경험, 10년+ 피트니스 현장 운영.
- 진단 솔루션 후기 영상(커스텀 대표님)과 메인 후기 이미지, 컨설턴트 사진(public/consultants), 시공 사례 이미지가 있다.
- 시설 위탁운영 3종의 운영 사례·후기·리포트 수치는 아직 없다(플레이스홀더). 새로 만들어 채우지 않는다.

## Product Principles

1. 한 팀이 끝까지 간다는 점이 모든 서비스 페이지의 공통 약속이다.
2. 숫자는 근거가 있는 것만 쓴다. 없으면 비워 두고 플레이스홀더로 남긴다.
3. 방문자의 다음 행동은 상담 신청 하나로 모은다. 폼과 측정은 서비스 간에 같은 방식을 쓴다.
4. 광고 랜딩은 본 랜딩을 건드리지 않고 따로 실험한다.

## Accessibility & Inclusion

제품 고유의 접근성 기준은 정해지지 않았다. 모바일 우선으로 가로 스크롤 0, 가독성 있는 본문 크기를 유지한다.
