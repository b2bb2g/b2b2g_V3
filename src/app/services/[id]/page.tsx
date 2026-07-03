// 서비스 상세. published 외 접근 불가.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getService } from '@/lib/services/queries';
import { SafeHtml } from '@/components/SafeHtml';

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('services');
  const { id } = await params;
  const service = await getService(id);
  if (!service || service.status !== 'published') notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <Link href="/services" className="text-sm text-neutral-500 underline">
        {t('back')}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{service.title}</h1>
        {service.summary && <p className="text-neutral-500">{service.summary}</p>}
      </div>
      <SafeHtml html={service.body} />
    </main>
  );
}
