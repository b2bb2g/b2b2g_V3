// EPC 프로젝트 새로 작성.
import { getTranslations } from 'next-intl/server';
import { ProjectForm } from '../ProjectForm';

export default async function NewProjectPage() {
  const t = await getTranslations('epc');
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <ProjectForm />
    </main>
  );
}
