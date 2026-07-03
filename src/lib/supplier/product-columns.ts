// ProductInput → products 컬럼 매핑(단일 지점). 'use server' 밖의 순수 모듈이라 액션들이 공유.
import type { ProductInsert } from '@/lib/supabase/database.types';
import type { ProductInput } from './schema';

export function toProductColumns(input: ProductInput): Omit<ProductInsert, 'supplier_id'> {
  return {
    title: input.title,
    description: input.description ?? null,
    detail_body: input.detailBody ?? null,
    category_id: input.categoryId ?? null,
    price: input.price ?? null,
    price_visible: input.priceVisible,
    moq: input.moq ?? null,
    moq_unit: input.moqUnit ?? null,
    lead_time_min: input.leadTimeMin ?? null,
    lead_time_max: input.leadTimeMax ?? null,
    freight_type: input.freightType ?? null,
    transport_modes: input.transportModes ?? null,
    ship_from: input.shipFrom ?? null,
    payment_terms: input.paymentTerms ?? null,
    hs_code: input.hsCode ?? null,
    keywords: input.keywords ?? null,
  };
}
