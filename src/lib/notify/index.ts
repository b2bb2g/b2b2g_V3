import 'server-only';
// 이벤트 알림(앱 내 + 이메일). service_role 로 대상 조회·알림 생성 — 공급사에겐 바이어 정보 비노출.
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';

// 문의 전달됨 → 공급사(제품 소유자)에게 알림. 바이어 식별정보는 포함하지 않는다.
export async function notifyInquiryForwarded(inquiryId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: inquiry } = await admin
    .from('inquiries')
    .select('product_id')
    .eq('id', inquiryId)
    .maybeSingle();
  if (!inquiry) return;

  const { data: product } = await admin
    .from('products')
    .select('title, supplier_id')
    .eq('id', inquiry.product_id)
    .maybeSingle();
  if (!product) return;

  const { data: supplier } = await admin
    .from('suppliers')
    .select('profile_id')
    .eq('id', product.supplier_id)
    .maybeSingle();
  if (!supplier) return;

  const { data: profile } = await admin
    .from('profiles')
    .select('email, locale')
    .eq('id', supplier.profile_id)
    .maybeSingle();

  await admin.from('notifications').insert({
    profile_id: supplier.profile_id,
    type: 'inquiry_received',
    payload: { productTitle: product.title, inquiryId },
  });

  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      template: 'inquiry_received',
      locale: profile.locale ?? 'en',
      payload: { productTitle: product.title },
      profileId: supplier.profile_id,
    });
  }
}

// 공급사 회신 → 바이어(요청자)에게 알림.
export async function notifyInquiryReplied(inquiryId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: inquiry } = await admin
    .from('inquiries')
    .select('requester_id, product_id')
    .eq('id', inquiryId)
    .maybeSingle();
  if (!inquiry) return;

  const [{ data: profile }, { data: product }] = await Promise.all([
    admin.from('profiles').select('email, locale').eq('id', inquiry.requester_id).maybeSingle(),
    admin.from('products').select('title').eq('id', inquiry.product_id).maybeSingle(),
  ]);

  await admin.from('notifications').insert({
    profile_id: inquiry.requester_id,
    type: 'inquiry_replied',
    payload: { productTitle: product?.title ?? null, inquiryId },
  });

  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      template: 'inquiry_replied',
      locale: profile.locale ?? 'en',
      payload: { productTitle: product?.title ?? '' },
      profileId: inquiry.requester_id,
    });
  }
}

// 제품 승인/반려 → 공급사(제품 소유자)에게 알림 + 이메일.
async function notifyProductDecision(
  productId: string,
  decision: 'product_approved' | 'product_rejected',
): Promise<void> {
  const admin = createAdminClient();
  const { data: product } = await admin
    .from('products')
    .select('title, supplier_id')
    .eq('id', productId)
    .maybeSingle();
  if (!product) return;

  const { data: supplier } = await admin
    .from('suppliers')
    .select('profile_id')
    .eq('id', product.supplier_id)
    .maybeSingle();
  if (!supplier) return;

  const { data: profile } = await admin
    .from('profiles')
    .select('email, locale, display_name')
    .eq('id', supplier.profile_id)
    .maybeSingle();

  await admin.from('notifications').insert({
    profile_id: supplier.profile_id,
    type: decision,
    payload: { productTitle: product.title, productId },
  });

  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      template: decision,
      locale: profile.locale ?? 'en',
      payload: { name: profile.display_name, productTitle: product.title },
      profileId: supplier.profile_id,
    });
  }
}

export const notifyProductApproved = (id: string) => notifyProductDecision(id, 'product_approved');
export const notifyProductRejected = (id: string) => notifyProductDecision(id, 'product_rejected');

// 회원(공급사) 승인/반려 → 당사자에게 알림 + 이메일.
async function notifyMemberDecision(profileId: string, approved: boolean): Promise<void> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('email, locale, display_name')
    .eq('id', profileId)
    .maybeSingle();
  if (!profile) return;

  await admin.from('notifications').insert({
    profile_id: profileId,
    type: approved ? 'member_approved' : 'member_rejected',
    payload: {},
  });

  if (profile.email) {
    await sendEmail({
      to: profile.email,
      template: approved ? 'supplier_approved' : 'supplier_rejected',
      locale: profile.locale ?? 'en',
      payload: { name: profile.display_name },
      profileId,
    });
  }
}

export const notifyMemberApproved = (id: string) => notifyMemberDecision(id, true);
export const notifyMemberRejected = (id: string) => notifyMemberDecision(id, false);
