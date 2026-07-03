// FAQ 공개 목록(정렬순). 관리자 작성, 누구나 열람.
import { getTranslations } from 'next-intl/server';
import { listPublishedFaqs } from '@/lib/content/queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeHtml } from '@/components/SafeHtml';

export default async function FaqPage() {
  const t = await getTranslations('content');
  const faqs = await listPublishedFaqs();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('faq')}</h1>
      {faqs.length === 0 ? (
        <EmptyState message={t('faqEmpty')} />
      ) : (
        <ul className="flex flex-col gap-4">
          {faqs.map((f) => (
            <li key={f.id} className="rounded-lg border border-neutral-200 p-5">
              <p className="font-medium">
                {f.category && (
                  <span className="mr-2 text-xs text-neutral-400">[{f.category}]</span>
                )}
                {f.question}
              </p>
              <div className="mt-2 text-sm text-neutral-600">
                <SafeHtml html={f.answer} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
