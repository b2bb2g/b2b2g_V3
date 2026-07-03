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
