// 배너·팝업 조회. 공개는 활성+게재기간(RLS 로 강제), 관리자는 전체.
import { createClient } from '@/lib/supabase/server';
import type { AdBannerRow, PopupRow, PopupTarget } from '@/lib/supabase/database.types';

export async function listActiveBanners(): Promise<AdBannerRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('ad_banners')
    .select('*')
    .eq('is_active', true)
    .order('placement', { ascending: true })
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function listAllBanners(): Promise<AdBannerRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('ad_banners')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getBanner(id: string): Promise<AdBannerRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('ad_banners').select('*').eq('id', id).maybeSingle();
  return data;
}

// 대상 역할에 맞는 활성 팝업 중 우선순위 최상위 1건.
export async function getTopPopup(target: PopupTarget): Promise<PopupRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('popups')
    .select('*')
    .eq('is_active', true)
    .in('target', ['all', target])
    .order('priority', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function listAllPopups(): Promise<PopupRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getPopup(id: string): Promise<PopupRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('popups').select('*').eq('id', id).maybeSingle();
  return data;
}
