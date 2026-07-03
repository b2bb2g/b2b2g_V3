// 제품요청글(RFQ) 상세. 내용은 비회원도 열람, 응답 버튼은 로그인 공급사만. 작성자 식별정보 비노출.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getPublicRequest, getMyResponse } from '@/lib/requests/queries';
import { getMySupplier } from '@/lib/supplier/queries';
import { formatBudget } from '@/lib/requests/labels';
import { RespondForm } from './RespondForm';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('requests');
  const { id } = await params;
  const request = await getPublicRequest(id);
  if (!request) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const supplier = user ? await getMySupplier() : null;
  const myResponse = supplier ? await getMyResponse(id) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <Link href="/requests" className="text-sm text-neutral-500 underline">
        {t('back')}
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{request.title}</h1>
          {request.buyer_verified && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              {t('verifiedBuyer')}
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500">
          {[request.target_country, formatBudget(request.budget, request.qty)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {request.body && (
        <div className="whitespace-pre-line leading-relaxed text-neutral-700">{request.body}</div>
      )}

      <section className="rounded-lg border border-neutral-200 p-4">
        {!user ? (
          <Link href={`/auth/login?next=/requests/${id}`} className="text-sm font-medium underline">
            {t('loginToRespond')}
          </Link>
        ) : !supplier ? (
          <p className="text-sm text-neutral-500">{t('supplierOnly')}</p>
        ) : myResponse ? (
          <p className="text-sm text-emerald-700">{t('alreadyResponded')}</p>
        ) : (
          <RespondForm requestId={id} />
        )}
      </section>

      <p className="text-xs text-neutral-400">{t('privacyNote')}</p>
    </main>
  );
}
