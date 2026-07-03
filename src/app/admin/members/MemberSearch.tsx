'use client';
// 관리자 회원 실시간 검색(#3). 입력을 디바운스해 URL(?q,&role,&status)만 바꾸고 서버가 재조회.
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function MemberSearch({
  currentQ,
  currentRole,
  currentStatus,
  roles,
  statuses,
}: {
  currentQ: string;
  currentRole: string;
  currentStatus: string;
  roles: readonly string[];
  statuses: readonly string[];
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [value, setValue] = useState(currentQ);
  const [synced, setSynced] = useState(currentQ);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (currentQ !== synced) {
    setSynced(currentQ);
    setValue(currentQ);
  }

  function pushUrl(q: string, role: string, status: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `/admin/members?${qs}` : '/admin/members'));
  }

  function onQuery(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushUrl(next.trim(), currentRole, currentStatus), 250);
  }

  const select = 'rounded-md border border-neutral-300 px-3 py-2 text-sm';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
        <input
          type="search"
          value={value}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t('searchMembers')}
          aria-label={t('searchMembers')}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-10 text-sm"
        />
        {pending && (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          />
        )}
      </div>
      <select
        value={currentRole}
        onChange={(e) => pushUrl(value.trim(), e.target.value, currentStatus)}
        className={select}
      >
        <option value="">{t('allRoles')}</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        value={currentStatus}
        onChange={(e) => pushUrl(value.trim(), currentRole, e.target.value)}
        className={select}
      >
        <option value="">{t('allStatuses')}</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
