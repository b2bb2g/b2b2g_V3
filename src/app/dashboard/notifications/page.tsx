// 내 알림 목록 + 모두 읽음. 알림 종류별 라벨·링크.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listMyNotifications } from '@/lib/notify/queries';
import { markAllNotificationsRead } from '@/lib/notify/actions';
import { EmptyState } from '@/components/ui/EmptyState';

// 알림 타입 → i18n 키(안전 목록). 미정의 타입은 generic.
const TYPE_KEYS = new Set([
  'inquiry_received',
  'inquiry_replied',
  'product_approved',
  'product_rejected',
  'member_approved',
  'member_rejected',
]);

function linkFor(type: string, inquiryId: unknown): string {
  if (type === 'inquiry_received' && typeof inquiryId === 'string') {
    return `/dashboard/supplier-inquiries/${inquiryId}`;
  }
  if (type === 'inquiry_replied') return '/dashboard/inquiries';
  if (type === 'product_approved' || type === 'product_rejected') return '/dashboard/products';
  return '/dashboard';
}

export default async function NotificationsPage() {
  const t = await getTranslations('notifications');
  const notifications = await listMyNotifications();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        {notifications.some((n) => !n.read) && (
          <form action={markAllNotificationsRead}>
            <button type="submit" className="text-sm text-neutral-600 underline">
              {t('markAllRead')}
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {notifications.map((n) => {
            const label = TYPE_KEYS.has(n.type) ? t(n.type as 'inquiry_received') : t('generic');
            const productTitle =
              typeof n.payload.productTitle === 'string' ? n.payload.productTitle : null;
            return (
              <li key={n.id} className={`px-4 py-3 ${n.read ? '' : 'bg-neutral-50'}`}>
                <Link href={linkFor(n.type, n.payload.inquiryId)} className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {label}
                    {!n.read && <span className="ml-2 text-xs text-emerald-700">•</span>}
                  </span>
                  {productTitle && <span className="text-xs text-neutral-500">{productTitle}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
