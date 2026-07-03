// 서비스 카탈로그 조회. 공개는 published, 관리자는 전체.
import { createClient } from '@/lib/supabase/server';
import type { ServiceRow } from '@/lib/supabase/database.types';

export async function listPublishedServices(): Promise<ServiceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getService(id: string): Promise<ServiceRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('services').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function listAllServices(): Promise<ServiceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });
  return data ?? [];
}
