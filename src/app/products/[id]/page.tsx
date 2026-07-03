// 공개 제품 상세(6.4). 비회원은 기본 정보만, 가격·거래조건은 로그인 벽. 문의는 Phase 3.
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProductDetail, getProductCertifications } from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { ShareWidget } from '@/components/ShareWidget';
import { BoardAttachments } from '@/components/BoardAttachments';
import { SafeHtml } from '@/components/SafeHtml';
import { InquiryForm } from './InquiryForm';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('products');
  const { id } = await params;
  const detail = await getProductDetail(id);
  if (!detail) notFound();
  const certifications = await getProductCertifications(id);

  const { base, categoryName, companyName, images, isMember, full } = detail;
  const ordered = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link href="/commercial" className="text-sm text-neutral-500 underline">
          {t('backToList')}
        </Link>
        <h1 className="text-3xl font-bold">{base.title}</h1>
        <p className="text-sm text-neutral-500">
          {categoryName ? `${categoryName} · ` : ''}
          <Link href={`/suppliers/${base.supplier_id}`} className="underline">
            {companyName}
          </Link>
        </p>
      </div>

      {ordered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ordered.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
            >
              <Image
                src={publicImageUrl(img.path)}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 300px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {base.description && <p className="text-neutral-700">{base.description}</p>}
      <SafeHtml html={base.detail_body ?? ''} />

      <section className="rounded-lg border border-neutral-200 p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">{t('gatedTitle')}</h2>

        {!isMember || !full ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-neutral-600">{t('gatedPrompt')}</p>
            <Link
              href={`/auth/login?next=/products/${base.id}`}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t('signIn')}
            </Link>
          </div>
        ) : (
          <dl className="flex flex-col gap-2 text-sm">
            <Row
              label={t('gatedTitle')}
              value={priceText(full.price_visible, full.price, t('priceContact'))}
            />
            {(full.moq != null || full.moq_unit) && (
              <Row label={t('moq')} value={`${full.moq ?? ''} ${full.moq_unit ?? ''}`.trim()} />
            )}
            {(full.lead_time_min != null || full.lead_time_max != null) && (
              <Row
                label={t('leadTime')}
                value={`${full.lead_time_min ?? ''}${
                  full.lead_time_max != null ? `–${full.lead_time_max}` : ''
                } ${t('daysUnit')}`.trim()}
              />
            )}
            {full.ship_from && <Row label={t('shipFrom')} value={full.ship_from} />}
            {full.payment_terms && <Row label={t('paymentTerms')} value={full.payment_terms} />}
          </dl>
        )}

        {isMember && full && <InquiryForm productId={base.id} />}
      </section>

      {certifications.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neutral-500">{t('certifications')}</h2>
          <ul className="flex flex-wrap gap-2">
            {certifications.map((c) => (
              <li
                key={c.id}
                className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
              >
                <span className="mr-1 text-neutral-400">{t(`certType_${c.type}`)}</span>
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <BoardAttachments ownerType="product" ownerId={base.id} />

      <ShareWidget targetType="product" targetId={base.id} />
    </main>
  );
}

function priceText(visible: boolean, price: number | null, contactLabel: string): string {
  if (visible && price != null) return String(price);
  return contactLabel;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-neutral-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
