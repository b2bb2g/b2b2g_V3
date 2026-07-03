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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      email_template: EmailTemplate;
      email_status: EmailStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
