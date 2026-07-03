// 서버 컴포넌트·라우트 핸들러용 Supabase 클라이언트. 요청 쿠키로 세션을 읽고 갱신한다.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '@/lib/env';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component 렌더 중 호출되면 쓰기가 막힌다. 세션 갱신은 미들웨어가 담당하므로 무시.
        }
      },
    },
  });
}
