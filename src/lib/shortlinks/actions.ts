'use server';
// 단축링크 생성(로그인 사용자). 대상별로 slug 발급 후 짧은 URL + QR 데이터URL 을 돌려준다.
import { createClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env';
import { qrDataUrl } from '@/lib/shortlinks/qr';
import type { ShortLinkTarget } from '@/lib/supabase/database.types';

export type ShareLink = { ok: true; url: string; qr: string } | { ok: false };

// base62 짧은 코드.
function genSlug(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export async function createShortLink(
  targetType: ShortLinkTarget,
  targetId: string | null,
  refCode: string | null,
): Promise<ShareLink> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // 기존에 같은 대상으로 만든 링크가 있으면 재사용(중복 발급 방지).
  let query = supabase
    .from('short_links')
    .select('slug')
    .eq('created_by', user.id)
    .eq('target_type', targetType)
    .eq('is_active', true)
    .limit(1);
  query = targetId ? query.eq('target_id', targetId) : query.is('target_id', null);
  const { data: existing } = await query.maybeSingle();

  let slug = existing?.slug ?? null;
  if (!slug) {
    slug = genSlug();
    const { error } = await supabase.from('short_links').insert({
      slug,
      target_type: targetType,
      target_id: targetId,
      ref_code: refCode,
      created_by: user.id,
    });
    if (error) return { ok: false };
  }

  const url = `${publicEnv.siteUrl}/s/${slug}`;
  return { ok: true, url, qr: await qrDataUrl(url) };
}
