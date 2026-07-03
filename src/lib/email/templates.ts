// 이메일 템플릿(언어별). 문구는 여기서만 관리하고 발송 로직엔 하드코딩하지 않는다(0.1 규칙).
// UI 문구(next-intl)와 분리된 서버 전용 템플릿 소스. 미정의 템플릿은 generic 으로 폴백.
import type { EmailTemplate } from '@/lib/supabase/database.types';

export type EmailLocale = 'en' | 'ko';
export type EmailPayload = Record<string, string | number | null | undefined>;
export type RenderedEmail = { subject: string; html: string };

type TemplateFn = (payload: EmailPayload) => RenderedEmail;
type LocaleTemplates = Record<EmailLocale, TemplateFn>;

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#171717;">${bodyHtml}</body></html>`;
}

// 템플릿별 언어별 렌더러. 필요한 것부터 정의하고 나머지는 generic 폴백.
const TEMPLATES: Partial<Record<EmailTemplate, LocaleTemplates>> = {
  signup_verify: {
    en: (p) => ({
      subject: 'Confirm your email',
      html: wrap(
        `<h2>Confirm your email</h2><p>Click the link below to activate your account.</p><p><a href="${esc(p.url)}">Confirm email</a></p>`,
      ),
    }),
    ko: (p) => ({
      subject: '이메일을 확인해주세요',
      html: wrap(
        `<h2>이메일 확인</h2><p>아래 링크를 눌러 계정을 활성화하세요.</p><p><a href="${esc(p.url)}">이메일 확인하기</a></p>`,
      ),
    }),
  },
  password_reset: {
    en: (p) => ({
      subject: 'Reset your password',
      html: wrap(
        `<h2>Reset your password</h2><p>Click the link below to set a new password.</p><p><a href="${esc(p.url)}">Reset password</a></p>`,
      ),
    }),
    ko: (p) => ({
      subject: '비밀번호 재설정',
      html: wrap(
        `<h2>비밀번호 재설정</h2><p>아래 링크를 눌러 새 비밀번호를 설정하세요.</p><p><a href="${esc(p.url)}">비밀번호 재설정</a></p>`,
      ),
    }),
  },
  supplier_approved: {
    en: (p) => ({
      subject: 'Your supplier account is approved',
      html: wrap(
        `<h2>Approved</h2><p>Hi ${esc(p.name)}, your supplier account has been approved. You can now sign in.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '공급사 계정이 승인되었습니다',
      html: wrap(
        `<h2>승인 완료</h2><p>${esc(p.name)} 님, 공급사 계정이 승인되었습니다. 이제 로그인하실 수 있습니다.</p>`,
      ),
    }),
  },
  supplier_rejected: {
    en: (p) => ({
      subject: 'Your account review update',
      html: wrap(
        `<h2>Review update</h2><p>Hi ${esc(p.name)}, your account could not be approved at this time. Please contact us for details.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '계정 검토 결과 안내',
      html: wrap(
        `<h2>검토 결과</h2><p>${esc(p.name)} 님, 현재 계정을 승인하지 못했습니다. 자세한 사항은 문의해주세요.</p>`,
      ),
    }),
  },
  product_approved: {
    en: (p) => ({
      subject: 'Your product is now listed',
      html: wrap(
        `<h2>Product approved</h2><p>Hi ${esc(p.name)}, your product "${esc(p.productTitle)}" has been approved and is now visible to buyers.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '제품이 공개되었습니다',
      html: wrap(
        `<h2>제품 승인</h2><p>${esc(p.name)} 님, 제품 "${esc(p.productTitle)}" 이(가) 승인되어 바이어에게 공개되었습니다.</p>`,
      ),
    }),
  },
  product_rejected: {
    en: (p) => ({
      subject: 'Your product review update',
      html: wrap(
        `<h2>Product review update</h2><p>Hi ${esc(p.name)}, your product "${esc(p.productTitle)}" was not approved. You can edit and resubmit it.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '제품 검토 결과 안내',
      html: wrap(
        `<h2>제품 검토 결과</h2><p>${esc(p.name)} 님, 제품 "${esc(p.productTitle)}" 이(가) 반려되었습니다. 수정 후 다시 제출하실 수 있습니다.</p>`,
      ),
    }),
  },
  inquiry_received: {
    en: (p) => ({
      subject: 'New inquiry received',
      html: wrap(
        `<h2>New inquiry</h2><p>You received a new inquiry for <strong>${esc(p.productTitle)}</strong>. Sign in to review and reply.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '새 문의가 도착했습니다',
      html: wrap(
        `<h2>새 문의</h2><p><strong>${esc(p.productTitle)}</strong> 에 새 문의가 도착했습니다. 로그인해 확인·회신하세요.</p>`,
      ),
    }),
  },
  inquiry_replied: {
    en: (p) => ({
      subject: 'You have a reply',
      html: wrap(
        `<h2>Reply received</h2><p>Your inquiry about <strong>${esc(p.productTitle)}</strong> has a reply. Sign in to view it.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '회신이 도착했습니다',
      html: wrap(
        `<h2>회신 도착</h2><p><strong>${esc(p.productTitle)}</strong> 문의에 회신이 도착했습니다. 로그인해 확인하세요.</p>`,
      ),
    }),
  },
  event_reminder: {
    en: (p) => ({
      subject: 'Event reminder',
      html: wrap(
        `<h2>Upcoming event</h2><p>Your registered event <strong>${esc(p.eventName)}</strong> starts on ${esc(p.when)}. We look forward to seeing you.</p>`,
      ),
    }),
    ko: (p) => ({
      subject: '행사 리마인더',
      html: wrap(
        `<h2>다가오는 행사</h2><p>신청하신 <strong>${esc(p.eventName)}</strong> 행사가 ${esc(p.when)}에 시작됩니다. 참여를 기다립니다.</p>`,
      ),
    }),
  },
  generic: {
    en: (p) => ({
      subject: esc(p.subject) || 'Notification',
      html: wrap(`<p>${esc(p.body)}</p>`),
    }),
    ko: (p) => ({
      subject: esc(p.subject) || '알림',
      html: wrap(`<p>${esc(p.body)}</p>`),
    }),
  },
};

export function renderEmail(
  template: EmailTemplate,
  locale: string,
  payload: EmailPayload,
): RenderedEmail {
  const loc: EmailLocale = locale === 'ko' ? 'ko' : 'en';
  const set = TEMPLATES[template] ?? TEMPLATES.generic!;
  return set[loc](payload);
}
