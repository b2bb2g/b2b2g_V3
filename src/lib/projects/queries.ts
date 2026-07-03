// EPC 프로젝트 조회. 공개 목록은 published, 관리자 목록은 전체.
import { createClient } from '@/lib/supabase/server';
import type { ProjectRow } from '@/lib/supabase/database.types';

export async function listPublishedProjects(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('starts_on', { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function listAllProjects(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}
