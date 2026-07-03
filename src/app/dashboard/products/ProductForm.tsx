'use client';
// 제품 등록/수정 공용 폼. 서버 액션(create 또는 update.bind)을 prop 으로 받아 재사용.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import type { ActionResult } from '@/lib/supplier/actions';
import type { ProductRow } from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';
import { RichTextEditor } from '@/components/RichTextEditor';

type Category = { id: string; name: string };
type ProductFormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const inputClass = 'rounded-md border border-neutral-300 px-3 py-2';

export function ProductForm({
  categories,
  product,
  action,
  suppliers,
}: {
  categories: Category[];
  product?: ProductRow;
  action: ProductFormAction;
  suppliers?: { id: string; company_name: string }[];
}) {
  const t = useTranslations('supplier');
  const tu = useTranslations('ui');
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {suppliers && (
        <Field label={t('fieldSupplier')}>
          <select name="supplier_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              {t('selectSupplier')}
            </option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company_name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label={t('fieldTitle')}>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          defaultValue={product?.title}
          className={inputClass}
        />
      </Field>

      <Field label={t('fieldDescription')}>
        <textarea
          name="description"
          rows={2}
          defaultValue={product?.description ?? ''}
          className={inputClass}
        />
      </Field>

      <Field label={t('fieldDetail')}>
        <RichTextEditor name="detailBody" defaultValue={product?.detail_body ?? ''} />
      </Field>

      <Field label={t('fieldCategory')}>
        <select name="categoryId" defaultValue={product?.category_id ?? ''} className={inputClass}>
          <option value="">{t('selectCategory')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('fieldPrice')}>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={product?.price ?? ''}
            className={inputClass}
          />
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="priceVisible" defaultChecked={product?.price_visible} />
          {t('fieldPriceVisible')}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('fieldMoq')}>
          <input
            type="number"
            name="moq"
            min={0}
            defaultValue={product?.moq ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldMoqUnit')}>
          <input
            type="text"
            name="moqUnit"
            maxLength={40}
            defaultValue={product?.moq_unit ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('fieldLeadMin')}>
          <input
            type="number"
            name="leadTimeMin"
            min={0}
            defaultValue={product?.lead_time_min ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldLeadMax')}>
          <input
            type="number"
            name="leadTimeMax"
            min={0}
            defaultValue={product?.lead_time_max ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('fieldShipFrom')}>
          <input
            type="text"
            name="shipFrom"
            maxLength={120}
            defaultValue={product?.ship_from ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldPayment')}>
          <input
            type="text"
            name="paymentTerms"
            maxLength={200}
            defaultValue={product?.payment_terms ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('fieldFreight')}>
          <input
            type="text"
            name="freightType"
            maxLength={120}
            defaultValue={product?.freight_type ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldTransport')}>
          <input
            type="text"
            name="transportModes"
            maxLength={120}
            defaultValue={product?.transport_modes ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('fieldHsCode')}>
          <input
            type="text"
            name="hsCode"
            maxLength={40}
            defaultValue={product?.hs_code ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldKeywords')}>
          <input
            type="text"
            name="keywords"
            maxLength={300}
            defaultValue={product?.keywords ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('saveFailed')}
        </p>
      )}

      <FormButton>{tu('save')}</FormButton>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      {children}
    </label>
  );
}
