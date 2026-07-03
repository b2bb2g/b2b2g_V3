-- 제품 승인/반려 알림 이메일 템플릿 추가(로드맵 7·9: 승인·반려 메일). notifications.type 은 text 라 별도 변경 불필요.
alter type public.email_template add value if not exists 'product_approved';
alter type public.email_template add value if not exists 'product_rejected';
