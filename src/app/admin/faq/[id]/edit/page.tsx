// FAQ 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getFaq } from '@/lib/content/queries';
import { FaqForm } from '../../FaqForm';

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const { id } = await params;
  const faq = await getFaq(id);
  if (!faq) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <FaqForm faq={faq} />
    </main>
  );
}
