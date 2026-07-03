'use server';
// 알림 읽음 처리(본인). RLS update_own 이 최종 방어.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('profile_id', user.id)
    .eq('read', false);
  revalidatePath('/dashboard/notifications');
}
