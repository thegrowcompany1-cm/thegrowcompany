import Shell from "@/components/startup4/Shell";
import LocationSections, { LOCATION_CTA, LOCATION_PREP } from "@/components/startup4/LocationSections";

export default function StartupLocationPage() {
  return (
    <Shell
      p="slc"
      cta={LOCATION_CTA}
      product="입지상권"
      formTitle={LOCATION_CTA}
      formSub="후보지가 정해지지 않았어도 괜찮습니다. 계약 전에 어떤 자리를 찾아야 하는지부터 확인해 보세요."
      prep={LOCATION_PREP}
      bridge="자리가 정해지면, 오픈까지 한 팀으로 이어갈 수 있습니다"
    >
      <LocationSections />
    </Shell>
  );
}
