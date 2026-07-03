// 에이전트 산하 바이어 조회. 마스킹 뷰(agent_buyers)라 거래·식별정보는 제외된 기본 신호만.
import { createClient } from '@/lib/supabase/server';
import type { AgentBuyerRow } from '@/lib/supabase/database.types';

export async function listMyBuyers(): Promise<AgentBuyerRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agent_buyers')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}
