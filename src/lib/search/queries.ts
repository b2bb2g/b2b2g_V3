import 'server-only';
// 통합(포털형) 검색. 제품·EPC·요청·행사·서비스·공지·FAQ 를 한 번에 검색해 유형별로 묶어 반환.
// 공개 규칙(published/listed)·마스킹 뷰(요청)를 각 소스에서 그대로 적용해 권한이 새지 않는다.
import { createClient } from '@/lib/supabase/server';
import { listPublicProducts } from '@/lib/products/queries';

export type SearchType =
  | 'products'
  | 'epc'
  | 'requests'
  | 'events'
  | 'services'
  | 'notices'
  | 'faq';

export type SearchHit = { id: string; title: string; subtitle: string | null; href: string };
export type SearchGroup = { type: SearchType; moreHref: string; hits: SearchHit[] };

export async function globalSearch(q: string, perType = 5): Promise<SearchGroup[]> {
  const raw = q.trim();
  // or() 인젝션 방지: 구분자·와일드카드 제거(제품 검색과 동일 규칙).
  const safe = raw.replace(/[,()%\\*]/g, ' ').trim();
  if (!safe) return [];

  const supabase = await createClient();
  const like = `%${safe}%`;

  const [products, projects, requests, events, services, notices, faqs] = await Promise.all([
    listPublicProducts({ q: raw }),
    supabase
      .from('projects')
      .select('id, name, client')
      .eq('status', 'published')
      .or(`name.ilike.${like},body.ilike.${like}`)
      .limit(perType),
    supabase
      .from('public_product_requests')
      .select('id, title, target_country')
      .or(`title.ilike.${like},body.ilike.${like}`)
      .limit(perType),
    supabase
      .from('events')
      .select('id, name, venue')
      .eq('status', 'published')
      .or(`name.ilike.${like},body.ilike.${like}`)
      .limit(perType),
    supabase
      .from('services')
      .select('id, title, summary')
      .eq('status', 'published')
      .or(`title.ilike.${like},summary.ilike.${like},body.ilike.${like}`)
      .limit(perType),
    supabase
      .from('notices')
      .select('id, title')
      .eq('status', 'published')
      .or(`title.ilike.${like},body.ilike.${like}`)
      .limit(perType),
    supabase
      .from('faqs')
      .select('id, question')
      .eq('status', 'published')
      .or(`question.ilike.${like},answer.ilike.${like}`)
      .limit(perType),
  ]);

  const groups: SearchGroup[] = [
    {
      type: 'products',
      moreHref: '/commercial',
      hits: products.slice(0, perType).map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.companyName,
        href: `/products/${p.id}`,
      })),
    },
    {
      type: 'epc',
      moreHref: '/epc',
      hits: (projects.data ?? []).map((r) => ({
        id: r.id,
        title: r.name,
        subtitle: r.client,
        href: `/epc/${r.id}`,
      })),
    },
    {
      type: 'requests',
      moreHref: '/requests',
      hits: (requests.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.target_country,
        href: `/requests/${r.id}`,
      })),
    },
    {
      type: 'events',
      moreHref: '/events',
      hits: (events.data ?? []).map((r) => ({
        id: r.id,
        title: r.name,
        subtitle: r.venue,
        href: `/events/${r.id}`,
      })),
    },
    {
      type: 'services',
      moreHref: '/services',
      hits: (services.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.summary,
        href: `/services/${r.id}`,
      })),
    },
    {
      type: 'notices',
      moreHref: '/notices',
      hits: (notices.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: null,
        href: `/notices/${r.id}`,
      })),
    },
    {
      type: 'faq',
      moreHref: '/faq',
      hits: (faqs.data ?? []).map((r) => ({
        id: r.id,
        title: r.question,
        subtitle: null,
        href: '/faq',
      })),
    },
  ];

  return groups.filter((g) => g.hits.length > 0);
}
