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
  const [drag, setDrag] = useState(false);
  const [pending, startTransition] = useTransition();

  async function uploadFile(file: File) {
    if (file.size > MAX_BYTES) {
      setError(t('sizeError'));
      return;
    }
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${ownerType}/${ownerId}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from(BOARD_MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (upErr) {
      // 실제 원인(권한/용량/MIME)을 노출.
      setError(`${t('uploadFailed')}: ${upErr.message}`);
      return;
    }
    const res = await addFileAttachment(ownerType, ownerId, {
      storagePath: path,
      kind: kindOf(file),
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
    if (!res.ok) setError(res.error);
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) await uploadFile(file);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = '';
    await onFiles(files);
  }

  function onAddLink() {
    const url = link.trim();
    if (!url) return;
    setError(null);
    startTransition(async () => {
      const res = await addVideoLink(ownerType, ownerId, url);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setLink('');
      router.refresh();
    });
  }

  return (
    <section className="flex w-full flex-col gap-3">
      {/* 드래그앤드롭 업로드 존 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          drag ? 'border-blue-400 bg-blue-50/50' : 'border-neutral-300 bg-neutral-50'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 16V4M8 8l4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <p className="text-sm font-medium text-neutral-600">{t('dropTitle')}</p>
        <p className="text-xs text-neutral-400">{t('dropHint')}</p>
        <label className="mt-2 cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:border-neutral-400">
          {t('selectFile')}
          <input type="file" multiple onChange={onSelect} disabled={uploading} className="hidden" />
        </label>
      </div>

      {/* 업로드된 파일 칩 */}
      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm"
            >
              <span className="max-w-48 truncate text-neutral-700">
                {a.kind === 'video_link' ? a.external_url : (a.file_name ?? a.storage_path)}
              </span>
              {a.size_bytes ? (
                <span className="text-xs text-neutral-400">
                  {a.size_bytes >= 1048576
                    ? `${(a.size_bytes / 1048576).toFixed(1)}MB`
                    : `${Math.round(a.size_bytes / 1024)}KB`}
                </span>
              ) : null}
              <button
                type="button"
                disabled={pending}
                aria-label={t('delete')}
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteAttachment(a.id);
                    if (!res.ok) {
                      setError(res.error);
                      return;
                    }
                    router.refresh();
                  })
                }
                className="text-neutral-400 hover:text-red-600"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 동영상 링크(선택) */}
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
