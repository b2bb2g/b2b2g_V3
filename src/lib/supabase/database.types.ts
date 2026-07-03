// DB 스키마 대응 타입(단일 출처, 문서 0.2). 마이그레이션과 동기화 유지.
// TODO: 컨테이너 런타임 또는 Supabase access token 확보 시
//       `supabase gen types typescript` 로 자동 생성본으로 대체한다.
// 주의: 최상위 Database 는 반드시 type 별칭이어야 한다(interface 는
//       supabase-js 의 Record<string, GenericSchema> 제약을 만족하지 못해 조회가 never 로 폴백됨).

export type UserRole = 'admin' | 'supplier' | 'agent' | 'buyer';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'withdrawn';

export type EmailTemplate =
  | 'signup_verify'
  | 'password_reset'
  | 'supplier_approved'
  | 'supplier_rejected'
  | 'product_approved'
  | 'product_rejected'
  | 'inquiry_received'
  | 'inquiry_replied'
  | 'rfq_response'
  | 'agent_invite'
  | 'event_reminder'
  | 'generic';
export type EmailStatus = 'queued' | 'sent' | 'failed';

export type LegalDocType = 'terms' | 'privacy' | 'cookie_policy';

export type ContentStatus = 'draft' | 'published' | 'closed';
export type EventCategory = 'trade_fair' | 'buyer_matching' | 'briefing' | 'corporate' | 'etc';
export type EventParticipation = 'open' | 'closed' | 'ended';
export type RegistrationStatus = 'applied' | 'confirmed' | 'cancelled';

export type EventRow = {
  id: string;
  author_id: string | null;
  category: EventCategory;
  name: string;
  body: string;
  cover_image: string | null;
  venue: string | null;
  location: string | null;
  country: string | null;
  starts_at: string | null;
  ends_at: string | null;
  booth_info: string | null;
  external_link: string | null;
  participation_status: EventParticipation;
  status: ContentStatus;
  is_pinned: boolean;
  registration_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  profile_id: string;
  status: RegistrationStatus;
  note: string | null;
  created_at: string;
};

export type RequestStatus =
  | 'submitted'
  | 'admin_review'
  | 'listed'
  | 'closed'
  | 'rejected';
export type RequestResponseStatus =
  | 'submitted'
  | 'forwarded_to_buyer'
  | 'accepted'
  | 'declined';

export type ProductRequestRow = {
  id: string;
  requester_id: string;
  title: string;
  body: string;
  category_id: string | null;
  target_country: string | null;
  budget: number | null;
  qty: number | null;
  status: RequestStatus;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRequestResponseRow = {
  id: string;
  request_id: string;
  supplier_id: string;
  message: string;
  status: RequestResponseStatus;
  created_at: string;
  updated_at: string;
};

// 공개 마스킹 뷰: requester_id 제외, listed 만, buyer_verified 배지 신호 포함.
export type PublicProductRequestRow = {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  target_country: string | null;
  budget: number | null;
  qty: number | null;
  is_pinned: boolean;
  created_at: string;
  buyer_verified: boolean;
};

export type BannerPlacement = 'hero' | 'mid' | 'sidebar';
export type PopupContentType = 'image' | 'rich_text' | 'image_with_text';
export type PopupTarget = 'all' | 'guest' | 'buyer' | 'supplier' | 'agent';
export type PopupDismiss = 'close_only' | 'today_off' | 'week_off';

export type AdBannerRow = {
  id: string;
  title: string;
  image: string | null;
  headline: string | null;
  subtext: string | null;
  link_url: string | null;
  placement: BannerPlacement;
  supplier_id: string | null;
  sort_order: number;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  click_count: number;
  impression_count: number;
  created_at: string;
  updated_at: string;
};

export type PopupRow = {
  id: string;
  title: string;
  content_type: PopupContentType;
  image: string | null;
  body: string | null;
  link_url: string | null;
  target: PopupTarget;
  pages: string | null;
  start_at: string | null;
  end_at: string | null;
  priority: number;
  dismiss_option: PopupDismiss;
  is_active: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export type ShortLinkTarget =
  | 'product'
  | 'signup_referral'
  | 'supplier_page'
  | 'event'
  | 'project'
  | 'request'
  | 'service';

export type ShortLinkRow = {
  id: string;
  slug: string;
  target_type: ShortLinkTarget;
  target_id: string | null;
  ref_code: string | null;
  created_by: string | null;
  click_count: number;
  is_active: boolean;
  created_at: string;
};

export type MenuGroup = 'product' | 'project_request' | 'info_service';

export type MenuItemRow = {
  id: string;
  label_en: string;
  label_ko: string;
  group: MenuGroup;
  route: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  author_id: string | null;
  title: string;
  summary: string | null;
  body: string;
  cover_image: string | null;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BoardOwnerType =
  | 'notice'
  | 'faq'
  | 'event'
  | 'project'
  | 'product_request'
  | 'product';
export type AttachmentKind = 'image' | 'video_file' | 'video_link' | 'file';

export type BoardAttachmentRow = {
  id: string;
  owner_type: BoardOwnerType;
  owner_id: string;
  kind: AttachmentKind;
  storage_path: string | null;
  external_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  thumbnail_path: string | null;
  inline: boolean;
  sort_order: number;
  created_at: string;
};

export type ProjectField = 'power_plant' | 'construction' | 'factory' | 'plant' | 'civil' | 'etc';
export type ProjectStage = 'planning' | 'bidding' | 'in_progress' | 'completed';

export type ProjectRow = {
  id: string;
  author_id: string | null;
  name: string;
  field: ProjectField;
  body: string;
  cover_image: string | null;
  client: string | null;
  location: string | null;
  country: string | null;
  scale_amount: number | null;
  currency: string | null;
  starts_on: string | null;
  ends_on: string | null;
  stage: ProjectStage;
  status: ContentStatus;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type NoticeRow = {
  id: string;
  author_id: string | null;
  title: string;
  body: string;
  is_pinned: boolean;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export type FaqRow = {
  id: string;
  author_id: string | null;
  category: string | null;
  question: string;
  answer: string;
  sort_order: number;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export type InquiryType = 'inquiry' | 'quote';
export type InquiryStatus = 'submitted' | 'admin_review' | 'forwarded' | 'replied' | 'closed';
export type MessageAuthorRole = 'buyer' | 'admin' | 'supplier';
export type MessageVisibility = 'all' | 'admin_only';

export type SupplierTier = 'free' | 'paid';
export type ProductStatus = 'draft' | 'pending' | 'listed' | 'rejected';
export type ProductMediaType = 'image' | 'video_link' | 'catalog_pdf';
export type ProductCertType = 'certification' | 'award';

// interface 가 아닌 type 로 선언해야 Record<string, unknown>(GenericTable) 제약을 만족한다.
export type ProfileRow = {
  id: string;
  role: UserRole;
  email: string;
  display_name: string;
  phone: string | null;
  locale: string;
  status: UserStatus;
  memo: string | null;
  last_login_at: string | null;
  created_by: string | null;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentBuyerRow = {
  id: string;
  display_name: string;
  status: UserStatus;
  created_at: string;
};

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'> &
  Partial<Pick<ProfileRow, 'created_at' | 'updated_at'>>;

export type ProfileUpdate = Partial<ProfileRow>;

export type EmailOutboxRow = {
  id: string;
  to_email: string;
  profile_id: string | null;
  template: EmailTemplate;
  locale: string;
  payload: Record<string, unknown>;
  status: EmailStatus;
  provider_message_id: string | null;
  error: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailOutboxInsert = Omit<
  EmailOutboxRow,
  'id' | 'created_at' | 'updated_at' | 'status' | 'provider_message_id' | 'error' | 'sent_at'
> &
  Partial<
    Pick<
      EmailOutboxRow,
      'id' | 'status' | 'provider_message_id' | 'error' | 'sent_at' | 'profile_id' | 'locale'
    >
  >;

export type EmailOutboxUpdate = Partial<EmailOutboxRow>;

export type LegalDocumentRow = {
  id: string;
  type: LegalDocType;
  locale: string;
  body: string;
  version: number;
  effective_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
};

export type CookieConsentRow = {
  id: string;
  visitor_id: string | null;
  profile_id: string | null;
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  policy_version: string | null;
  consented_at: string;
};

export type CookieConsentInsert = Omit<CookieConsentRow, 'id' | 'consented_at' | 'necessary'> &
  Partial<Pick<CookieConsentRow, 'id' | 'consented_at' | 'necessary'>>;

export type SupplierRow = {
  id: string;
  profile_id: string;
  company_name: string;
  biz_reg_file: string | null;
  tier: SupplierTier;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  supplier_id: string;
  title: string;
  description: string | null;
  detail_body: string | null;
  category_id: string | null;
  price: number | null;
  price_visible: boolean;
  moq: number | null;
  moq_unit: string | null;
  lead_time_min: number | null;
  lead_time_max: number | null;
  freight_type: string | null;
  transport_modes: string | null;
  ship_from: string | null;
  payment_terms: string | null;
  hs_code: string | null;
  keywords: string | null;
  status: ProductStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductMediaRow = {
  id: string;
  product_id: string;
  type: ProductMediaType;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductCertificationRow = {
  id: string;
  product_id: string;
  type: ProductCertType;
  name: string;
  file: string | null;
  created_at: string;
  updated_at: string;
};

export type InquiryRow = {
  id: string;
  product_id: string;
  requester_id: string;
  type: InquiryType;
  content: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
};

export type InquiryMessageRow = {
  id: string;
  inquiry_id: string;
  author_id: string | null;
  author_role: MessageAuthorRole;
  body: string;
  visible_to: MessageVisibility;
  created_at: string;
};

export type SupplierInquiryRow = {
  id: string;
  product_id: string;
  product_title: string;
  type: InquiryType;
  content: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
};

export type AuditAction =
  'create' | 'update' | 'approve' | 'reject' | 'suspend' | 'delete' | 'role_change';

export type AdminAuditLogRow = {
  id: string;
  admin_id: string | null;
  target_table: string;
  target_id: string | null;
  action: AuditAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  profile_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

type Insertable<Row, Required extends keyof Row> = Partial<Row> & Pick<Row, Required>;

export type ProductInsert = Insertable<ProductRow, 'supplier_id' | 'title'>;
export type ProductUpdate = Partial<ProductRow>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      email_outbox: {
        Row: EmailOutboxRow;
        Insert: EmailOutboxInsert;
        Update: EmailOutboxUpdate;
        Relationships: [];
      };
      legal_documents: {
        Row: LegalDocumentRow;
        Insert: Partial<LegalDocumentRow> & Pick<LegalDocumentRow, 'type' | 'locale' | 'body'>;
        Update: Partial<LegalDocumentRow>;
        Relationships: [];
      };
      cookie_consents: {
        Row: CookieConsentRow;
        Insert: CookieConsentInsert;
        Update: Partial<CookieConsentRow>;
        Relationships: [];
      };
      suppliers: {
        Row: SupplierRow;
        Insert: Insertable<SupplierRow, 'profile_id' | 'company_name'>;
        Update: Partial<SupplierRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Insertable<CategoryRow, 'name'>;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Insertable<ProductRow, 'supplier_id' | 'title'>;
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      product_media: {
        Row: ProductMediaRow;
        Insert: Insertable<ProductMediaRow, 'product_id' | 'url'>;
        Update: Partial<ProductMediaRow>;
        Relationships: [];
      };
      product_certifications: {
        Row: ProductCertificationRow;
        Insert: Insertable<ProductCertificationRow, 'product_id' | 'type' | 'name'>;
        Update: Partial<ProductCertificationRow>;
        Relationships: [];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: Insertable<InquiryRow, 'product_id' | 'requester_id' | 'content'>;
        Update: Partial<InquiryRow>;
        Relationships: [];
      };
      inquiry_messages: {
        Row: InquiryMessageRow;
        Insert: Insertable<InquiryMessageRow, 'inquiry_id' | 'author_role' | 'body'>;
        Update: Partial<InquiryMessageRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Insertable<NotificationRow, 'profile_id' | 'type'>;
        Update: Partial<NotificationRow>;
        Relationships: [];
      };
      admin_audit_logs: {
        Row: AdminAuditLogRow;
        Insert: Insertable<AdminAuditLogRow, 'target_table' | 'action'>;
        Update: Partial<AdminAuditLogRow>;
        Relationships: [];
      };
      notices: {
        Row: NoticeRow;
        Insert: Insertable<NoticeRow, 'title'>;
        Update: Partial<NoticeRow>;
        Relationships: [];
      };
      faqs: {
        Row: FaqRow;
        Insert: Insertable<FaqRow, 'question'>;
        Update: Partial<FaqRow>;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: Insertable<EventRow, 'name'>;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      event_registrations: {
        Row: EventRegistrationRow;
        Insert: Insertable<EventRegistrationRow, 'event_id' | 'profile_id'>;
        Update: Partial<EventRegistrationRow>;
        Relationships: [];
      };
      projects: {
        Row: ProjectRow;
        Insert: Insertable<ProjectRow, 'name'>;
        Update: Partial<ProjectRow>;
        Relationships: [];
      };
      product_requests: {
        Row: ProductRequestRow;
        Insert: Insertable<ProductRequestRow, 'requester_id' | 'title'>;
        Update: Partial<ProductRequestRow>;
        Relationships: [];
      };
      product_request_responses: {
        Row: ProductRequestResponseRow;
        Insert: Insertable<ProductRequestResponseRow, 'request_id' | 'supplier_id'>;
        Update: Partial<ProductRequestResponseRow>;
        Relationships: [];
      };
      board_attachments: {
        Row: BoardAttachmentRow;
        Insert: Insertable<BoardAttachmentRow, 'owner_type' | 'owner_id' | 'kind'>;
        Update: Partial<BoardAttachmentRow>;
        Relationships: [];
      };
      menu_items: {
        Row: MenuItemRow;
        Insert: Insertable<MenuItemRow, 'label_en' | 'label_ko' | 'route'>;
        Update: Partial<MenuItemRow>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: Insertable<ServiceRow, 'title'>;
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      short_links: {
        Row: ShortLinkRow;
        Insert: Insertable<ShortLinkRow, 'slug' | 'target_type'>;
        Update: Partial<ShortLinkRow>;
        Relationships: [];
      };
      ad_banners: {
        Row: AdBannerRow;
        Insert: Insertable<AdBannerRow, 'title'>;
        Update: Partial<AdBannerRow>;
        Relationships: [];
      };
      popups: {
        Row: PopupRow;
        Insert: Insertable<PopupRow, 'title'>;
        Update: Partial<PopupRow>;
        Relationships: [];
      };
    };
    Views: {
      public_suppliers: {
        Row: {
          id: string;
          company_name: string;
          verified: boolean;
          tier: SupplierTier;
        };
        Relationships: [];
      };
      supplier_inquiries: {
        Row: SupplierInquiryRow;
        Relationships: [];
      };
      public_product_requests: {
        Row: PublicProductRequestRow;
        Relationships: [];
      };
      agent_buyers: {
        Row: AgentBuyerRow;
        Relationships: [];
      };
      supplier_inquiry_messages: {
        Row: {
          id: string;
          inquiry_id: string;
          author_role: MessageAuthorRole;
          body: string;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      owns_supplier: {
        Args: { target: string };
        Returns: boolean;
      };
      board_owner_visible: {
        Args: { ot: BoardOwnerType; oid: string };
        Returns: boolean;
      };
      board_owner_editable: {
        Args: { ot: BoardOwnerType; oid: string };
        Returns: boolean;
      };
      resolve_short_link: {
        Args: { p_slug: string };
        Returns: { target_type: ShortLinkTarget; target_id: string | null; ref_code: string | null }[];
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      email_template: EmailTemplate;
      email_status: EmailStatus;
      legal_doc_type: LegalDocType;
      supplier_tier: SupplierTier;
      product_status: ProductStatus;
      product_media_type: ProductMediaType;
      product_cert_type: ProductCertType;
      inquiry_type: InquiryType;
      inquiry_status: InquiryStatus;
      message_author_role: MessageAuthorRole;
      message_visibility: MessageVisibility;
      audit_action: AuditAction;
      content_status: ContentStatus;
      event_category: EventCategory;
      event_participation: EventParticipation;
      registration_status: RegistrationStatus;
      project_field: ProjectField;
      project_stage: ProjectStage;
      request_status: RequestStatus;
      request_response_status: RequestResponseStatus;
      board_owner_type: BoardOwnerType;
      attachment_kind: AttachmentKind;
      menu_group: MenuGroup;
      short_link_target: ShortLinkTarget;
      banner_placement: BannerPlacement;
      popup_content_type: PopupContentType;
      popup_target: PopupTarget;
      popup_dismiss: PopupDismiss;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
