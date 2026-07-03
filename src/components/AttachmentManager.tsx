'use client';
// 관리자 공통 첨부 관리(업로드·영상링크·삭제). 업로드는 브라우저→Storage, 메타는 서버 액션.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { BOARD_MEDIA_BUCKET } from '@/lib/attachments/media';
import { addFileAttachment, addVideoLink, deleteAttachment } from '@/lib/attachments/actions';
import type {
  AttachmentKind,
  BoardAttachmentRow,
  BoardOwnerType,
} from '@/lib/supabase/database.types';

const MAX_BYTES = 50 * 1024 * 1024;

function kindOf(file: File): AttachmentKind {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video_file';
  return 'file';
}

export function AttachmentManager({
  ownerType,
  ownerId,
  userId,
  attachments,
}: {
  ownerType: BoardOwnerType;
  ownerId: string;
  userId: string;
  attachments: BoardAttachmentRow[];
}) {
  const t = useTranslations('attachments');
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [pending, startTransition] = useTransition();

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) return setError(t('sizeError'));

    setUploading(true);
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${userId}/${ownerType}/${ownerId}/${crypto.randomUUID()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from(BOARD_MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) return setError(t('uploadFailed'));
      await addFileAttachment(ownerType, ownerId, {
        storagePath: path,
        kind: kindOf(file),
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function onAddLink() {
    const url = link.trim();
    if (!url) return;
    startTransition(async () => {
      await addVideoLink(ownerType, ownerId, url);
      setLink('');
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold text-neutral-500">{t('manage')}</h2>

      {attachments.length > 0 && (
        <ul className="flex flex-col gap-1">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">
                {a.kind === 'video_link' ? a.external_url : (a.file_name ?? a.storage_path)}
                <span className="ml-2 text-xs text-neutral-400">{t(`kind_${a.kind}`)}</span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteAttachment(a.id);
                    router.refresh();
                  })
                }
                className="text-xs text-red-600 underline"
              >
                {t('delete')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="text-sm">
        <span className="mb-1 block text-neutral-500">{t('uploadLabel')}</span>
        <input type="file" onChange={onSelect} disabled={uploading} className="text-sm" />
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={t('videoLinkPlaceholder')}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onAddLink}
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          {t('addLink')}
        </button>
      </div>

      {uploading && <p className="text-sm text-neutral-500">{t('uploading')}</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
