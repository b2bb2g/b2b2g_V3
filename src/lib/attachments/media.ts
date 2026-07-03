// 공통 첨부 Storage 경로→공개 URL + 외부 영상 링크 화이트리스트 임베드 변환(단일 지점).
import { publicEnv } from '@/lib/env';

export const BOARD_MEDIA_BUCKET = 'board-media';

export function boardMediaUrl(storagePath: string): string {
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${BOARD_MEDIA_BUCKET}/${storagePath}`;
}

// YouTube/Vimeo 만 임베드 허용(임의 스크립트 삽입 방지). 허용 외 URL 은 null → 링크로만 노출.
export function videoEmbedUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === 'vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
