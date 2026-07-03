# 배포 가이드 (Vercel + Supabase)

이 문서의 단계 중 **[직접]** 표시는 사용자가 직접 해야 하는 부분(계정 연결·비밀값 입력)이고, **[완료]** 는 코드로 준비된 부분이다.

## 사전 상태
- 앱 코드·마이그레이션은 GitHub `b2bb2g/b2b2g_V3` `main`에 있음.
- DB 마이그레이션은 **로컬에서 `supabase db push`** 로 적용한다(Vercel 빌드와 무관).
- 인증 메일은 **Supabase Custom SMTP(Resend SMTP)** 로 발송한다(아래 4단계).
  앱 알림 메일(문의·회신)은 우리 코드가 Resend API 로 직접 발송(별도 설정 불필요).

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
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인 (예: `https://b2bb2g.com`) |
| `EMAIL_API_KEY` | Resend API 키 |
| `EMAIL_FROM` | `B2BB2G <noreply@b2bb2g.com>` |

첫 배포 시 도메인을 모르면 임시로 두고, 배포 후 실제 도메인으로 `NEXT_PUBLIC_SITE_URL`을 갱신 → 재배포.

## 3. Supabase Auth URL 설정 **[직접]**
Supabase 대시보드 → Authentication → URL Configuration:
- **Site URL**: 배포 도메인
- **Redirect URLs**에 추가: `https://<도메인>/auth/callback`, `https://<도메인>/auth/reset-password`

## 4. Custom SMTP 설정 **[직접]** (인증 메일을 Resend SMTP 로 발송)
Supabase 대시보드 → Authentication → **Emails → SMTP Settings** → Enable Custom SMTP:
```
Host:         smtp.resend.com
Port:         465
Username:     resend
Password:     <Resend API 키, re_ 로 시작>
Sender email: noreply@b2bb2g.com
Sender name:  B2BB2G
```
- Authentication → Sign In / Providers → Email → **"Confirm email" 켜기**.
- Authentication → **Rate Limits → "Rate limit for sending emails"** 를 예상 볼륨에 맞게 상향(예: 100/h+, Resend 플랜 용량 이내).
- 참고: Auth Hooks(Send Email Hook)는 사용하지 않는다(SMTP 로 대체). 훅과 SMTP 를 동시에 켜면 훅이 우선하므로 훅은 비워둔다.

## 5. 배포 검증 **[직접/공동]**
1. 배포 완료 후 실제 회원가입 1회.
2. 확인 메일이 발신 `B2BB2G <noreply@b2bb2g.com>` 로 오는지 확인(SMTP 발송이라 `email_outbox`엔 안 남음).
3. 메일 링크 클릭 → `/auth/callback` → 세션 연결 → `/dashboard`.
4. 문의 작성 → 관리자 전달 → 공급사/바이어 **알림 메일**(우리 코드 발송, `email_outbox`에 기록)까지 실앱에서 확인.

## 참고
- **인증 메일 vs 알림 메일** — 인증 메일(가입확인·비번재설정)은 Supabase Custom SMTP(Resend SMTP)로, 문구는 Supabase → Email Templates 에서 수정. 앱 알림 메일(문의도착·회신도착)은 우리 코드가 Resend API 로 발송(`src/lib/email/`, `email_outbox` 기록).
- 관리자 계정: 최초 1명은 Supabase SQL Editor에서 해당 유저의 `profiles.role='admin'`, `status='approved'`로 직접 설정(가드는 백엔드/SQL 허용).
