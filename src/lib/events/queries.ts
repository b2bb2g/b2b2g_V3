// 이벤트 조회. 공개 목록은 published, 관리자 목록은 전체. 참가신청 상태 조회 포함.
import { createClient } from '@/lib/supabase/server';
import type { EventRegistrationRow, EventRow } from '@/lib/supabase/database.types';

export async function listPublishedEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('starts_at', { ascending: true, nullsFirst: false });
  return data ?? [];
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function listAllEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getMyRegistration(eventId: string): Promise<EventRegistrationRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('profile_id', user.id)
    .maybeSingle();
  return data;
}
