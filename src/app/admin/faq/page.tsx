// 관리자 FAQ 목록(전체) + 새로작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllFaqs } from '@/lib/content/queries';
import { deleteFaq } from '@/lib/content/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminFaqPage() {
  const t = await getTranslations('content');
  const faqs = await listAllFaqs();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manageFaq')}</h1>
        <Link
          href="/admin/faq/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {faqs.length === 0 ? (
        <EmptyState message={t('faqEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {faqs.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{f.question}</span>
                <span className="text-xs text-neutral-500">
                  {t(f.status === 'published' ? 'statusPublished' : 'statusDraft')}
                  {f.category ? ` · ${f.category}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/faq/${f.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deleteFaq.bind(null, f.id)}
                  title={t('deleteConfirm')}
                  confirmLabel={t('delete')}
                  variant="danger"
                >
                  {t('delete')}
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
