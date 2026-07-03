// 공급사 문의 상세(마스킹). 바이어 식별정보 없이 내용·대화만, 회신 가능.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSupplierInquiry } from '@/lib/supplier/inquiry';
import type { InquiryStatus } from '@/lib/supabase/database.types';
import { SupplierReplyForm } from './SupplierReplyForm';

const STATUS_KEY: Record<InquiryStatus, string> = {
  submitted: 'statusSubmitted',
  admin_review: 'statusAdminReview',
  forwarded: 'statusForwarded',
  replied: 'statusReplied',
  closed: 'statusClosed',
};

export default async function SupplierInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ts = await getTranslations('supplier');
  const ti = await getTranslations('inquiry');
  const { id } = await params;
  const detail = await getSupplierInquiry(id);
  if (!detail) notFound();

  const { inquiry, messages } = detail;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/dashboard/supplier-inquiries" className="text-sm text-neutral-500 underline">
        {ts('inquiriesInbox')}
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{inquiry.product_title}</h1>
        <p className="text-sm text-neutral-500">
          {ti(inquiry.type === 'quote' ? 'typeQuote' : 'typeInquiry')} ·{' '}
          {ti(STATUS_KEY[inquiry.status])}
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200 p-4">
        <p className="whitespace-pre-line text-neutral-700">{inquiry.content}</p>
      </section>

      {messages.length > 0 && (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li key={m.id} className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
              <span className="mb-1 block text-xs text-neutral-500">{m.author_role}</span>
              <p className="whitespace-pre-line">{m.body}</p>
            </li>
          ))}
        </ul>
      )}

      {inquiry.status !== 'closed' && <SupplierReplyForm inquiryId={id} />}
    </main>
  );
}
