// 서버 컴포넌트 / 라우트 핸들러용 Supabase 클라이언트.
// 쿠키에 저장된 세션을 읽어 서버에서 supabase.auth.getUser() 로 인증을 확인한다.
//
// 주의: 인증 상태 확인은 반드시 getUser() 를 쓴다. getSession() 은 쿠키 값을 그대로
//       믿기 때문에 서버에서는 신뢰할 수 없고, 재검증 루프의 원인이 된다.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // 서버 컴포넌트에서는 쿠키를 쓸 수 없다(읽기 전용).
            // 토큰 갱신은 middleware.ts 가 담당하므로 여기서는 무시해도 안전하다.
          }
        },
      },
    },
  );
}
