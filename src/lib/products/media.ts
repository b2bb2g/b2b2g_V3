// 제품 이미지 Storage 경로 → 공개 URL 변환(단일 지점). 버킷명은 여기서만 관리.
import { publicEnv } from '@/lib/env';

export const PRODUCT_MEDIA_BUCKET = 'product-media';

export function publicImageUrl(storagePath: string): string {
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${PRODUCT_MEDIA_BUCKET}/${storagePath}`;
}
