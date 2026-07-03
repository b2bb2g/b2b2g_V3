// 공지 상세. 비공개(draft)는 RLS 로 관리자 외 접근 불가 → 없으면 404.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getNotice } from '@/lib/content/queries';

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice || notice.status !== 'published') notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <Link href="/notices" className="text-sm text-neutral-500 underline">
        {t('notices')}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{notice.title}</h1>
        <p className="text-xs text-neutral-400">{notice.created_at.slice(0, 10)}</p>
      </div>
      <div className="whitespace-pre-line leading-relaxed text-neutral-700">{notice.body}</div>
    </main>
  );
}
