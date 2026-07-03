// 공급사 회사정보·제품 입력 검증 스키마(폼·서버 공용, 문서 C). 미디어는 슬라이스 2.3.
import { z } from 'zod';

// 빈 문자열은 미입력(undefined)으로 정규화하는 선택 필드 헬퍼.
const optionalText = (max = 2000) =>
  z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().trim().max(max).optional(),
  );
const optionalInt = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().int().nonnegative().optional(),
);
const optionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const companyProfileSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
});
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export const productSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText(2000),
  detailBody: optionalText(20000),
  categoryId: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().uuid().optional(),
  ),
  price: optionalNumber,
  priceVisible: z.preprocess((v) => v === 'on' || v === true, z.boolean()),
  moq: optionalInt,
  moqUnit: optionalText(40),
  leadTimeMin: optionalInt,
  leadTimeMax: optionalInt,
  freightType: optionalText(120),
  transportModes: optionalText(120),
  shipFrom: optionalText(120),
  paymentTerms: optionalText(200),
  hsCode: optionalText(40),
  keywords: optionalText(300),
});
export type ProductInput = z.infer<typeof productSchema>;
