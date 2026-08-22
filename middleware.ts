// Supabase 세션 토큰 갱신 미들웨어.
//
// 서버 컴포넌트는 쿠키를 쓸 수 없기 때문에, 액세스 토큰이 만료됐을 때 갱신해 줄
// 주체가 필요하다. 이 미들웨어가 매 요청마다 getUser() 를 호출해 토큰을 갱신하고
// 새 쿠키를 응답에 실어준다. (이게 없으면 1시간 뒤 /mypage 가 로그인 상태인데도
// 로그인 페이지로 튕긴다.)
//
// 인증 확인은 반드시 getUser() — getSession() 은 쿠키를 검증 없이 신뢰한다.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 토큰 갱신 목적의 호출 — 반환값은 여기서 쓰지 않는다.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // 정적 파일·이미지·favicon 은 제외 (인증 갱신이 필요 없음)
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|mp4|ico)$).*)",
  ],
};
