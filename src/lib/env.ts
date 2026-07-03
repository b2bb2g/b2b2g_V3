// 환경변수를 한 곳에서 검증·노출하는 설정 모듈 (0.1/0.2 규칙: 연결정보 단일 출처)

/** 서버·클라이언트 공용으로 필요한 필수 공개 환경변수를 읽는다. 누락 시 즉시 에러. */
function requiredPublic(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`환경변수 ${name} 가 설정되지 않았습니다. .env.local 을 확인하세요.`);
  }
  return value;
}

/** 클라이언트에서도 접근 가능한 공개 설정. NEXT_PUBLIC_ 접두사만 포함. */
export const publicEnv = {
  supabaseUrl: requiredPublic('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: requiredPublic(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;
