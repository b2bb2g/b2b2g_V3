// 리치 텍스트 본문 출력(XSS 방지). DOMPurify 로 새니타이즈 후 렌더. 서버 컴포넌트.
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li',
  'blockquote', 'hr', 'a', 'code', 'pre',
];

export function SafeHtml({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(https?:|mailto:|\/)/i,
  });

  return (
    <div
      className={
        className ??
        'prose prose-sm max-w-none leading-relaxed text-neutral-700 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-500 [&_a]:underline'
      }
      // 위에서 DOMPurify 로 정제한 안전한 HTML 만 주입.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
