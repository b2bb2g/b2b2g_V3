// 단축링크 진입점 /s/<slug>. RPC 로 대상 해석 + 클릭 증가 후 실제 경로로 리다이렉트.
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { targetPath } from '@/lib/shortlinks/resolve';

export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const { origin } = request.nextUrl;

  const supabase = await createClient();
  const { data } = await supabase.rpc('resolve_short_link', { p_slug: slug });
  const link = data?.[0];
  if (!link) return NextResponse.redirect(`${origin}/`);

  return NextResponse.redirect(`${origin}${targetPath(link.target_type, link.target_id, link.ref_code)}`);
}
