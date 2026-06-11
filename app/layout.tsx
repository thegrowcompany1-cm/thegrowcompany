import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "더그로우컴퍼니 - 피트니스 비즈니스 전문 컨설팅",
  description:
    "필라테스, PT, 헬스, 골프 등 피트니스 업계 창업·위탁·매매 전문 컨설팅. 창업컨설팅, 위탁컨설팅, 진단컨설팅, 그로우에듀까지 피트니스 비즈니스의 모든 단계를 지원합니다.",
  keywords: [
    "피트니스 창업",
    "필라테스 창업",
    "헬스장 창업",
    "피트니스 컨설팅",
    "위탁 운영",
    "더그로우컴퍼니",
    "그로우컴퍼니",
  ],
  openGraph: {
    title: "더그로우컴퍼니 - 피트니스 비즈니스 전문 컨설팅",
    description: "필라테스, PT, 헬스, 골프 창업·위탁 전문 컨설팅",
    siteName: "더그로우컴퍼니",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
