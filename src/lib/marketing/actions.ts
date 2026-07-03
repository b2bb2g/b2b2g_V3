'use server';
// 배너·팝업 관리자 CRUD. RLS 최종 방어.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type {
  BannerPlacement,
  PopupContentType,
  PopupDismiss,
  PopupTarget,
} from '@/lib/supabase/database.types';

export type MarketingResult = { ok: true } | { ok: false; error: string };

const text = (v: FormDataEntryValue | null): string | null => String(v ?? '').trim() || null;
const ts = (v: FormDataEntryValue | null): string | null => {
  const s = String(v ?? '').trim();
  return s ? new Date(s).toISOString() : null;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? supabase : null;
}

export async function saveBanner(
  _prev: MarketingResult | null,
  formData: FormData,
): Promise<MarketingResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: 'forbidden' };
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, error: 'invalid_input' };
  const id = (formData.get('id') as string) || null;

  const row = {
    title,
    image: text(formData.get('image')),
    headline: text(formData.get('headline')),
    subtext: text(formData.get('subtext')),
    link_url: text(formData.get('link_url')),
    placement: (formData.get('placement') as BannerPlacement) || 'mid',
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    start_at: ts(formData.get('start_at')),
    end_at: ts(formData.get('end_at')),
    is_active: formData.get('is_active') === 'on',
  };

  const { error } = id
    ? await supabase.from('ad_banners').update(row).eq('id', id)
    : await supabase.from('ad_banners').insert(row);
  if (error) return { ok: false, error: error.message };
  redirect('/admin/banners');
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('ad_banners').delete().eq('id', id);
  redirect('/admin/banners');
}

export async function savePopup(
  _prev: MarketingResult | null,
  formData: FormData,
): Promise<MarketingResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: 'forbidden' };
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, error: 'invalid_input' };
  const id = (formData.get('id') as string) || null;

  const row = {
    title,
    content_type: (formData.get('content_type') as PopupContentType) || 'image_with_text',
    image: text(formData.get('image')),
    body: text(formData.get('body')),
    link_url: text(formData.get('link_url')),
    target: (formData.get('target') as PopupTarget) || 'all',
    start_at: ts(formData.get('start_at')),
    end_at: ts(formData.get('end_at')),
    priority: Number(formData.get('priority') ?? 0) || 0,
    dismiss_option: (formData.get('dismiss_option') as PopupDismiss) || 'close_only',
    is_active: formData.get('is_active') === 'on',
  };

  const { error } = id
    ? await supabase.from('popups').update(row).eq('id', id)
    : await supabase.from('popups').insert(row);
  if (error) return { ok: false, error: error.message };
  redirect('/admin/popups');
}

export async function deletePopup(id: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('popups').delete().eq('id', id);
  redirect('/admin/popups');
}
