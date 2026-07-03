// EPC 프로젝트 상세. published 외 접근 불가(관리자는 목록에서 미리보기).
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProject } from '@/lib/projects/queries';
import { FIELD_KEY, STAGE_KEY, formatPeriod, formatScale } from '@/lib/projects/labels';
import { BoardAttachments } from '@/components/BoardAttachments';
import { SafeHtml } from '@/components/SafeHtml';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('epc');
  const { id } = await params;
  const project = await getProject(id);
  if (!project || project.status !== 'published') notFound();

  const scale = formatScale(project.scale_amount, project.currency);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <Link href="/epc" className="text-sm text-neutral-500 underline">
        {t('back')}
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-sm text-neutral-500">
          {t(FIELD_KEY[project.field])} · {t(STAGE_KEY[project.stage])}
        </p>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        {project.client && <Row label={t('client')} value={project.client} />}
        {(project.location || project.country) && (
          <Row
            label={t('location')}
            value={[project.location, project.country].filter(Boolean).join(', ')}
          />
        )}
        {formatPeriod(project.starts_on, project.ends_on) && (
          <Row label={t('period')} value={formatPeriod(project.starts_on, project.ends_on)} />
        )}
        {scale && <Row label={t('scale')} value={scale} />}
      </dl>

      <SafeHtml html={project.body} />

      <BoardAttachments ownerType="project" ownerId={project.id} />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-neutral-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
