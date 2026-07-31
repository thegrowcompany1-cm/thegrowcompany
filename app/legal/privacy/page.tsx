import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 더그로우컴퍼니",
  description: "주식회사 더그로우컴퍼니 개인정보처리방침",
};

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "회사는 상담 신청 및 서비스 제공을 위하여 다음과 같은 개인정보를 수집합니다.",
      "이름, 연락처, 희망 업종/운영 형태, 지역, 신청 경로, 업체명/직책",
    ],
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    body: [
      "회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.",
      "1. 무료 상담 및 유료 컨설팅 등 서비스 진행",
      "2. 신청 확인 및 결과 안내를 위한 연락",
      "3. 창업 세미나, 정규 FC 클래스 등 교육·행사 안내",
    ],
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    body: [
      "회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 관계 법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.",
      "· 계약 또는 청약철회, 대금결제, 재화 등의 공급에 관한 기록: 5년 (전자상거래법)",
      "· 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)",
    ],
  },
  {
    title: "4. 개인정보 처리의 위탁",
    body: [
      "회사는 서비스 운영을 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.",
      "· Google LLC (Google Sheets): 상담 신청 데이터 보관",
      "· Make: 신청 데이터 자동화 처리",
      "회사는 위탁계약 체결 시 개인정보 보호 관련 법령의 준수, 개인정보에 관한 비밀유지, 제3자 제공 금지 및 사고 시의 책임부담 등을 명확히 규정하고 있습니다.",
    ],
  },
  {
    title: "5. 개인정보의 제3자 제공",
    body: [
      "회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 관계 법령에 근거가 있거나 이용자가 사전에 동의한 경우에는 예외로 합니다.",
    ],
  },
  {
    title: "6. 개인정보의 파기 절차 및 방법",
    body: [
      "① 회사는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.",
      "② 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.",
    ],
  },
  {
    title: "7. 정보주체의 권리·의무 및 행사방법",
    body: [
      "이용자는 회사에 대해 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있으며, 회사는 관계 법령에 따라 지체 없이 조치합니다.",
    ],
  },
  {
    title: "8. 개인정보 보호책임자",
    body: [
      "회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.",
      "· 개인정보 보호책임자: 회사 대표",
      "· 연락처: 1551-4476",
    ],
  },
  {
    title: "9. 개인정보처리방침의 변경",
    body: [
      "이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 이전에 서비스 화면을 통해 공지합니다.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[#111111] min-h-screen">
      <div className="max-w-[760px] mx-auto px-6 py-20 sm:py-28">
        <p className="text-[#009519] text-sm font-bold tracking-widest uppercase mb-3">
          PRIVACY POLICY
        </p>
        <h1 className="text-white text-3xl sm:text-4xl font-black mb-3">개인정보처리방침</h1>
        <p className="text-[#888888] text-sm mb-14">시행일: 2026년 8월 1일</p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-white text-lg sm:text-xl font-bold mb-3">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((line, i) => (
                  <p
                    key={i}
                    className="text-[#d6d6d6] text-sm sm:text-base leading-[1.9]"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-[#666666] text-xs mt-16 pt-8 border-t border-white/10">
          주식회사 더그로우컴퍼니 | 인천 서구 봉수대로 806 (연희동, 인천아시아드주경기장) 1층
        </p>
      </div>
    </div>
  );
}
