// 관리자 문의 상세·중개. 요청자 정보(관리자만), 대화, 전달/종료, 메시지 작성.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getInquiryDetail } from '@/lib/admin/queries';
import { closeInquiry, forwardInquiry } from '@/lib/admin/actions';
import type { InquiryStatus } from '@/lib/supabase/database.types';
import { AdminMessageForm } from './AdminMessageForm';

const STATUS_KEY: Record<InquiryStatus, string> = {
  submitted: 'statusSubmitted',
  admin_review: 'statusAdminReview',
  forwarded: 'statusForwarded',
  replied: 'statusReplied',
  closed: 'statusClosed',
};

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('admin');
  const ti = await getTranslations('inquiry');
  const { id } = await params;
  const detail = await getInquiryDetail(id);
  if (!detail) notFound();

  const { inquiry, productTitle, requesterName, requesterEmail, messages } = detail;
  const canForward = inquiry.status === 'submitted' || inquiry.status === 'admin_review';

  return (
    <>
      <Link href="/admin/inquiries" className="text-sm text-neutral-500 underline">
        {t('backToInquiries')}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{productTitle}</h1>
        <p className="text-sm text-neutral-500">
          {ti(inquiry.type === 'quote' ? 'typeQuote' : 'typeInquiry')} ·{' '}
          {ti(STATUS_KEY[inquiry.status])}
        </p>
        {/* 요청자 정보 — 관리자만 열람(공급사엔 비노출) */}
        <p className="text-sm">
          {t('requester')}: {requesterName} ({requesterEmail})
        </p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-500">{t('content')}</h2>
        <p className="whitespace-pre-line text-neutral-700">{inquiry.content}</p>
      </section>

      <div className="flex gap-2">
        {canForward && (
          <form action={forwardInquiry.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t('forward')}
            </button>
          </form>
        )}
        {inquiry.status !== 'closed' && (
          <form action={closeInquiry.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
            >
              {t('close')}
            </button>
          </form>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-500">{t('conversation')}</h2>
        {messages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {messages.map((m) => (
              <li key={m.id} className="rounded-md bg-neutral-50 px-3 py-2 text-sm">
                <div className="mb-1 flex gap-2 text-xs text-neutral-500">
                  <span>{m.author_role}</span>
                  {m.visible_to === 'admin_only' && (
                    <span className="rounded bg-amber-200 px-1 text-amber-800">
                      {t('internalTag')}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-line">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
        <AdminMessageForm inquiryId={id} />
      </section>
    </>
  );
}
