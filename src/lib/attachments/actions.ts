'use server';
// 공통 첨부 관리자 액션. 파일 업로드는 클라이언트가 Storage 로, 여기선 메타 기록/삭제. RLS 가 최종 방어.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { BOARD_MEDIA_BUCKET } from '@/lib/attachments/media';
import type { AttachmentKind, BoardOwnerType } from '@/lib/supabase/database.types';

type FileMeta = {
  storagePath: string;
  kind: AttachmentKind;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  inline?: boolean;
};

async function nextSort(
  ownerType: BoardOwnerType,
  ownerId: string,
): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; sort: number }> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('board_attachments')
    .select('id', { count: 'exact', head: true })
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId);
  return { supabase, sort: count ?? 0 };
}

// 업로드된 파일(image/video_file/file) 메타 기록.
export async function addFileAttachment(
  ownerType: BoardOwnerType,
  ownerId: string,
  meta: FileMeta,
): Promise<void> {
  const { supabase, sort } = await nextSort(ownerType, ownerId);
  await supabase.from('board_attachments').insert({
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
  revalidatePath(`/admin`);
}

// 외부 동영상 링크(YouTube/Vimeo) 첨부.
export async function addVideoLink(
  ownerType: BoardOwnerType,
  ownerId: string,
  externalUrl: string,
): Promise<void> {
  const { supabase, sort } = await nextSort(ownerType, ownerId);
  await supabase.from('board_attachments').insert({
    owner_type: ownerType,
    owner_id: ownerId,
    kind: 'video_link',
    external_url: externalUrl,
    inline: true,
    sort_order: sort,
  });
  revalidatePath(`/admin`);
}

export async function deleteAttachment(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: att } = await supabase
    .from('board_attachments')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();
  if (att?.storage_path) {
    await supabase.storage.from(BOARD_MEDIA_BUCKET).remove([att.storage_path]);
  }
  await supabase.from('board_attachments').delete().eq('id', id);
  revalidatePath(`/admin`);
}
