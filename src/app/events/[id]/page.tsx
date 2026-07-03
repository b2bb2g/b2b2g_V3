// 이벤트 상세 + (사용 설정 시) 참가 신청. draft 는 관리자 외 접근 불가.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getEvent, getMyRegistration } from '@/lib/events/queries';
import { registerForEvent, cancelRegistration } from '@/lib/events/actions';
import { CATEGORY_KEY, formatPeriod } from '@/lib/events/labels';
import { BoardAttachments } from '@/components/BoardAttachments';
import { SafeHtml } from '@/components/SafeHtml';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('events');
  const { id } = await params;
  const event = await getEvent(id);
  if (!event || event.status !== 'published') notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const registration = user ? await getMyRegistration(id) : null;
  const isApplied = registration?.status === 'applied';

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <Link href="/events" className="text-sm text-neutral-500 underline">
        {t('back')}
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-sm text-neutral-500">{t(CATEGORY_KEY[event.category])}</p>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        {formatPeriod(event.starts_at, event.ends_at) && (
          <Row label={t('period')} value={formatPeriod(event.starts_at, event.ends_at)} />
        )}
        {event.venue && <Row label={t('venue')} value={event.venue} />}
        {(event.location || event.country) && (
          <Row
            label={t('location')}
            value={[event.location, event.country].filter(Boolean).join(', ')}
          />
        )}
        {event.booth_info && <Row label={t('boothInfo')} value={event.booth_info} />}
      </dl>

      <SafeHtml html={event.body} />

      <BoardAttachments ownerType="event" ownerId={event.id} />

      {event.external_link && (
        <a
          href={event.external_link}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          {t('externalLink')}
        </a>
      )}

      {event.registration_enabled && (
        <section className="rounded-lg border border-neutral-200 p-4">
          {event.participation_status !== 'open' ? (
            <p className="text-sm text-neutral-500">{t('registrationClosed')}</p>
          ) : !user ? (
            <Link
              href={`/auth/login?next=/events/${event.id}`}
              className="text-sm font-medium underline"
            >
              {t('loginToRegister')}
            </Link>
          ) : isApplied ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-emerald-700">{t('registered')}</span>
              <form action={cancelRegistration.bind(null, event.id)}>
                <button type="submit" className="text-sm text-neutral-600 underline">
                  {t('cancelRegister')}
                </button>
              </form>
            </div>
          ) : (
            <form action={registerForEvent.bind(null, event.id)}>
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              >
                {t('register')}
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-neutral-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
