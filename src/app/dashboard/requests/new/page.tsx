// 제품요청글 새로 작성(바이어/에이전트). 비승인 회원도 작성 가능(온보딩), 노출은 관리자 승인 후.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { listActiveCategories } from '@/lib/supplier/queries';
import { RequestForm } from '../RequestForm';

export default async function NewRequestPage() {
  const t = await getTranslations('requests');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard/requests/new');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'buyer' && profile?.role !== 'agent' && profile?.role !== 'admin')
    redirect('/dashboard');

  const categories = await listActiveCategories();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <RequestForm categories={categories} />
    </main>
  );
}
