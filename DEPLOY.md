# 배포 가이드 (Vercel + Supabase)

이 문서의 단계 중 **[직접]** 표시는 사용자가 직접 해야 하는 부분(계정 연결·비밀값 입력)이고, **[완료]** 는 코드로 준비된 부분이다.

## 사전 상태
- 앱 코드·마이그레이션은 GitHub `b2bb2g/b2b2g_V3` `main`에 있음.
- DB 마이그레이션은 **로컬에서 `supabase db push`** 로 적용한다(Vercel 빌드와 무관).
- Auth Send Email Hook 엔드포인트 코드 **[완료]** — `src/app/api/auth/email-hook/route.ts`.

## 1. Vercel 프로젝트 생성 **[직접]**
1. https://vercel.com → New Project → `b2bb2g/b2b2g_V3` import.
2. Framework: Next.js 자동 감지(빌드 설정 변경 불필요).

## 2. 환경변수 등록 (Vercel → Settings → Environment Variables) **[직접]**
`.env.local`에서 아래 값을 옮긴다. `SUPABASE_DB_PASSWORD`는 **넣지 않는다**(로컬 마이그레이션 전용).

| 변수 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (비밀) |
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인 (예: `https://xxx.vercel.app`) |
| `EMAIL_API_KEY` | Resend API 키 |
| `EMAIL_FROM` | `noreply@b2bb2g.com` |
| `AUTH_EMAIL_HOOK_SECRET` | (4단계에서 발급 후 입력) |

첫 배포 시 도메인을 모르면 임시로 두고, 배포 후 실제 도메인으로 `NEXT_PUBLIC_SITE_URL`을 갱신 → 재배포.

## 3. Supabase Auth URL 설정 **[직접]**
Supabase 대시보드 → Authentication → URL Configuration:
- **Site URL**: 배포 도메인
- **Redirect URLs**에 추가: `https://<도메인>/auth/callback`, `https://<도메인>/auth/reset-password`

## 4. Send Email Hook 설정 **[직접]** (가입 인증 메일을 우리 Resend 발송으로 대체)
Supabase 대시보드 → Authentication → Hooks → **Send Email Hook**:
1. Enable, Type = HTTPS.
2. URL = `https://<도메인>/api/auth/email-hook`
3. 발급된 **시크릿**(형식 `v1,whsec_...`)을 복사 → Vercel 환경변수 `AUTH_EMAIL_HOOK_SECRET`에 입력 → 재배포.

## 5. 배포 검증 **[직접/공동]**
1. 배포 완료 후 실제 회원가입 1회.
2. 확인 메일이 Resend(발신 `noreply@b2bb2g.com`)로 오는지, `email_outbox`에 `signup_verify` 발송 기록이 남는지 확인.
3. 메일 링크 클릭 → `/auth/callback` → 세션 연결 → `/dashboard`.
4. 문의 작성 → 관리자 전달 → 공급사/바이어 알림 메일까지 실앱에서 확인.

## 참고
- 훅을 켜면 비밀번호 재설정도 이 경로를 탈 수 있음(선택). 현재 `generateLink` 방식과 공존.
- 관리자 계정: 최초 1명은 Supabase SQL Editor에서 해당 유저의 `profiles.role='admin'`, `status='approved'`로 직접 설정(가드는 백엔드/SQL 허용).
