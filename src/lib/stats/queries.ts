// 랜딩 익명 활동 신호 조회. 집계 수치만(개인정보 없음). definer 함수 호출.
import { createClient } from '@/lib/supabase/server';

export type PlatformStats = {
  verifiedSuppliers: number;
  listedProducts: number;
  openRequests: number;
  recentInquiries: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('platform_stats');
  const row = data?.[0];
  return {
    verifiedSuppliers: Number(row?.verified_suppliers ?? 0),
    listedProducts: Number(row?.listed_products ?? 0),
    openRequests: Number(row?.open_requests ?? 0),
    recentInquiries: Number(row?.recent_inquiries ?? 0),
  };
}
