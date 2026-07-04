import 'server-only';
// 관리자 초대: 현재 관리자 추천코드(초대 링크 기준값) + 전체 회원 초대 트리(referred_by) 조회.
import { createClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env';
import type { ProfileRow } from '@/lib/supabase/database.types';

export type InviteContext = { referralCode: string | null; siteUrl: string };

export async function getInviteContext(): Promise<InviteContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let referralCode: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();
    referralCode = data?.referral_code ?? null;
  }
  return { referralCode, siteUrl: publicEnv.siteUrl };
}

export type TreeNode = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: ProfileRow['role'];
  status: ProfileRow['status'];
  children: TreeNode[];
};

// 전체 회원을 referred_by 기준 트리로 구성. 루트 = 추천인 없음(직접가입/관리자 생성).
export async function getReferralTree(): Promise<TreeNode[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, status, referred_by, created_at')
    .order('created_at', { ascending: true });
  const rows = data ?? [];

  const byId = new Map<string, TreeNode>();
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      display_name: r.display_name,
      email: r.email,
      role: r.role,
      status: r.status,
      children: [],
    });
  }

  const roots: TreeNode[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    const parent = r.referred_by ? byId.get(r.referred_by) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}
