// 공급사 문의함(마스킹 뷰). 바이어 식별정보 없이 전달된 문의만.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listSupplierInquiries } from '@/lib/supplier/inquiry';
import type { InquiryStatus } from '@/lib/supabase/database.types';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_KEY: Record<InquiryStatus, string> = {
  submitted: 'statusSubmitted',
  admin_review: 'statusAdminReview',
  forwarded: 'statusForwarded',
  replied: 'statusReplied',
  closed: 'statusClosed',
};

export default async function SupplierInquiriesPage() {
  const ts = await getTranslations('supplier');
  const ti = await getTranslations('inquiry');
  const inquiries = await listSupplierInquiries();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{ts('inquiriesInbox')}</h1>

      {inquiries.length === 0 ? (
        <EmptyState message={ts('inquiryInboxEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {inquiries.map((i) => (
            <li key={i.id}>
              <Link
                href={`/dashboard/supplier-inquiries/${i.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{i.product_title}</span>
                  <span className="text-xs text-neutral-500">
                    {ti(i.type === 'quote' ? 'typeQuote' : 'typeInquiry')}
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
