// 문의·견적 작성 검증 스키마(폼·서버 공용).
import { z } from 'zod';

export const inquirySchema = z.object({
  type: z.enum(['inquiry', 'quote']),
  content: z.string().trim().min(1).max(5000),
});
export type InquiryInput = z.infer<typeof inquirySchema>;
