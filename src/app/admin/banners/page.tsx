// 관리자 광고배너 목록 + 작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllBanners } from '@/lib/marketing/queries';
import { deleteBanner } from '@/lib/marketing/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminBannersPage() {
  const t = await getTranslations('marketing');
  const banners = await listAllBanners();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('banners')}</h1>
        <Link href="/admin/banners/new" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          {t('newBanner')}
        </Link>
      </div>

      {banners.length === 0 ? (
        <EmptyState message={t('noBanners')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {banners.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{b.title}</span>
                <span className="text-xs text-neutral-500">
                  {t(`placement_${b.placement}`)} · {b.is_active ? t('on') : t('off')} ·{' '}
                  {t('clicks')} {b.click_count}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/banners/${b.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deleteBanner.bind(null, b.id)}
                  title={t('deleteConfirm')}
                  confirmLabel={t('delete')}
                  variant="danger"
                >
                  {t('delete')}
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
