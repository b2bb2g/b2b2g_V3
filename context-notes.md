# Context Notes — b2bb2g-v3

작업 중 내린 결정과 그 이유를 계속 append 한다. 다음 세션이 재유도 없이 이어갈 수 있도록 한다.

## 프로젝트 성격
- 단일 기준 문서: [B2B_플랫폼_기획설계서.md](B2B_플랫폼_기획설계서.md). 결정 변경 시 이 문서를 먼저 갱신한 뒤 코드에 반영한다.
- 개발 행동 지침: [CLAUDE.md](CLAUDE.md).
- 원격 저장소: https://github.com/b2bb2g/b2b2g_V3.git (SSH 별칭 `github-b2bb2g` → `b2bb2g` 계정으로만 push 가능).

## 주요 결정
- **[2026-07-03] v3는 v2를 참고만 하고 깨끗하게 새로 구축.** 옆 폴더 b2bb2g-v2에 거의 전체가 구현돼 있으나, 사용자 지시로 코드를 이식하지 않고 새 기획설계서 기준으로 새로 짓는다. v2는 라우트 구조·RLS 마이그레이션·auth/invitation 로직의 **참고 자료**로만 활용한다.
- **스택은 v2와 동일 버전으로 통일** — 검증된 조합이라 그대로 채택. Next.js 16 · React 19 · @supabase/ssr · Tailwind 4 · TypeScript 5(strict) · ESLint 9. i18n은 문서 권장대로 next-intl.
- **개발 순서는 수직 슬라이스 + 작은 단위**(문서 원칙 D). Phase 1을 한 번에 다 만들지 않는다.
  - 슬라이스 1(현재): 프로젝트 기반 골격 — Next.js 초기화, TS strict, ESLint/Prettier, Tailwind, i18n(en 기본 + ko) 뼈대, 환경설정 모듈(SSoT), 빌드 검증.
  - 이후 슬라이스: profiles+Auth+RLS 뼈대 → 가입/추천 흐름 A → 법적페이지·쿠키동의 → 이메일 발송 기반 → 공통 UX 컴포넌트.

## 문서에서 발견해 아직 반영 안 한 이슈 (착수 전 확정 대상)
- 로드맵 13장 Phase 1이 1~7, Phase 2가 다시 7부터 시작 — **번호 중복**. 문서 수정 보류 중.
- 바이어 가입경로(추천링크 전용) vs `registration_mode=open`(자율가입)의 긴장.
- ad_banners/popups 다국어 문구 처리 구체화 미흡.
- `reports`(신고·차단) 테이블 도입 여부(12.1에서 보류).
- 법적 페이지(약관·개인정보·쿠키)는 placeholder, 실서비스 전 변호사 검토 게이트 필요.

## Supabase 연결 정보 (슬라이스 2)
- **프로젝트 ref**: `hibmuepnzdutljloabjf`, **region: Singapore(`aws-1-ap-southeast-1`)**.
- **마이그레이션 적용 경로**: direct 연결(`db.<ref>.supabase.co:5432`)은 IPv6 전용이라 이 네트워크에서 `no route to host`로 실패. **transaction pooler(`aws-1-ap-southeast-1.pooler.supabase.com:6543`, IPv4)** 로 적용해야 함.
  - 적용 명령: `.env.local`의 `SUPABASE_DB_PASSWORD`로 URL 구성 후 `supabase db push --db-url ...`.
  - `db push`는 라이브 DB 쓰기라 auto mode 분류기가 막을 수 있음 → 사용자 명시 승인 필요.
- **타입 생성 주의**: `supabase gen types --db-url`은 로컬 컨테이너 런타임(podman/docker) 필요 → 이 환경엔 없음. 현재 [database.types.ts](src/lib/supabase/database.types.ts)는 마이그레이션에 맞춰 **손작성**. 컨테이너/access token 확보 시 자동 생성본으로 교체.
- **TS 타입 함정(해결됨)**: supabase-js의 `GenericTable`은 `Row: Record<string, unknown>`을 요구 → `Row`로 쓰는 타입과 최상위 `Database`는 반드시 **`type` 별칭**이어야 함(`interface`는 인덱스 시그니처가 없어 제약 불만족 → 조회 결과가 `never`로 폴백). database.types.ts에 주석으로 남김.

## [보안] DB 비밀번호 노출 — 조치 필요
- 슬라이스 2 작업 중 `supabase gen types` 실패 에러 로그에 **DB 비밀번호가 평문으로 출력됨**(CLI가 연결 문자열을 에러에 그대로 실음). 세션 로그에 남았으므로 **Supabase 대시보드에서 DB 비밀번호를 로테이션 권장**. 로테이션 후 `.env.local`의 `SUPABASE_DB_PASSWORD` 갱신.

## 배포 (진행 중) — [DEPLOY.md](DEPLOY.md) 참조
- **훅 엔드포인트 코드 완료** — `src/app/api/auth/email-hook/route.ts`(Standard Webhooks 서명검증, email_action_type별 템플릿, `/auth/callback` 연결). `AUTH_EMAIL_HOOK_SECRET` env 필요.
- **남은 것(사용자 직접)** — Vercel 프로젝트 생성·GitHub 연결, 환경변수 등록, Supabase Auth redirect URL + Send Email Hook URI/시크릿 설정. 절차는 DEPLOY.md.
- 최초 관리자: 배포 후 Supabase SQL Editor에서 `profiles.role='admin'`,`status='approved'` 직접 지정(가드는 백엔드/SQL 허용).

## i18n 방침
- 영어 기본 + 한국어. 사용자별 언어는 추후 `profiles.locale`. 슬라이스 1에서는 next-intl "without i18n routing" 구성으로 기본 en, 확장 가능 구조만 마련.
- 모든 UI 문구는 `messages/en.json`·`messages/ko.json` 언어팩 키로 관리. JSX에 문자열 직접 삽입 금지(0.1 규칙).
