// 리치 텍스트 본문 출력(XSS 방지). sanitize-html 로 새니타이즈 후 렌더. 서버 컴포넌트.
// DOM 의존이 없어 서버리스(Vercel)에서도 안전(이전 isomorphic-dompurify 의 jsdom 런타임 이슈 회피).
import sanitizeHtml from 'sanitize-html';

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li',
    'blockquote', 'hr', 'a', 'code', 'pre',
  ],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    // 외부 링크 안전 속성 부여(탭 탈취 방지).
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

export function SafeHtml({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  const clean = sanitizeHtml(html, OPTIONS);
  if (!clean) return null;

  return (
    <div
      className={
        className ??
        'prose prose-sm max-w-none leading-relaxed text-neutral-700 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-500 [&_a]:underline'
      }
      // sanitize-html 로 정제한 안전한 HTML 만 주입.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
