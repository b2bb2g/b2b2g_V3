'use server';
// 문의·견적 작성 서버 액션(회원만). requester_id=본인, RLS insert_own 이 최종 방어.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { inquirySchema } from './schema';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createInquiry(
  productId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse({
    type: formData.get('type'),
    content: formData.get('content'),
  });
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { error } = await supabase.from('inquiries').insert({
    product_id: productId,
    requester_id: user.id,
    type: parsed.data.type,
    content: parsed.data.content,
  });
  if (error) return { ok: false, error: error.message };

  redirect('/dashboard/inquiries');
}
