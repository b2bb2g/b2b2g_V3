# Checklist — b2bb2g-v3

로드맵(기획설계서 13장) 기준. 완료 시 체크. 슬라이스 단위로 검증하며 진행.

## Phase 1 — 기반

### 슬라이스 1: 프로젝트 기반 골격 (완료)
- [x] Next.js 16 App Router 프로젝트 초기화(package.json, tsconfig strict, next.config)
- [x] Tailwind 4 + PostCSS 설정
- [x] ESLint 9(flat config) + Prettier 고정 설정
- [x] i18n(next-intl) 뼈대 — en 기본 + ko 언어팩, 하드코딩 금지 구조
- [x] 환경설정 모듈(SSoT) + `.env.example` (비밀키 커밋 금지)
- [x] 루트 레이아웃 + 홈 placeholder, 빌드·타입체크 통과 (npm run quality 그린)
- [x] 커밋·push

### 슬라이스 2: 인증·역할·RLS 뼈대 (완료)
- [x] Supabase 클라이언트(@supabase/ssr) 설정 — server/browser/proxy, Database 타입 연결
- [x] `profiles` + 역할 enum 4종 + 상태 enum 마이그레이션 (프로덕션 DB 적용 완료)
- [x] RLS 뼈대(3.1 권한 매트릭스 기준) — 조회/수정/삽입/삭제 정책 + is_admin() + 자기수정 가드
- [x] proxy(구 미들웨어) 역할 게이트 — 런타임 검증(홈 200, 보호라우트 307 리다이렉트)
- [ ] (보류) 타입 자동 생성 `supabase gen types` — 컨테이너 런타임/토큰 확보 후 손작성본 대체
- [ ] (보류) RLS 행 기반 검증 — auth 사용자 생기는 슬라이스 3에서

### 슬라이스 3: 가입·추천 흐름 (플로우 A) (완료)
- [x] 이메일 가입/로그인/로그아웃 (Zod 검증 + 서버 액션 + 폼)
- [x] 추천 코드(`?ref=`) 처리 — 배지 노출 + 메타데이터 전달
- [x] 이메일 확인 콜백(/auth/callback), 확인 안내·승인 대기 페이지
- [x] 대시보드 placeholder(프로필 표시, 미승인→승인대기 리다이렉트)
- [x] 빌드 + 페이지 렌더 검증(전 라우트 200)
- [x] RLS 행 기반 검증 6종 PASS(격리·가드 트리거·트리거 생성, 테스트 유저 자동 정리)
- [ ] (이후) 역할별 부가정보 테이블(suppliers/buyers/agents) — 후속 슬라이스

### 슬라이스 4: 법적 페이지 + 쿠키 동의
- [ ] `legal_documents` + /legal/{terms,privacy,cookies} placeholder
- [ ] 쿠키 동의 배너(opt-in, 수락=거부 동등)

### 슬라이스 5: 이메일 발송 기반 (완료)
- [x] `email_outbox` 마이그레이션(프로덕션 적용) + 관리자 열람 RLS
- [x] Resend 연동 발송 모듈 + 언어별 템플릿 + service_role admin 클라이언트
- [x] 실발송 파이프라인 검증(큐잉→Resend→outbox `sent` 기록, provider_message_id 확인)
- [x] 비밀번호 재설정 흐름(요청→generateLink→우리 템플릿 발송→콜백→재설정 페이지)
  - 렌더 검증: forgot 200, 세션 없는 reset→forgot 리다이렉트, 로그인에 링크 노출
- [ ] (별도) 가입 인증 메일을 Supabase 기본 대신 우리 발송으로 대체 — Auth 훅 설정 필요(후속)

### 슬라이스 6: 공통 UX 컴포넌트 (8장)
- [ ] 확인 다이얼로그·토스트·스켈레톤·비밀번호 토글·빈/오류 상태

## Phase 2~4
- 이후 세부화. 기획설계서 13장 참조.
