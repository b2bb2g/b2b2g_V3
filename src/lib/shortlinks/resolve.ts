// 단축링크 대상 → 실제 경로 매핑(단일 지점). 리다이렉트·생성 양쪽에서 사용.
import type { ShortLinkTarget } from '@/lib/supabase/database.types';

export function targetPath(
  targetType: ShortLinkTarget,
  targetId: string | null,
  refCode: string | null,
): string {
  switch (targetType) {
    case 'product':
      return targetId ? `/products/${targetId}` : '/products';
    case 'supplier_page':
      return targetId ? `/suppliers/${targetId}` : '/';
    case 'event':
      return targetId ? `/events/${targetId}` : '/events';
    case 'project':
      return targetId ? `/epc/${targetId}` : '/epc';
    case 'request':
      return targetId ? `/requests/${targetId}` : '/requests';
    case 'service':
      return targetId ? `/services/${targetId}` : '/services';
    case 'signup_referral':
      return refCode ? `/auth/signup?ref=${encodeURIComponent(refCode)}` : '/auth/signup';
    default:
      return '/';
  }
}
