// 게시물 첨부 조회. RLS 로 공개 게시물의 첨부만(비관리자) 노출.
import { createClient } from '@/lib/supabase/server';
import type { BoardAttachmentRow, BoardOwnerType } from '@/lib/supabase/database.types';

export async function getAttachments(
  ownerType: BoardOwnerType,
  ownerId: string,
): Promise<BoardAttachmentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('board_attachments')
    .select('*')
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  return data ?? [];
}
