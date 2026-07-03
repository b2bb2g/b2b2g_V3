// 내 알림 조회. RLS 로 본인 것만.
import { createClient } from '@/lib/supabase/server';
import type { NotificationRow } from '@/lib/supabase/database.types';

export async function listMyNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function unreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);
  return count ?? 0;
}
