// 주간 AI 리포트 — 메일 발송 (서버 전용)
//
//  · 이 저장소에는 메일 발송 설정(Resend 등)이 아직 없다. RESEND_API_KEY 와 WEEKLY_REPORT_MAIL_FROM 이
//    둘 다 있을 때만 Resend REST API 로 보내고, 없으면 건너뛴다 (리포트 저장·열람에는 영향 없음).
//    TODO: Resend 계정·발신 도메인 인증 후 위 두 환경변수를 Vercel 에 추가하면 바로 켜진다.
//  · 받는 사람은 WEEKLY_REPORT_MAIL_TO (기본 hjyenm1@naver.com).
//  · 본문 = 한 줄 결론 + 이번 주 할 일 3개 + 관리자 링크. 전체 리포트는 /admin/ga 에서 본다.

import { SITE_URL } from "@/lib/site";

const DEFAULT_TO = "hjyenm1@naver.com";

export type MailResult = { status: "sent" | "skipped" | "failed"; detail: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

/** "## 제목 ..." 로 시작하는 섹션 본문을 꺼낸다 (제목 뒤 괄호 설명은 무시) */
export function sectionOf(markdown: string, titleStart: string): string {
  const lines = markdown.split("\n");
  const i = lines.findIndex((l) => l.startsWith("## ") && l.slice(3).startsWith(titleStart));
  if (i < 0) return "";
  const out: string[] = [];
  for (let k = i + 1; k < lines.length && !lines[k].startsWith("## "); k++) out.push(lines[k]);
  return out.join("\n").trim();
}

const mdShort = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export async function sendWeeklyMail(args: { from: string; to: string; markdown: string }): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const sender = process.env.WEEKLY_REPORT_MAIL_FROM?.trim();
  if (!key || !sender) return { status: "skipped", detail: "RESEND_API_KEY / WEEKLY_REPORT_MAIL_FROM 이 없어 메일을 건너뜀" };

  const subject = `[더그로우] 주간 마케팅 리포트 ${mdShort(args.from)}~${mdShort(args.to)}`;
  const headline = sectionOf(args.markdown, "한 줄 결론") || "(한 줄 결론 없음)";
  const todo = sectionOf(args.markdown, "이번 주 할 일") || "(할 일 없음)";
  const link = `${SITE_URL}/admin/ga?tab=weekly`;

  const html =
    `<div style="font-family:-apple-system,'Malgun Gothic',sans-serif;line-height:1.7;color:#111">` +
    `<h2 style="margin:0 0 12px">${esc(subject)}</h2>` +
    `<h3 style="margin:16px 0 4px">한 줄 결론</h3><p style="margin:0">${md(headline).replace(/\n/g, "<br>")}</p>` +
    `<h3 style="margin:16px 0 4px">이번 주 할 일</h3><p style="margin:0">${md(todo).replace(/\n/g, "<br>")}</p>` +
    `<p style="margin:20px 0 0"><a href="${esc(link)}">관리자 화면에서 전체 리포트 보기</a></p></div>`;
  const text = `${subject}\n\n[한 줄 결론]\n${headline}\n\n[이번 주 할 일]\n${todo}\n\n전체 리포트: ${link}\n`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: sender, to: [process.env.WEEKLY_REPORT_MAIL_TO?.trim() || DEFAULT_TO], subject, html, text }),
    });
    if (!res.ok) return { status: "failed", detail: `Resend 응답 ${res.status}` };
    return { status: "sent", detail: "발송 완료" };
  } catch (err) {
    return { status: "failed", detail: err instanceof Error ? err.message.slice(0, 200) : "메일 발송 실패" };
  }
}
