// 관리자 EPC 프로젝트 목록(전체) + 작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllProjects } from '@/lib/projects/queries';
import { deleteProject } from '@/lib/projects/actions';
import { FIELD_KEY, STAGE_KEY } from '@/lib/projects/labels';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

const STATUS_KEY = {
  draft: 'statusDraft',
  published: 'statusPublished',
  closed: 'statusClosed',
} as const;

export default async function AdminEpcPage() {
  const t = await getTranslations('epc');
  const projects = await listAllProjects();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manage')}</h1>
        <Link
          href="/admin/epc/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-neutral-500">
                  {t(FIELD_KEY[p.field])} · {t(STAGE_KEY[p.stage])} · {t(STATUS_KEY[p.status])}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/epc/${p.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deleteProject.bind(null, p.id)}
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
    </main>
  );
}
