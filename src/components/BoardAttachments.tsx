// 게시물 공통 첨부·미디어 렌더(5.7-B). 인라인(이미지·영상·임베드) + 하단 첨부목록. 서버 컴포넌트.
import { getTranslations } from 'next-intl/server';
import { getAttachments } from '@/lib/attachments/queries';
import { boardMediaUrl, videoEmbedUrl } from '@/lib/attachments/media';
import type { BoardAttachmentRow, BoardOwnerType } from '@/lib/supabase/database.types';

function InlineMedia({ a }: { a: BoardAttachmentRow }) {
  if (a.kind === 'image' && a.storage_path) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={boardMediaUrl(a.storage_path)}
        alt={a.file_name ?? ''}
        className="max-w-full rounded-lg"
      />
    );
  }
  if (a.kind === 'video_file' && a.storage_path) {
    return <video src={boardMediaUrl(a.storage_path)} controls className="max-w-full rounded-lg" />;
  }
  if (a.kind === 'video_link' && a.external_url) {
    const embed = videoEmbedUrl(a.external_url);
    if (embed) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={embed}
            title={a.file_name ?? 'video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    return (
      <a href={a.external_url} target="_blank" rel="noreferrer" className="text-sm underline">
        {a.external_url}
      </a>
    );
  }
  return null;
}

export async function BoardAttachments({
  ownerType,
  ownerId,
}: {
  ownerType: BoardOwnerType;
  ownerId: string;
}) {
  const t = await getTranslations('attachments');
  const all = await getAttachments(ownerType, ownerId);
  if (all.length === 0) return null;

  const inline = all.filter((a) => a.inline && a.kind !== 'file');
  const files = all.filter((a) => !a.inline || a.kind === 'file');

  return (
    <div className="flex flex-col gap-4">
      {inline.map((a) => (
        <InlineMedia key={a.id} a={a} />
      ))}

      {files.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4">
          <h3 className="text-sm font-semibold text-neutral-500">{t('files')}</h3>
          <ul className="flex flex-col gap-1">
            {files.map((a) => (
              <li key={a.id}>
                {a.storage_path ? (
                  <a
                    href={boardMediaUrl(a.storage_path)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="text-sm underline"
                  >
                    {a.file_name ?? a.storage_path}
                    {a.size_bytes ? ` (${Math.round(a.size_bytes / 1024)} KB)` : ''}
                  </a>
                ) : (
                  <span className="text-sm text-neutral-500">{a.file_name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
