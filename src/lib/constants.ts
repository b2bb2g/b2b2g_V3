// 역할·상태 값 목록(UI 셀렉트용). DB enum(user_role/user_status)과 동기화 유지.
import type { UserRole, UserStatus } from '@/lib/supabase/database.types';

export const USER_ROLES: UserRole[] = ['admin', 'supplier', 'agent', 'buyer'];
export const USER_STATUSES: UserStatus[] = [
  'pending',
  'approved',
  'rejected',
  'suspended',
  'withdrawn',
];
