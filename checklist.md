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

### 슬라이스 4: 법적 페이지 + 쿠키 동의 (완료)
- [x] `legal_documents` + /legal/[type] (약관·개인정보·쿠키, placeholder 시드 en/ko)
- [x] 쿠키 동의 배너(opt-in, 수락=거부 동등, 카테고리 선택, 정책 링크, 재오픈)
- [x] `cookie_consents` 감사 기록 + 공통 Footer
- [x] DB 검증(시드 6종, anon 열람 가능, 동의 삽입 허용·조회 관리자만)
- [x] 렌더 검증(법적 3종 200+본문, 잘못된 타입 404, 푸터 링크)
- 참고: 실제 약관·개인정보·쿠키 본문은 placeholder — 출시 전 변호사 검토 필수(5.10)

### 슬라이스 5: 이메일 발송 기반 (완료)
- [x] `email_outbox` 마이그레이션(프로덕션 적용) + 관리자 열람 RLS
- [x] Resend 연동 발송 모듈 + 언어별 템플릿 + service_role admin 클라이언트
- [x] 실발송 파이프라인 검증(큐잉→Resend→outbox `sent` 기록, provider_message_id 확인)
- [x] 비밀번호 재설정 흐름(요청→generateLink→우리 템플릿 발송→콜백→재설정 페이지)
  - 렌더 검증: forgot 200, 세션 없는 reset→forgot 리다이렉트, 로그인에 링크 노출
- [ ] (별도) 가입 인증 메일을 Supabase 기본 대신 우리 발송으로 대체 — Auth 훅 설정 필요(후속)

### 슬라이스 6: 공통 UX 컴포넌트 (8장) (완료)
- [x] PasswordInput(표시/숨김 토글, a11y) — login·signup·reset 폼에 연결
- [x] FormButton(useFormStatus 처리중·스피너) — 전 폼 버튼 대체
- [x] Toast(Provider+useToast) — 쿠키 저장 성공 피드백에 연결
- [x] ConfirmButton(확인 다이얼로그) — 로그아웃 재확인에 연결
- [x] Skeleton·EmptyState(표현 컴포넌트, Phase 2 목록/대시보드용)
- [x] 빌드·렌더 검증(비밀번호 토글 a11y 라벨 노출 확인)

## Phase 2 — 지어드(공급사·제품)

### 슬라이스 2.1: 데이터 모델 기반 (완료)
- [x] suppliers/categories/products/product_media/product_certifications + RLS
- [x] owns_supplier() 헬퍼, Commercial/Industrial 대분류 시드
- [x] 프로덕션 적용·스키마/카테고리/RLS 검증

### 슬라이스 2.2: 공급사 온보딩 + 제품 등록(초안) (완료)
- [x] 공급사 회사정보 입력(suppliers upsert), 대시보드 공급사 패널
- [x] 제품 초안 CRUD(전 buyKOREA 텍스트/숫자 필드) + 검토 요청(draft→pending)
- [x] 내 제품 목록·상태, 등록/수정 공용 폼
- [x] e2e·RLS 실검증 7종 PASS(소유 격리·draft 비공개·검토제출·listed 공개)
- 사업자등록증 파일은 슬라이스 2.3(Storage)로

### 슬라이스 2.3: 미디어 업로드 + 공급사 미니홈 (완료)
- [x] Storage 버킷(product-media)·정책(공개읽기, 소유자 경로 업로드/삭제)
- [x] 제품 이미지 업로드·대표지정·삭제(브라우저→Storage + 메타 서버액션)
- [x] 목록/상세/미니홈 이미지 표시, /suppliers/[id] 미니홈
- [x] Storage e2e 4종 PASS(소유자 업로드·남의경로 차단·공개읽기·메타 RLS)
- [ ] product_certifications 입력 UI — 후속(간단, 필요 시)
- 참고: 버킷 용량·mime 제한은 후속 하드닝(현재 클라 검증 5MB·image/*)

### 슬라이스 2.4: 관리자 승인 + 공개 노출 (완료)
- [x] 관리자 제품 노출 승인 큐(pending→listed/rejected), 승인/반려 액션
- [x] 공급사 승인(profiles.status), /admin 대시보드·검토 페이지
- [x] 가드 트리거 수정(백엔드/service_role 허용 → 최초 관리자 부트스트랩 가능)
- [x] e2e·RLS 실검증 6종 PASS(관리자 승인·격리·자가승격 차단 유지)
- 인증배지·등급 부여는 후속(2.3/관리자 회원관리)

### 슬라이스 2.5: 공개 목록/상세 + 회원제 게이트 (완료, /suppliers 제외)
- [x] /products 목록, /products/[id] 상세(비회원 기본정보 / 가격·거래조건 로그인 벽)
- [x] 비회원 가격·거래조건 마스킹(6.4) — anon 테이블 SELECT 회수 + 안전컬럼만 GRANT
  - [정정] 컬럼 REVOKE 는 테이블 GRANT 를 못 이김 → revoke table + grant columns 로 수정
- [x] public_suppliers 뷰(사업자등록증 제외), biz_reg_file 보호
- [x] 마스킹 e2e 5종 PASS(비회원 price/moq 42501 거부, 회원 조회 가능)
- [ ] /suppliers/[id] 미니홈 — 후속(2.3 미디어와 함께)

### 슬라이스 2.6: 실시간 검색·필터 (8.5) (완료)
- [x] as-you-type 검색(디바운스 250ms), 카테고리 필터칩
- [x] 서버 렌더 기반 → 권한·가격 마스킹 유지, 로딩 스피너, 빈결과 안내
- [x] 제품명·키워드·설명·공급사명 검색, or-필터 주입 방지(위험문자 정규화)
- [x] 검색 e2e 5종 PASS(부분일치·키워드·공급사명·무매칭·위험문자)

## Phase 3~4
- 이후 세부화. 기획설계서 13장 참조.
