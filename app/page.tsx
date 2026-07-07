import HeroSection from "@/components/HeroSection";
import ServiceCategoryGrid from "@/components/ServiceCategoryGrid";
import PartnerSlider from "@/components/PartnerSlider";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServiceCategoryGrid />
      {/* 파트너 슬라이더 — 푸터(layout.tsx) 바로 위로 이동 */}
      <PartnerSlider />
      <CTASection />
    </>
  );
}
