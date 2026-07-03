// EPC 프로젝트 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProject } from '@/lib/projects/queries';
import { ProjectForm } from '../../ProjectForm';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('epc');
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <ProjectForm project={project} />
    </main>
  );
}
