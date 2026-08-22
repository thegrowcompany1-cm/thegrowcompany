// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// @supabase/ssr 의 createBrowserClient 는 세션을 쿠키에 저장하므로
// 서버 컴포넌트(lib/supabase/server.ts)에서도 같은 세션을 읽을 수 있다.
//
// 참고: 기존 lib/supabase.ts(결제 화면의 상품 조회용, supabase-js 기본 클라이언트)는
//       그대로 두었다. 인증에는 반드시 이 파일의 클라이언트를 사용할 것.
import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;

// GoTrue 인스턴스가 여러 개 생기지 않도록 모듈 단위로 재사용
let browserClient: BrowserClient | null = null;

export function createClient(): BrowserClient {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}
