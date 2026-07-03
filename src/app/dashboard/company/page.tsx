// 공급사 회사정보 입력 페이지(온보딩). 공급사·관리자만 접근.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getMySupplier } from '@/lib/supplier/queries';
import { CompanyForm } from './CompanyForm';

export default async function CompanyPage() {
  const t = await getTranslations('supplier');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'supplier' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const supplier = await getMySupplier();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('companyTitle')}</h1>
      <CompanyForm defaultName={supplier?.company_name} />
    </main>
  );
}
