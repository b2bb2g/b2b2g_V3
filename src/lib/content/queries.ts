// 공지·FAQ 조회. 공개 목록은 published 만, 관리자 목록은 전체(RLS 로 draft 접근 허용).
import { createClient } from '@/lib/supabase/server';
import type { FaqRow, NoticeRow } from '@/lib/supabase/database.types';

export async function listPublishedNotices(): Promise<NoticeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('notices')
    .select('*')
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  return data ?? [];
}

const NOTICE_NEW_WINDOW = 7 * 24 * 60 * 60 * 1000;
export type NoticeBoardItem = NoticeRow & { isNew: boolean };

// 게시판 목록: 최근 7일 이내 작성 여부(isNew)를 데이터 계층에서 계산(컴포넌트 렌더 순수성 유지).
export async function listPublishedNoticesBoard(): Promise<NoticeBoardItem[]> {
  const notices = await listPublishedNotices();
  const now = Date.now();
  return notices.map((n) => ({
    ...n,
    isNew: now - new Date(n.created_at).getTime() < NOTICE_NEW_WINDOW,
  }));
}

export async function getNotice(id: string): Promise<NoticeRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('notices').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function listPublishedFaqs(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('faqs')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getFaq(id: string): Promise<FaqRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('faqs').select('*').eq('id', id).maybeSingle();
  return data;
}

// 관리자용 전체 목록(draft 포함, RLS 가 admin 에게만 허용).
export async function listAllNotices(): Promise<NoticeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function listAllFaqs(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}
