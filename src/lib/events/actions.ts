'use server';
// 이벤트 관리자 CRUD + 사용자 참가신청/취소. RLS 가 최종 방어.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type {
  ContentStatus,
  EventCategory,
  EventParticipation,
} from '@/lib/supabase/database.types';

export type EventResult = { ok: true } | { ok: false; error: string };

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? { supabase, userId: user.id } : null;
}

const toIso = (v: FormDataEntryValue | null): string | null => {
  const s = String(v ?? '').trim();
  return s ? new Date(s).toISOString() : null;
};
const text = (v: FormDataEntryValue | null): string | null => String(v ?? '').trim() || null;

export async function saveEvent(
  _prev: EventResult | null,
  formData: FormData,
): Promise<EventResult> {
  const ctx = await adminClient();
  if (!ctx) return { ok: false, error: 'forbidden' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, error: 'invalid_input' };
  const id = (formData.get('id') as string) || null;

  const row = {
    category: (formData.get('category') as EventCategory) || 'etc',
    name,
    body: String(formData.get('body') ?? ''),
    venue: text(formData.get('venue')),
    location: text(formData.get('location')),
    country: text(formData.get('country')),
    starts_at: toIso(formData.get('starts_at')),
    ends_at: toIso(formData.get('ends_at')),
    booth_info: text(formData.get('booth_info')),
    external_link: text(formData.get('external_link')),
    participation_status: (formData.get('participation_status') as EventParticipation) || 'open',
    status: (formData.get('status') === 'published' ? 'published' : 'draft') as ContentStatus,
    is_pinned: formData.get('is_pinned') === 'on',
    registration_enabled: formData.get('registration_enabled') === 'on',
  };

  const { error } = id
    ? await ctx.supabase.from('events').update(row).eq('id', id)
    : await ctx.supabase.from('events').insert({ ...row, author_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  redirect('/admin/events');
}

export async function deleteEvent(id: string): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) return;
  await ctx.supabase.from('events').delete().eq('id', id);
  redirect('/admin/events');
}

export async function registerForEvent(eventId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  // 이미 신청했으면 재활성화, 없으면 생성(unique 제약).
  await supabase
    .from('event_registrations')
    .upsert(
      { event_id: eventId, profile_id: user.id, status: 'applied' },
      { onConflict: 'event_id,profile_id' },
    );
  revalidatePath(`/events/${eventId}`);
}

export async function cancelRegistration(eventId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('profile_id', user.id);
  revalidatePath(`/events/${eventId}`);
}
