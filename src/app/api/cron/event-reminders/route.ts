// 행사 리마인더 크론 엔드포인트. Vercel Cron 이 매일 호출 → 임박 행사 신청자에게 알림·메일.
// CRON_SECRET 로 보호(Vercel Cron 은 Authorization: Bearer <CRON_SECRET> 로 호출).
import { NextResponse, type NextRequest } from 'next/server';
import { sendEventReminders } from '@/lib/events/reminders';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await sendEventReminders();
  return NextResponse.json({ ok: true, ...result });
}
