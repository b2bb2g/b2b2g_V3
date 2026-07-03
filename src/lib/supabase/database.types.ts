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
  | 'inquiry_received'
  | 'inquiry_replied'
  | 'rfq_response'
  | 'agent_invite'
  | 'event_reminder'
  | 'generic';
export type EmailStatus = 'queued' | 'sent' | 'failed';

export type LegalDocType = 'terms' | 'privacy' | 'cookie_policy';

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
  created_at: string;
  updated_at: string;
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
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
