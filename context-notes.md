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

## 배포 (완료) — [DEPLOY.md](DEPLOY.md)
- **라이브**: https://b2bb2g.com (Vercel, 커스텀 도메인). Supabase 프로젝트 ap-southeast-1.
- **인증 메일**: Supabase **Custom SMTP = Resend SMTP**(smtp.resend.com:465, user `resend`, pass=Resend키, sender `B2BB2G <noreply@b2bb2g.com>`). Confirm email ON. 이메일 rate limit 100/h.
  - **[결정] Send Email Hook 방식은 폐기** — 시크릿 매칭이 계속 어긋나 SMTP로 전환. 훅 라우트/`standardwebhooks` 의존성 제거함. SMTP와 훅 동시 활성 시 훅 우선이라 훅은 비활성.
  - 인증 메일 문구는 Supabase Email Templates에서 관리(우리 email_outbox엔 안 남음).
- **앱 알림 메일**(문의·회신): 우리 코드가 Resend API로 직접 발송(`src/lib/email/`, `email_outbox` 기록) — SMTP와 무관하게 동작.
- 최초 관리자: Supabase SQL Editor에서 `update public.profiles set role='admin',status='approved' where email='...'` (가드는 백엔드/SQL 허용).

## i18n 방침
- 영어 기본 + 한국어. 사용자별 언어는 추후 `profiles.locale`. 슬라이스 1에서는 next-intl "without i18n routing" 구성으로 기본 en, 확장 가능 구조만 마련.
- 모든 UI 문구는 `messages/en.json`·`messages/ko.json` 언어팩 키로 관리. JSX에 문자열 직접 삽입 금지(0.1 규칙).

## 2026-07-03 세션 — 인증 UX + Phase 4 완주(4.3~4.8)

- 비밀번호 재설정: PKCE 흐름이라 token_hash+`{{.Type}}` 대신 `{{.ConfirmationURL}}` 사용(콜백 code 교환). 재설정/이메일확인 후 로그아웃→로그인 재유도 + 안내 배너(한/영).
- 로그인 기능: 로그인 상태 유지(auth_remember=0 시 sb-* 세션쿠키 강등, server/middleware setAll), IP보안(auth_ip 고정, proxy 대조·변경 시 로그아웃). 로그인 직후 환영 배너.
- 4.3 EPC projects / 4.4 RFQ product_requests(+마스킹 뷰 public_product_requests) / 4.5 board_attachments(다형 가시성 함수 board_owner_visible + board-media 버킷 + 표시/업로더 컴포넌트) / 4.6 menu_items·services(동적 MainNav) / 4.7 short_links(+resolve_short_link RPC, /s/[slug], qrcode) / 4.8 ad_banners·popups(랜딩 BannerSlot/Popup).
- 마이그레이션 6종 모두 프로덕션 적용 + anon RLS 검증(insert 42501 차단 확인). 각 슬라이스 커밋·push→Vercel 자동 배포.

### 후속(시각 QA 필요/미완)
- WYSIWYG 리치텍스트 툴바(TipTap 등) — 라이브러리 도입 + 브라우저 QA 필요. 현재 본문은 textarea + 새니타이즈 없는 whitespace-pre-line(외부 HTML 미허용이라 XSS 위험 낮음).
- board_attachments 표시/업로더를 공지·FAQ·행사 보드에도 연결(현재 EPC·RFQ만). 동일 컴포넌트 재사용.
- 추천가입 QR(에이전트 referral_code) — ShareWidget 재사용.
- 배너/팝업/공유/업로더 등 상호작용 UI는 build+RLS로만 검증 → 실제 브라우저 동작 QA 권장.

## Phase 5 — 초대 관리 + 메뉴 샘플 시드 (2026-07-04)

### 초대 링크 "작동 안됨" 진단
- DB 경로는 정상: 단축링크 생성 → resolve_short_link RPC(anon) → /auth/signup?ref= → 가입 트리거 handle_new_user 가 ref→referred_by 설정. anon RPC 라이브 테스트 통과.
- 실제 문제는 발견성: 개인 추천 위젯이 대시보드에만 있어 관리자가 관리·초대·집계 불가. 관리자 이관이 실질적 해결.

### 초대 방식 결정: "둘 다"(사용자 선택)
- **초대 링크**: supplier·buyer 만 제공. self-signup 스키마(SELF_SIGNUP_ROLES=supplier,buyer)가 role 을 검증하므로 agent 링크는 폼에서 막힘 → 링크는 두 역할만.
  - 링크 형식: {siteUrl}/auth/signup?ref={관리자 referral_code}&role={role}. role 파라미터로 가입폼 역할 프리셋(SignupForm presetRole). referred_by=관리자 → 트리 루트가 관리자.
- **이메일 초대**: buyer·supplier·agent 전부. admin.inviteUserByEmail(service_role) 로 role·ref 메타데이터 주입 → 트리거가 role 반영(agent 포함, 폼 우회). 감사로그(action=create, target_table=invite).
  - 초대 수락 흐름: GoTrue invite 메일 → 우리 Send Email Hook(email_action_type=invite) → signup_verify 템플릿. mapAction invite next 를 /dashboard → **/auth/reset-password** 로 변경(수락자가 비번 없으므로 세션 유지한 채 비번 설정). 콜백 route 는 next=/auth/reset-password 면 세션 유지.

### 초대 트리
- getReferralTree(): 전체 profiles 를 referred_by 로 트리화. 루트=추천인 없음(직접가입/관리자직생성). /admin/invites 재귀 TreeList 렌더. 이름→/admin/members/[id] 링크.

### 메뉴 샘플 시드 (마이그레이션 20260704220000_sample_content)
- idempotent: 테이블별 count<12 일 때만 generate_series(1..12) 삽입. 운영 데이터 차오르면 자동 skip.
- Commercial/Industrial 제품(supplier=첫 공급사, status=listed), EPC projects(published), requests(listed, requester=첫 buyer/agent), events/services/notices/faqs(published, author=admin). 라이브 카운트 각 12+ 확인(notices 는 기존 1 포함 13).
- 후속: 사용자가 재점검·테스트 예정. 샘플 제거 시 title LIKE 'Sample %'/'Commercial Sample %'/'Industrial Sample %' 로 식별.

## Phase 6 — 모바일 앱 셸(첨부 부동산 앱 레이아웃 적용) (2026-07-04)
- 사용자 선택: "풀 모바일 앱 셸". 데스크톱은 기존 랜딩 유지, 모바일(<md)만 재구성.
- 구성: 인사말 헤더(아바타·SVG 웨이브·알림벨 배지) + 검색+파란 필터버튼 + 카테고리 칩(menu_items, 라우트별 SVG 아이콘) + 프로모 배너(제품 무료등록) + Featured 가로 스크롤 카드.
- 하단 탭바(MobileTabBar, md:hidden 고정): Home / Browse(/commercial) / Messages(/dashboard/notifications, 미읽음 배지) / Profile(/dashboard). 활성 판정=최장 프리픽스. 부동산의 "My Properties"는 마켓 특성상 Browse 로 대체.
- 상단 MainNav 는 TopNavGate(client, usePathname)로 감싸 **모바일 홈(/)에서만 숨김**(인사말 헤더가 대체). 그 외 라우트·데스크톱은 항상 노출 → 네비 회귀 없음.
- 레이아웃: Footer 뒤 h-16 모바일 스페이서로 고정 탭바가 콘텐츠 가리지 않게.
- 규칙: 이모지 0(웨이브·집·벨 전부 인라인 SVG), 텍스트 전부 i18n(mobileNav/mobileHome en·ko), 새 파일 한글 헤더.
- 미채택(기능 부재): Featured 카드의 Map 플로팅 버튼·즐겨찾기·비교·"1 year old" 배지(지도/찜/비교 기능 없음). 필요 시 후속.
