// 쿠키 동의 기록 저장(감사 대응, 5.10). 방문자 식별자 쿠키 부여 + cookie_consents 삽입.
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  COOKIE_POLICY_VERSION,
  VISITOR_COOKIE_NAME,
  type ConsentChoice,
} from '@/lib/cookies/consent';

function makeVisitorId(): string {
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<ConsentChoice> | null;
  if (!body) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const choice: ConsentChoice = {
    functional: Boolean(body.functional),
    analytics: Boolean(body.analytics),
    marketing: Boolean(body.marketing),
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  const response = NextResponse.json({ ok: true });
  if (!visitorId) {
    visitorId = makeVisitorId();
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  // 삽입 정책상 비회원도 기록 가능. necessary 는 항상 true(고지).
  await supabase.from('cookie_consents').insert({
    visitor_id: visitorId,
    profile_id: user?.id ?? null,
    functional: choice.functional,
    analytics: choice.analytics,
    marketing: choice.marketing,
    policy_version: COOKIE_POLICY_VERSION,
  });

  return response;
}
