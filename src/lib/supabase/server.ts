// 서버 컴포넌트·라우트 핸들러용 Supabase 클라이언트. 요청 쿠키로 세션을 읽고 갱신한다.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '@/lib/env';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // '로그인 상태 유지' 해제(auth_remember=0) 시 인증 쿠키(sb-*)를 세션 쿠키로 강등.
        const sessionOnly = cookieStore.get('auth_remember')?.value === '0';
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts =
              sessionOnly && name.startsWith('sb-')
                ? { ...options, maxAge: undefined, expires: undefined }
                : options;
            cookieStore.set(name, value, opts);
          });
        } catch {
          // Server Component 렌더 중 호출되면 쓰기가 막힌다. 세션 갱신은 미들웨어가 담당하므로 무시.
        }
      },
    },
  });
}
