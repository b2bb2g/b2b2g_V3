// 관리자 문의함(전체). 상태·요청자·제품 표시, 상세로 이동해 중개.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllInquiries } from '@/lib/admin/queries';
import type { InquiryStatus } from '@/lib/supabase/database.types';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_KEY: Record<InquiryStatus, string> = {
  submitted: 'statusSubmitted',
  admin_review: 'statusAdminReview',
  forwarded: 'statusForwarded',
  replied: 'statusReplied',
  closed: 'statusClosed',
};

export default async function AdminInquiriesPage() {
  const t = await getTranslations('admin');
  const ti = await getTranslations('inquiry');
  const inquiries = await listAllInquiries();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('inquiriesTitle')}</h1>

      {inquiries.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {inquiries.map((i) => (
            <li key={i.id}>
              <Link
                href={`/admin/inquiries/${i.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{i.productTitle}</span>
                  <span className="text-xs text-neutral-500">
                    {i.requesterName} · {ti(i.type === 'quote' ? 'typeQuote' : 'typeInquiry')}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">{ti(STATUS_KEY[i.status])}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
