// 이벤트 분류 enum → i18n 키 매핑(단일 지점).
import type { EventCategory } from '@/lib/supabase/database.types';

export const CATEGORY_KEY: Record<EventCategory, string> = {
  trade_fair: 'catTradeFair',
  buyer_matching: 'catBuyerMatching',
  briefing: 'catBriefing',
  corporate: 'catCorporate',
  etc: 'catEtc',
};

export function formatPeriod(startsAt: string | null, endsAt: string | null): string {
  const d = (s: string | null) => (s ? s.slice(0, 10) : '');
  const s = d(startsAt);
  const e = d(endsAt);
  if (s && e) return `${s} ~ ${e}`;
  return s || e || '';
}
