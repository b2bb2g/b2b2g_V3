// 랜딩 광고배너 슬롯(6.5). placement 별 활성 배너 렌더. 이미지는 URL 또는 board-media 경로.
import { listActiveBanners } from '@/lib/marketing/queries';
import { boardMediaUrl } from '@/lib/attachments/media';
import type { AdBannerRow, BannerPlacement } from '@/lib/supabase/database.types';

function imgSrc(image: string): string {
  return image.startsWith('http') ? image : boardMediaUrl(image);
}

function BannerCard({ b }: { b: AdBannerRow }) {
  const inner = (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      {b.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgSrc(b.image)} alt={b.headline ?? b.title} className="w-full object-cover" />
      )}
      {(b.headline || b.subtext) && (
        <div className="flex flex-col gap-1 p-4">
          {b.headline && <span className="font-semibold">{b.headline}</span>}
          {b.subtext && <span className="text-sm text-neutral-500">{b.subtext}</span>}
        </div>
      )}
    </div>
  );
  return b.link_url ? (
    <a href={b.link_url} className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}

export async function BannerSlot({ placement }: { placement: BannerPlacement }) {
  const banners = (await listActiveBanners()).filter((b) => b.placement === placement);
  if (banners.length === 0) return null;

  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 sm:grid-cols-2">
      {banners.map((b) => (
        <BannerCard key={b.id} b={b} />
      ))}
    </section>
  );
}
