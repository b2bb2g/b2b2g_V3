'use server';
// 공통 첨부 관리자 액션. 파일 업로드는 클라이언트가 Storage 로, 여기선 메타 기록/삭제. RLS 가 최종 방어.
// 실패를 조용히 삼키지 않도록 결과(ok/error)를 반환한다.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { BOARD_MEDIA_BUCKET } from '@/lib/attachments/media';
import type { AttachmentKind, BoardOwnerType } from '@/lib/supabase/database.types';

export type AttachResult = { ok: true } | { ok: false; error: string };

type FileMeta = {
  storagePath: string;
  kind: AttachmentKind;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  inline?: boolean;
};

// 첨부 쓰기 권한 컨텍스트(로그인 + 관리자/작성자). RLS 최종 방어에 더해 명확한 에러를 위해 선검사.
async function writeCtx(): Promise<
  { supabase: Awaited<ReturnType<typeof createClient>> } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };
  return { supabase };
}

async function nextSort(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerType: BoardOwnerType,
  ownerId: string,
): Promise<number> {
  const { count } = await supabase
    .from('board_attachments')
    .select('id', { count: 'exact', head: true })
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId);
  return count ?? 0;
}

// 업로드된 파일(image/video_file/file) 메타 기록.
export async function addFileAttachment(
  ownerType: BoardOwnerType,
  ownerId: string,
  meta: FileMeta,
): Promise<AttachResult> {
  const ctx = await writeCtx();
  if ('error' in ctx) return { ok: false, error: ctx.error };
  const { supabase } = ctx;
  const sort = await nextSort(supabase, ownerType, ownerId);
  const { error } = await supabase.from('board_attachments').insert({
    owner_type: ownerType,
    owner_id: ownerId,
    kind: meta.kind,
    storage_path: meta.storagePath,
    file_name: meta.fileName ?? null,
    mime_type: meta.mimeType ?? null,
    size_bytes: meta.sizeBytes ?? null,
    inline: meta.inline ?? meta.kind === 'image',
    sort_order: sort,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(ownerType === 'notice' ? `/notices/${ownerId}/edit` : '/admin');
  return { ok: true };
}

// 외부 동영상 링크(YouTube/Vimeo) 첨부.
export async function addVideoLink(
  ownerType: BoardOwnerType,
  ownerId: string,
  externalUrl: string,
): Promise<AttachResult> {
  const ctx = await writeCtx();
  if ('error' in ctx) return { ok: false, error: ctx.error };
  const { supabase } = ctx;
  const sort = await nextSort(supabase, ownerType, ownerId);
  const { error } = await supabase.from('board_attachments').insert({
    owner_type: ownerType,
    owner_id: ownerId,
    kind: 'video_link',
    external_url: externalUrl,
    inline: true,
    sort_order: sort,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(ownerType === 'notice' ? `/notices/${ownerId}/edit` : '/admin');
  return { ok: true };
}

export async function deleteAttachment(id: string): Promise<AttachResult> {
  const supabase = await createClient();
  const { data: att } = await supabase
    .from('board_attachments')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();
  if (att?.storage_path) {
    await supabase.storage.from(BOARD_MEDIA_BUCKET).remove([att.storage_path]);
  }
  const { error } = await supabase.from('board_attachments').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}
