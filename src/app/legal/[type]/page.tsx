// 법적 문서 페이지(약관·개인정보·쿠키). DB의 현재 버전을 로케일별로 표시(누구나 열람).
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { LegalDocType } from '@/lib/supabase/database.types';

// URL 세그먼트 → enum. cookies 세그먼트는 cookie_policy 로 매핑.
const SEGMENT_TO_TYPE: Record<string, LegalDocType> = {
  terms: 'terms',
  privacy: 'privacy',
  cookies: 'cookie_policy',
};

export function generateStaticParams() {
  return Object.keys(SEGMENT_TO_TYPE).map((type) => ({ type }));
}

export default async function LegalPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const docType = SEGMENT_TO_TYPE[type];
  if (!docType) {
    notFound();
  }
  const segment = type as keyof typeof SEGMENT_TO_TYPE;

  const locale = await getLocale();
  const t = await getTranslations('legal');
  const supabase = await createClient();

  async function fetchDoc(loc: string) {
    const { data } = await supabase
      .from('legal_documents')
      .select('body, effective_date')
      .eq('type', docType)
      .eq('locale', loc)
      .eq('is_current', true)
      .maybeSingle();
    return data;
  }

  // 요청 로케일 우선, 없으면 en 폴백.
  const doc = (await fetchDoc(locale)) ?? (await fetchDoc('en'));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t(segment)}</h1>
      {doc ? (
        <>
          <p className="text-xs text-neutral-500">
            {t('effectiveDate')}: {doc.effective_date}
          </p>
          <div className="whitespace-pre-line leading-relaxed text-neutral-700">{doc.body}</div>
        </>
      ) : (
        <p className="text-neutral-500">{t('unavailable')}</p>
      )}
    </main>
  );
}
