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

### 슬라이스 2: 인증·역할·RLS 뼈대
- [ ] Supabase 클라이언트(@supabase/ssr) 설정 — server/browser
- [ ] `profiles` + Auth(이메일), 역할 enum 4종 마이그레이션
- [ ] RLS 뼈대(3.1 권한 매트릭스 기준)
- [ ] 미들웨어 역할 게이트

### 슬라이스 3: 가입·추천 흐름 (플로우 A)
- [ ] 이메일 가입/로그인
- [ ] 추천 코드(`?ref=`) 처리
- [ ] 부가정보 입력, 승인 대기 상태

### 슬라이스 4: 법적 페이지 + 쿠키 동의
- [ ] `legal_documents` + /legal/{terms,privacy,cookies} placeholder
- [ ] 쿠키 동의 배너(opt-in, 수락=거부 동등)

### 슬라이스 5: 이메일 발송 기반
- [ ] 트랜잭셔널 메일 서비스 연동 + `email_outbox`
- [ ] 가입 인증·비밀번호 재설정 메일

### 슬라이스 6: 공통 UX 컴포넌트 (8장)
- [ ] 확인 다이얼로그·토스트·스켈레톤·비밀번호 토글·빈/오류 상태

## Phase 2~4
- 이후 세부화. 기획설계서 13장 참조.
