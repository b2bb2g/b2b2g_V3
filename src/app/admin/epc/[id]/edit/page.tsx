// EPC 프로젝트 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/projects/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { ProjectForm } from '../../ProjectForm';
import { AttachmentManager } from '@/components/AttachmentManager';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('epc');
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const attachments = await getAttachments('project', id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <ProjectForm project={project} />
      {user && (
        <AttachmentManager
          ownerType="project"
          ownerId={id}
          userId={user.id}
          attachments={attachments}
        />
      )}
    </main>
  );
}
