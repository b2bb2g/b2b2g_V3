// 서비스 카탈로그 공개 목록(9장). 관리자가 구성, published 만 노출.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listPublishedServices } from '@/lib/services/queries';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function ServicesPage() {
  const t = await getTranslations('services');
  const services = await listPublishedServices();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      {services.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {services.map((s) => (
            <li key={s.id}>
              <Link
                href={`/services/${s.id}`}
                className="flex flex-col gap-1 px-4 py-4 hover:bg-neutral-50"
              >
                <span className="font-medium">{s.title}</span>
                {s.summary && <span className="text-sm text-neutral-500">{s.summary}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
