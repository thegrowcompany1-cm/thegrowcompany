import type { NextConfig } from "next";

// 아임웹 서비스 종료에 대비해 아임웹 CDN 이미지를 전부 public/legacy 로 옮겼다.
// 원격 이미지가 더 이상 없어 images.remotePatterns 도 함께 제거했다.
const nextConfig: NextConfig = {
  images: {
    // 이미지 최적화 전역 해제.
    //
    // 왜: Vercel Image Optimization 변환 한도(5,000)를 소진해 /_next/image 가
    // 402(Payment Required)를 돌려주고 있었다. 헤더·푸터 사이트 로고까지
    // 최적화를 거치는 이미지가 전부 로드되지 않았다. 느리게 뜨는 편이
    // 아예 안 뜨는 것보다 낫다고 보고 전역으로 껐다.
    //
    // 되돌리는 법: 아래 unoptimized 줄만 지우면 된다. <Image> 컴포넌트는
    // 손대지 않았으므로 설정만 되돌리면 최적화가 그대로 복구된다.
    //
    // 되돌리기 전에 확인할 것:
    //  · 한도가 리셋됐는지(보통 월 단위), 또는 플랜을 올렸는지
    //  · public/consultants 의 대용량 원본을 줄였는지 — 최적화가 꺼진 동안은
    //    이 원본이 그대로 전송된다. 2026-09 기준 heo-junyoung.jpg 23.9MB,
    //    kim-seungho.jpg 11.1MB, kim-jaegang.jpg 10.3MB 로, 이 셋만 45MB 다.
    //
    // 참고: 히어로·파트너 로고 마퀴는 이 설정과 별개로 각 <Image> 에
    // unoptimized 를 직접 달아두었다. 여기를 되돌려도 그 둘은 계속 정적 서빙.
    unoptimized: true,
  },
};

export default nextConfig;
