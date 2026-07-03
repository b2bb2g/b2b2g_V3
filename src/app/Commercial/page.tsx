// Commercial 섹션 제품 페이지(EPC/Events 처럼 개별 상위 라우트).
import { SectionProducts } from '@/components/SectionProducts';

export default async function CommercialPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  return <SectionProducts name="Commercial" basePath="/commercial" selectedChild={category} q={q} />;
}
