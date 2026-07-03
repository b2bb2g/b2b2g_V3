'use server';
// 공급사 회신 액션. RLS(공급사 insert 정책)가 소유·상태 검증, 트리거가 status→replied.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ReplyResult = { ok: true } | { ok: false; error: string };

export async function replyToInquiry(
  inquiryId: string,
  _prev: ReplyResult | null,
  formData: FormData,
): Promise<ReplyResult> {
  const body = String(formData.get('body') ?? '').trim();
  if (!body) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { error } = await supabase.from('inquiry_messages').insert({
    inquiry_id: inquiryId,
    author_id: user.id,
    author_role: 'supplier',
    body,
    visible_to: 'all',
  });
  if (error) return { ok: false, error: error.message };

  redirect(`/dashboard/supplier-inquiries/${inquiryId}`);
}
