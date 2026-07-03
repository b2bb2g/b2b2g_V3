// 요청마다 Supabase 세션 쿠키를 갱신하고 현재 사용자를 돌려준다. 미들웨어에서 호출.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { publicEnv } from '@/lib/env';
import type { Database } from './database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // '로그인 상태 유지' 해제(auth_remember=0) 시 인증 쿠키(sb-*)를 세션 쿠키로 강등.
        const sessionOnly = request.cookies.get('auth_remember')?.value === '0';
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          const opts =
            sessionOnly && name.startsWith('sb-')
              ? { ...options, maxAge: undefined, expires: undefined }
              : options;
          response.cookies.set(name, value, opts);
        });
      },
    },
  });

  // getUser 는 매 요청 토큰을 검증한다(세션 신뢰의 기준).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
