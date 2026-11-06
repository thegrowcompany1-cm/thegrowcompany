import Shell from "@/components/startup4/Shell";
import TakeoverSections, { TAKEOVER_CTA, TAKEOVER_PREP } from "@/components/startup4/TakeoverSections";

export default function StartupTakeoverPage() {
  return (
    <Shell
      p="stk"
      cta={TAKEOVER_CTA}
      product="인수창업"
      formTitle={TAKEOVER_CTA}
      formSub="아직 결정하지 못한 단계여도 괜찮습니다. 계약 전에 숫자부터 확인해 보세요. 자료는 상담하면서 안내드립니다."
      prep={TAKEOVER_PREP}
    >
      <TakeoverSections />
    </Shell>
  );
}
