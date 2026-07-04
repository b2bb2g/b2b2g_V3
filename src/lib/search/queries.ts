import 'server-only';
// 통합(포털형) 검색. 활성 메뉴(menu_items)를 순회하며 각 라우트에 해당하는 콘텐츠를 검색한다.
// 섹션 타이틀은 메뉴 이름(label_ko/en)을 그대로 사용 → 관리자가 메뉴명을 바꾸면 검색 결과 제목도 따라간다(하드코딩 금지).
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import {
  listPublicProducts,
  getTopCategoryBySlug,
  listChildCategories,
} from '@/lib/products/queries';
import { listActiveMenu } from '@/lib/menu/queries';

export type SearchHit = { id: string; title: string; subtitle: string | null; href: string };
export type SearchGroup = { route: string; title: string; moreHref: string; hits: SearchHit[] };

type Ctx = { supabase: Awaited<ReturnType<typeof createClient>>; like: string; raw: string };

// 섹션(대분류) 제품 검색 — /commercial·/industrial. slug 하위 카테고리까지 포함.
async function sectionProductHits(slug: string, ctx: Ctx, limit: number): Promise<SearchHit[]> {
  const section = await getTopCategoryBySlug(slug);
  if (!section) return [];
  const children = await listChildCategories(section.id);
  const ids = [section.id, ...children.map((c) => c.id)];
  const products = await listPublicProducts({ categoryIds: ids, q: ctx.raw });
  return products.slice(0, limit).map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.companyName,
    href: `/products/${p.id}`,
  }));
}

async function hitsForRoute(route: string, ctx: Ctx, limit: number): Promise<SearchHit[]> {
  const { supabase, like } = ctx;
  switch (route) {
    case '/commercial':
      return sectionProductHits('commercial', ctx, limit);
    case '/industrial':
      return sectionProductHits('industrial', ctx, limit);
    case '/epc': {
      const { data } = await supabase
        .from('projects')
        .select('id, name, client')
        .eq('status', 'published')
        .or(`name.ilike.${like},body.ilike.${like}`)
        .limit(limit);
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.name,
        subtitle: r.client,
        href: `/epc/${r.id}`,
      }));
    }
    case '/requests': {
      const { data } = await supabase
        .from('public_product_requests')
        .select('id, title, target_country')
        .or(`title.ilike.${like},body.ilike.${like}`)
        .limit(limit);
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.target_country,
        href: `/requests/${r.id}`,
      }));
    }
    case '/events': {
      const { data } = await supabase
        .from('events')
        .select('id, name, venue')
        .eq('status', 'published')
        .or(`name.ilike.${like},body.ilike.${like}`)
        .limit(limit);
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.name,
        subtitle: r.venue,
        href: `/events/${r.id}`,
      }));
    }
    case '/services': {
      const { data } = await supabase
        .from('services')
        .select('id, title, summary')
        .eq('status', 'published')
        .or(`title.ilike.${like},summary.ilike.${like},body.ilike.${like}`)
        .limit(limit);
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.summary,
        href: `/services/${r.id}`,
      }));
    }
    case '/notices': {
      const { data } = await supabase
        .from('notices')
        .select('id, title')
        .eq('status', 'published')
        .or(`title.ilike.${like},body.ilike.${like}`)
        .limit(limit);
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: null,
        href: `/notices/${r.id}`,
      }));
    }
    case '/faq': {
      const { data } = await supabase
        .from('faqs')
        .select('id, question')
        .eq('status', 'published')
        .or(`question.ilike.${like},answer.ilike.${like}`)
        .limit(limit);
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.question,
        subtitle: null,
        href: '/faq',
      }));
    }
    default:
      return [];
  }
}

export async function globalSearch(q: string, perType = 5): Promise<SearchGroup[]> {
  const raw = q.trim();
  // or() 인젝션 방지: 구분자·와일드카드 제거(제품 검색과 동일 규칙).
  const safe = raw.replace(/[,()%\\*]/g, ' ').trim();
  if (!safe) return [];

  const supabase = await createClient();
  const locale = await getLocale();
  const menu = await listActiveMenu();
  const ctx: Ctx = { supabase, like: `%${safe}%`, raw };

  const groups = await Promise.all(
    menu.map(async (m) => {
      const hits = await hitsForRoute(m.route, ctx, perType);
      if (hits.length === 0) return null;
      const title = locale === 'ko' ? m.label_ko : m.label_en;
      return { route: m.route, title, moreHref: m.route, hits } satisfies SearchGroup;
    }),
  );

  return groups.filter((g): g is SearchGroup => g !== null);
}
