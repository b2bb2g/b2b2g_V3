// 전역 proxy(구 middleware): 세션 갱신 + 보호 라우트 역할 게이트(1차 방어, 최종 방어는 DB RLS).
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// 로그인 필요 경로. 세부 역할 가드는 각 라우트 서버 컴포넌트 + RLS 에서 이중 확인.
const AUTH_REQUIRED_PREFIXES = ['/dashboard', '/admin'];

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (matchesPrefix(path, AUTH_REQUIRED_PREFIXES) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // /admin 은 관리자 역할까지 확인(3.1). RLS 가 최종 방어이나 진입 자체를 조기 차단.
  if (path === '/admin' || path.startsWith('/admin/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
