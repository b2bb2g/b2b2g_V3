// 제품요청글(RFQ) enum → i18n 키 매핑(단일 지점) + 예산·수량 포맷.
import type { RequestResponseStatus, RequestStatus } from '@/lib/supabase/database.types';

export const STATUS_KEY: Record<RequestStatus, string> = {
  submitted: 'statusSubmitted',
  admin_review: 'statusAdminReview',
  listed: 'statusListed',
  closed: 'statusClosed',
  rejected: 'statusRejected',
};

export const RESPONSE_STATUS_KEY: Record<RequestResponseStatus, string> = {
  submitted: 'respSubmitted',
  forwarded_to_buyer: 'respForwarded',
  accepted: 'respAccepted',
  declined: 'respDeclined',
};

export function formatBudget(budget: number | null, qty: number | null): string {
  const parts: string[] = [];
  if (budget != null) parts.push(budget.toLocaleString());
  if (qty != null) parts.push(`x${qty.toLocaleString()}`);
  return parts.join(' ');
}
