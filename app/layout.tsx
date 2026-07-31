import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

// 구글 태그 매니저 ID — 실제 ID 발급 후 NEXT_PUBLIC_GTM_ID 환경변수로 주입하거나
// 아래 플레이스홀더("GTM-XXXXXXX")를 실제 ID로 교체하세요.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX"; // ← 여기에 실제 GTM ID 입력

const DEFAULT_TITLE =
  "더그로우컴퍼니 | 헬스장·필라테스 창업, 운영, 마케팅 전문 컨설팅";
const DEFAULT_DESC =
  "헬스장마케팅·필라테스마케팅부터 헬스장운영·필라테스운영, 위탁운영, 창업까지. 더그로우컴퍼니가 피트니스 비즈니스의 모든 단계를 전문 컨설팅으로 지원합니다.";

// 모바일 뷰포트: 폭을 기기 폭에 맞추고 축소/핀치줌으로 뭉개지지 않게 (가로 오버플로우 방지와 병행)
// 핀치줌/더블탭줌 차단 (요청에 따른 설정 — 저시력 사용자의 화면 확대 접근성에 영향을 줄 수 있음)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | 더그로우컴퍼니",
  },
  description: DEFAULT_DESC,
  keywords: [
    "헬스장마케팅",
    "필라테스마케팅",
    "헬스장운영",
    "필라테스운영",
    "위탁운영",
    "헬스장창업",
    "필라테스창업",
    "피트니스 인테리어",
    "피트니스 컨설팅",
    "더그로우컴퍼니",
  ],
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    locale: "ko_KR",
    images: [{ url: OG_IMAGE, width: 210, height: 60, alt: "더그로우컴퍼니 로고" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [OG_IMAGE],
  },
  verification: {
    other: {
      "naver-site-verification": "87d094f3a884ddc47196bdcfe790daab74615b50",
    },
  },
};

// 조직(Organization) 구조화 데이터 (JSON-LD)
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "주식회사 더그로우컴퍼니",
  alternateName: "더그로우컴퍼니",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/thegrow-logo.png`,
  email: "thegrow_company@naver.com",
  telephone: "1551-4476",
  address: {
    "@type": "PostalAddress",
    streetAddress: "봉수대로 806 (연희동, 인천아시아드주경기장) 1층",
    addressLocality: "서구",
    addressRegion: "인천광역시",
    addressCountry: "KR",
  },
  sameAs: [
    "https://www.instagram.com/thegrow.company/",
    "https://www.youtube.com/@fitnessgrowlab",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
