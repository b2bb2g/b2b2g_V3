// 비밀번호 재설정 요청 페이지.
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('forgotTitle')}</h1>
        <p className="text-sm text-neutral-600">{t('forgotBody')}</p>
      </div>
      <ForgotPasswordForm />
    </main>
  );
}
