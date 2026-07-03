// EPC 프로젝트 새로 작성.
import { getTranslations } from 'next-intl/server';
import { ProjectForm } from '../ProjectForm';

export default async function NewProjectPage() {
  const t = await getTranslations('epc');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <ProjectForm />
    </>
  );
}
