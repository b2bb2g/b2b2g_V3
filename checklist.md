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

## Phase 3 — 사장(문의·견적 중개)

### 슬라이스 3.1: 문의 데이터 모델 + RLS (완료)
- [x] inquiries/inquiry_messages + enum, RLS(요청자 본인·관리자·공급사 마스킹뷰)
- [x] supplier_inquiries 뷰(requester_id 제외, forwarded 이후만, definer+auth.uid())
- [x] e2e 7종 PASS(공급사 직접조회 0행·requester_id 비노출·admin_only 내부메모 격리)

### 슬라이스 3.2: 문의 작성 흐름 (플로우 C)
- [ ] 제품 상세 문의/견적 버튼(로그인 회원), 문의 작성·내 문의 목록

### 슬라이스 3.3: 관리자 중개
- [ ] 관리자 문의함(전체), 공급사 익명 전달, 내부메모

### 슬라이스 3.4: 공급사 회신 → 관리자 → 바이어 (완료)
- [x] 공급사 회신 정책(SECURITY DEFINER 판별)·트리거(status→replied)·마스킹 메시지뷰
- [x] 공급사 문의함·상세·회신 폼, 대시보드 링크
- [x] 왕복 e2e 6종 PASS(전달후 열람·회신·트리거·author_id 마스킹·바이어 열람·미전달 차단)
- [정정] 정책 내 EXISTS(inquiries) 서브쿼리가 RLS 에 막혀 회신 불가 → DEFINER 함수로 수정

### 슬라이스 3.5: 알림 (앱 내 + 이메일) (완료)
- [x] notifications 테이블·RLS(본인 조회/읽음), 알림 목록·모두읽음·대시보드 배지
- [x] 이벤트 알림+이메일: 전달→공급사(inquiry_received), 회신→바이어(inquiry_replied)
  - 서버측 notify 헬퍼(service_role)로 대상 조회 — 공급사엔 바이어 정보 비노출
- [x] 이메일 템플릿(inquiry_received/replied, en/ko), 빌드·렌더 검증
- 참고: 전체 이벤트 파이프라인은 배포 후 실앱 확인(구성요소는 개별 검증됨)

### 슬라이스 3.6: 역할별 대시보드 (기존 구성으로 충족)
- [x] 대시보드 역할 분기(공급사 패널·바이어/에이전트 문의·알림 배지)
- 에이전트 산하 바이어 관리는 로드맵상 Phase 4(17)에서 buyers/agents 테이블과 함께

### 슬라이스 3.7: 관리자 회원 전권 + 감사로그 (완료)
- [x] admin_audit_logs 테이블·RLS(관리자 열람), logAudit 헬퍼
- [x] 회원 목록(필터·검색)·상세, 역할/상태/메모 변경 — 각 변경 감사 기록
- [x] 승인/반려에도 감사 기록 연동, 변경 이력 표시
- [x] 감사로그 e2e 4종 PASS(관리자 열람·before/after·비관리자 차단·상태변경)
  - 검증 스크립트 정리 코드 버그(PostgREST .catch 체이닝)로 테스트유저 잔여 → 수동 정리 완료

## Phase 4 — 게시판 · 성장 기능

### 슬라이스 4.1: 관리자 공지형 게시판(공지·FAQ) (완료)
- [x] notices/faqs + content_status enum, RLS(관리자 작성·published 공개)
- [x] 관리자 CRUD(/admin/notices, /admin/faq), 공개(/notices, /faq), 푸터 링크
- [x] 본문 텍스트(공통 리치 에디터·첨부는 4.5)

### 슬라이스 4.2: 이벤트/행사 게시판(events) (완료)
- [x] events/event_registrations + enum, RLS(작성·열람·신청 격리)
- [x] 공개 /events·/events/[id](참가신청/취소), 관리자 CRUD(전 필드 폼)
- [x] 배포됨(라이브 반영). cover_image 업로드는 미디어 슬라이스(4.5)

### 슬라이스 4.3: EPC 프로젝트 게시판(projects)
- [x] projects 테이블 + enum(project_field·project_stage) + RLS(관리자 작성·published 공개) 마이그레이션
- [x] database.types 반영, lib/projects(queries·labels·actions)
- [x] 공개 /epc·/epc/[id], 관리자 CRUD(/admin/epc, new, edit)
- [x] i18n(en/ko) 39키, 푸터·관리자 콘솔 링크, 빌드 통과
- [x] 프로덕션 DB 마이그레이션 적용(20260703320000) + RLS 검증(anon SELECT published만·insert 42501 차단)

### 슬라이스 4.4: Sourcing Requests / RFQ(product_requests)
- [x] product_requests + product_request_responses + enum 2종 + RLS 마이그레이션
- [x] 공개 마스킹 뷰 public_product_requests(requester_id 제외, listed 만, buyer_verified 배지)
- [x] lib/requests(queries·labels·actions): 바이어 작성·공급사 응답·관리자 상태중개
- [x] 공개 /requests·/requests/[id](공급사 응답 폼), 바이어 /dashboard/requests(+new)
- [x] 관리자 /admin/requests(+[id] 상태변경·응답중개), 푸터·콘솔·대시보드 링크
- [x] i18n(en/ko) 42키, 빌드·tsc·eslint 통과
- [x] 프로덕션 DB 적용(20260703330000) + 마스킹/RLS 검증(anon 원본 0행·뷰 접근 가능·insert 42501 차단)

### 슬라이스 4.5: 공통 리치 에디터 + 첨부/인라인 미디어(board_attachments)
- [x] board_attachments 테이블 + enum 2종 + board_owner_visible() 다형 가시성 함수 + RLS
- [x] board-media Storage 버킷(공개읽기·소유자 업로드), 프로덕션 적용·RLS 검증
- [x] 공통 표시 컴포넌트(인라인 이미지·영상·YouTube/Vimeo 임베드 화이트리스트·첨부목록)
- [x] 관리자 공통 업로더(파일 업로드·영상링크·삭제), EPC 편집에 연결, EPC·RFQ 상세에 표시
- [x] attachments i18n(en/ko), 빌드·tsc·eslint 통과
- [x] 나머지 보드(공지·FAQ·행사) 업로더/표시 연결, 제품·RFQ 작성자 본인 첨부(owner-write RLS)
- [x] board_owner_editable() 함수 + board_attachments_write 정책(관리자 or 작성자 본인)
- [x] 관리자 제품 작성(/admin/products/new, 공급사 선택) + 관리자 RFQ 작성 허용
- [x] WYSIWYG 리치텍스트 에디터(TipTap) — 공지·FAQ·행사·EPC·서비스 폼에 연결
- [x] SafeHtml 출력 새니타이즈(isomorphic-dompurify) — XSS 검증(script·onerror·javascript:·핸들러 제거)
- [x] 추천가입 QR — profiles.referral_code + 대시보드 ShareWidget(signup_referral)
- [x] 제품(detail_body)·RFQ(body) 본문도 리치 에디터 + SafeHtml 렌더로 전환

### 슬라이스 4.6: 메인 메뉴·서비스 관리(menu_items, services)
- [x] menu_items + services + menu_group enum + RLS + 기본 메뉴 7종 시드
- [x] 동적 MainNav(로케일별 라벨, 레이아웃 상단), 관리자 메뉴 편집(라벨/링크/순서/노출/그룹, 시스템 삭제방지)
- [x] 서비스 공개 /services·/services/[id], 관리자 CRUD, 관리자 콘솔 링크
- [x] menu·services i18n(en/ko), 프로덕션 적용·RLS 검증(시드 공개·insert 42501 차단), 빌드 통과

### 슬라이스 4.7: 공유 단축 URL + QR(short_links)
- [x] short_links + short_link_target enum + RLS + resolve_short_link() definer RPC(클릭 추적)
- [x] /s/[slug] 리다이렉트 라우트, targetPath 매핑, qrcode 로 QR 데이터URL 생성
- [x] ShareWidget(단축링크 생성+QR 표시, 중복 재사용) 제품 상세에 연결
- [x] share i18n(en/ko), 프로덕션 적용·RLS 검증(insert 42501·RPC 호출가능), 빌드 통과
- [ ] (후속) 추천가입 QR(에이전트 referral_code) — 동일 ShareWidget 재사용

### 슬라이스 4.8: 노출 차등·마케팅(등급·배너·팝업)
- [x] ad_banners + popups + enum 4종 + RLS(활성+게재기간 공개, 관리자 작성)
- [x] 관리자 CRUD(/admin/banners·/admin/popups + new/edit), 콘솔 링크
- [x] 랜딩 BannerSlot(placement별) + Popup(대상 역할별·오늘/주간 안보기 localStorage)
- [x] marketing i18n(en/ko), 프로덕션 적용·RLS 검증, 빌드 통과
- [ ] (기존) 유·무료 등급(supplier_tier)·추천제품(is_featured) 필드는 Phase 2 에서 이미 존재

### 설계 갭 보강 (로드맵 7·9·17 잔여)
- [x] #1 승인/반려 알림+이메일: 제품 승인/반려·회원 승인/반려 시 앱 알림 + 이메일(product_approved/rejected 템플릿 추가, supplier_approved/rejected 활용)
- [x] #2 에이전트 산하 바이어 관리: profiles.referred_by(추천인 링크) + 가입 트리거 ref 해석 + 에이전트용 마스킹 뷰(agent_buyers) + /dashboard/my-buyers. 가드에 referred_by·referral_code 보호 추가
- [x] #3 관리자 등급·인증마크 부여 UI: 회원 상세(공급사)에 등급(무료↔유료)·인증마크 폼, 변경 감사로그(update). 인증마크는 공급사 미니홈에 즉시 노출
- [x] 가입 인증 메일 우리 발송 일원화: Supabase Send Email Hook → /api/auth/email-hook(서명검증 standardwebhooks) → sendEmail→email_outbox. 라이브 검증(가입 메일 도착) 완료. env: AUTH_EMAIL_HOOK_SECRET
- [x] 행사 리마인더 메일: events.reminder_sent_at + sendEventReminders(신청자 앱알림+이메일, 행사당 1회) + /api/cron/event-reminders(CRON_SECRET) + vercel.json 매일 크론. event_reminder 템플릿
- [x] 랜딩 익명 활동 신호: platform_stats() definer 집계 함수(PII 없음, anon) + 랜딩 신호 밴드(검증공급사·등록제품·소싱요청·이번달 문의, 0 항목 숨김)
- [x] product_certifications 입력 UI: 제품 편집에 인증/수상 추가·삭제(RLS 소유자 쓰기), 공개 상세에 배지 표시
- [x] 업로드 용량/mime 서버측 하드닝: 버킷 file_size_limit·allowed_mime_types 강제(product-media 5MB·이미지, board-media 50MB·이미지/영상/문서). svg·html·js 차단(XSS 방지)

## Phase 5 — 초대 관리 + 메뉴 샘플 시드 (진행중)

### A. 메뉴 샘플 콘텐츠 12건씩 시드
- [ ] 시드 마이그레이션(idempotent, count<12 가드): Commercial/Industrial 제품 각 12(listed), EPC projects 12, Requests 12(listed), Events 12, Services 12, Notices 12, FAQ 12(published)
- [ ] db push 후 라이브 카운트 검증(각 12+)

### B. 초대 링크 관리(관리자 페이지)
- [ ] /admin/invites 페이지 + 사이드바 링크 + i18n
- [ ] 초대 링크 생성기(역할 선택 → ?ref=&role= 복사 링크)
- [ ] 이메일 직접 초대(admin.inviteUserByEmail, 역할 메타데이터)
- [ ] 회원 초대 트리(referred_by 재귀 렌더)
- [ ] signup 페이지 role 파라미터 프리셋

### C. 검증/배포
- [ ] tsc / eslint / build, 커밋·푸시, 마이그레이션 배포

### 슬라이스 4.9: (후속) 익명 신호, 에이전트 산하 바이어(buyers/agents)
