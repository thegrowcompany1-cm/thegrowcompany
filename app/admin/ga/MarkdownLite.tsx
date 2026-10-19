"use client";

// 아주 작은 마크다운 렌더러 — 주간 AI 리포트 전용 (제목 · 목록 · 표 · 인용 · 굵게 · 코드).
// HTML 로 바꾸지 않고 React 요소로 직접 만들기 때문에 AI 응답 안의 태그가 실행될 수 없다.

import type { ReactNode } from "react";

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    out.push(tok.startsWith("**") ? <b key={`${key}-${i++}`}>{tok.slice(2, -2)}</b> : <code key={`${key}-${i++}`}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

export default function MarkdownLite({ source }: { source: string }) {
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${k++}`;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s*/, "");
      blocks.push(level <= 2 ? <h3 key={key} className="ga-md-h">{inline(text, key)}</h3> : <h4 key={key} className="ga-md-h2">{inline(text, key)}</h4>);
      i++;
    } else if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const body = rows.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r));
      const [head, ...rest] = body;
      blocks.push(
        <div key={key} className="ga-table-wrap">
          <table className="ga-table">
            <thead>
              <tr>{cells(head).map((c, j) => <th key={j}>{inline(c, `${key}h${j}`)}</th>)}</tr>
            </thead>
            <tbody>
              {rest.map((r, ri) => (
                <tr key={ri}>{cells(r).map((c, j) => <td key={j}>{inline(c, `${key}r${ri}c${j}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      const li = items.map((t, j) => <li key={j}>{inline(t, `${key}i${j}`)}</li>);
      blocks.push(ordered ? <ol key={key} className="ga-md-list">{li}</ol> : <ul key={key} className="ga-md-list">{li}</ul>);
    } else if (line.startsWith(">")) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key} className="ga-md-quote">{inline(q.join(" "), key)}</blockquote>);
    } else {
      const p: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\||>|\s*([-*]|\d+\.)\s)/.test(lines[i])) p.push(lines[i++]);
      blocks.push(<p key={key} className="ga-md-p">{inline(p.join(" "), key)}</p>);
    }
  }
  return <div className="ga-md">{blocks}</div>;
}
