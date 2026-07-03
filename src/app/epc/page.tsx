// EPC 프로젝트 공개 목록(5.6). published 만 노출, 관리자 작성.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listPublishedProjects } from '@/lib/projects/queries';
import { FIELD_KEY, STAGE_KEY, formatPeriod } from '@/lib/projects/labels';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function EpcPage() {
  const t = await getTranslations('epc');
  const projects = await listPublishedProjects();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-sm text-neutral-500">{t('intro')}</p>

      {projects.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/epc/${p.id}`} className="flex flex-col gap-1 px-4 py-4 hover:bg-neutral-50">
                <div className="flex items-center gap-2">
                  {p.is_pinned && <span className="text-xs text-amber-600">★</span>}
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  {t(FIELD_KEY[p.field])} · {t(STAGE_KEY[p.stage])}
                  {formatPeriod(p.starts_on, p.ends_on)
                    ? ` · ${formatPeriod(p.starts_on, p.ends_on)}`
                    : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
