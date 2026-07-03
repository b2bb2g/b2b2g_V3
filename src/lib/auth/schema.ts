// 가입·로그인 입력 검증 스키마. 폼·서버 액션 양쪽에서 재사용한다(문서 C: 검증 단일화).
import { z } from 'zod';

// 자가 가입 가능한 역할. admin·agent 는 자가부여 불가(관리자 임명/초대 경로).
export const SELF_SIGNUP_ROLES = ['supplier', 'buyer'] as const;
export type SelfSignupRole = (typeof SELF_SIGNUP_ROLES)[number];

export const SUPPORTED_LOCALES = ['en', 'ko'] as const;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(1).max(120),
  role: z.enum(SELF_SIGNUP_ROLES),
  locale: z.enum(SUPPORTED_LOCALES).default('en'),
  ref: z.string().trim().max(64).optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;
