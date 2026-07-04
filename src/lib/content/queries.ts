// 공지·FAQ 조회 + 게시판(카테고리·설정·페이지네이션). 공개 목록은 published 만.
import { createClient } from '@/lib/supabase/server';
import type {
  BoardCategoryRow,
  BoardSettingsRow,
  FaqRow,
  NoticeRow,
} from '@/lib/supabase/database.types';

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

// 게시판 카테고리(관리자 관리). 공개는 활성만(RLS).
export async function listBoardCategories(board = 'notices'): Promise<BoardCategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('board_categories')
    .select('*')
    .eq('board', board)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

// 게시판 설정(작성자/조회수 노출). 없으면 기본값.
export async function getBoardSettings(board = 'notices'): Promise<BoardSettingsRow> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('board_settings')
    .select('*')
    .eq('board', board)
    .maybeSingle();
  return data ?? { board, show_author: false, show_view_count: true, updated_at: '' };
}

export const NOTICE_PAGE_SIZE = 10;
const NEW_WINDOW = 7 * 24 * 60 * 60 * 1000;
const PERIOD_DAYS: Record<string, number> = { '1m': 30, '3m': 90, '1y': 365 };

export type NoticeBoardRow = {
  id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
  view_count: number;
  category: Pick<BoardCategoryRow, 'name_en' | 'name_ko'> | null;
  hasAttachment: boolean;
  isNew: boolean;
};

// 공지 게시판 목록: 카테고리·검색·기간 필터 + 페이지네이션 + 첨부 유무·카테고리명·NEW 계산.
export async function listNoticeBoard(opts: {
  category?: string;
  q?: string;
  period?: string;
  page?: number;
}): Promise<{ rows: NoticeBoardRow[]; total: number; page: number; pageSize: number }> {
  const supabase = await createClient();
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * NOTICE_PAGE_SIZE;
  const now = Date.now();

  let query = supabase
    .from('notices')
    .select('id, title, is_pinned, created_at, view_count, category_id', { count: 'exact' })
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, from + NOTICE_PAGE_SIZE - 1);

  if (opts.category) query = query.eq('category_id', opts.category);
  const safe = opts.q?.replace(/[,()%\\*]/g, ' ').trim();
  if (safe) query = query.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`);
  const days = opts.period ? PERIOD_DAYS[opts.period] : undefined;
  if (days) query = query.gte('created_at', new Date(now - days * 86400000).toISOString());

  const { data, count } = await query;
  const base = data ?? [];

  const cats = await listBoardCategories('notices');
  const catById = new Map(cats.map((c) => [c.id, c]));

  let attIds = new Set<string>();
  if (base.length > 0) {
    const { data: atts } = await supabase
      .from('board_attachments')
      .select('owner_id')
      .eq('owner_type', 'notice')
      .eq('inline', false)
      .in(
        'owner_id',
        base.map((r) => r.id),
      );
    attIds = new Set((atts ?? []).map((a) => a.owner_id));
  }

  const rows: NoticeBoardRow[] = base.map((r) => {
    const c = r.category_id ? catById.get(r.category_id) : null;
    return {
      id: r.id,
      title: r.title,
      is_pinned: r.is_pinned,
      created_at: r.created_at,
      view_count: r.view_count,
      category: c ? { name_en: c.name_en, name_ko: c.name_ko } : null,
      hasAttachment: attIds.has(r.id),
      isNew: now - new Date(r.created_at).getTime() < NEW_WINDOW,
    };
  });

  return { rows, total: count ?? 0, page, pageSize: NOTICE_PAGE_SIZE };
}

// 조회수 증가(상세 진입 시). definer RPC 로 published 만.
export async function bumpNoticeView(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc('increment_notice_view', { p_id: id });
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
