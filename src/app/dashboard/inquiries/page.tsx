// 내 문의 목록(바이어/에이전트). RLS 로 본인 문의만.
import { getTranslations } from 'next-intl/server';
import { listMyInquiries } from '@/lib/inquiry/queries';
import type { InquiryStatus } from '@/lib/supabase/database.types';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_KEY: Record<InquiryStatus, string> = {
  submitted: 'statusSubmitted',
  admin_review: 'statusAdminReview',
  forwarded: 'statusForwarded',
  replied: 'statusReplied',
  closed: 'statusClosed',
};

export default async function MyInquiriesPage() {
  const t = await getTranslations('inquiry');
  const inquiries = await listMyInquiries();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('myTitle')}</h1>

      {inquiries.length === 0 ? (
        <EmptyState message={t('empty')} action={{ label: t('myTitle'), href: '/products' }} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {inquiries.map((i) => (
            <li key={i.id} className="flex flex-col gap-1 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{i.productTitle}</span>
                <span className="text-xs text-neutral-500">
                  {t(i.type === 'quote' ? 'typeQuote' : 'typeInquiry')} · {t(STATUS_KEY[i.status])}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-neutral-600">{i.content}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
