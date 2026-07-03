// 관리자 제품요청글 상세: 승인/상태 변경 + 공급사 응답 중개(전달/수락/거절).
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getRequest, listResponses } from '@/lib/requests/queries';
import { updateRequestStatus, updateResponseStatus } from '@/lib/requests/actions';
import { STATUS_KEY, RESPONSE_STATUS_KEY, formatBudget } from '@/lib/requests/labels';
import type { RequestResponseStatus, RequestStatus } from '@/lib/supabase/database.types';

const REQUEST_STATUSES: RequestStatus[] = [
  'submitted',
  'admin_review',
  'listed',
  'closed',
  'rejected',
];
const RESPONSE_STATUSES: RequestResponseStatus[] = [
  'submitted',
  'forwarded_to_buyer',
  'accepted',
  'declined',
];
const input = 'rounded-md border border-neutral-300 px-3 py-2 text-sm';

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('requests');
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();
  const responses = await listResponses(id);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{request.title}</h1>
        <p className="text-sm text-neutral-500">
          {[request.target_country, formatBudget(request.budget, request.qty)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {request.body && (
        <div className="whitespace-pre-line leading-relaxed text-neutral-700">{request.body}</div>
      )}

      <form action={updateRequestStatus.bind(null, request.id)} className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-500">{t('fieldStatus')}</span>
          <select name="status" defaultValue={request.status} className={input}>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(STATUS_KEY[s])}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('applyStatus')}
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-500">{t('responses')}</h2>
        {responses.length === 0 ? (
          <p className="text-sm text-neutral-500">{t('noResponses')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {responses.map((resp) => (
              <li key={resp.id} className="rounded-lg border border-neutral-200 p-4">
                <p className="whitespace-pre-line text-sm text-neutral-700">{resp.message}</p>
                <form
                  action={updateResponseStatus.bind(null, resp.id)}
                  className="mt-3 flex items-end gap-3"
                >
                  <input type="hidden" name="request_id" value={request.id} />
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-neutral-500">{t('responseStatus')}</span>
                    <select name="status" defaultValue={resp.status} className={input}>
                      {RESPONSE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(RESPONSE_STATUS_KEY[s])}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
                    {t('applyStatus')}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
