// 관리자 법적문서 편집(약관·개인정보·쿠키정책). 언어별 현재 버전 본문 수정. RLS(is_admin).
import { getTranslations } from 'next-intl/server';
import { listLegalDocuments } from '@/lib/admin/extra-queries';
import { updateLegalDocument } from '@/lib/admin/extra-actions';

const TYPE_KEY: Record<string, string> = {
  terms: 'terms',
  privacy: 'privacy',
  cookie_policy: 'cookies',
};

export default async function AdminLegalPage() {
  const t = await getTranslations('admin');
  const tl = await getTranslations('legal');
  const docs = await listLegalDocuments();

  return (
    <>
      <h1 className="text-2xl font-bold">{t('legal')}</h1>

      {docs.map((d) => (
        <form
          key={d.id}
          action={updateLegalDocument.bind(null, d.id)}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{tl(TYPE_KEY[d.type] ?? 'terms')}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
              {d.locale.toUpperCase()}
            </span>
          </div>
          <textarea
            name="body"
            rows={6}
            defaultValue={d.body}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="w-fit rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white">
            {t('save')}
          </button>
        </form>
      ))}
    </>
  );
}
