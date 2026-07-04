// 게시판 글쓰기/수정 통합 편집기(재사용). 상단 액션바(임시저장/등록 또는 삭제/임시저장/수정완료) + 라벨-좌측 폼 + 첨부.
// 다른 메뉴에서도 record/actions/ownerType 만 바꿔 재사용 가능.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { RichTextEditor } from '@/components/RichTextEditor';
import { AttachmentManager } from '@/components/AttachmentManager';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import type { BoardAttachmentRow, BoardCategoryRow, BoardOwnerType } from '@/lib/supabase/database.types';

export type EditorRecord = {
  id: string;
  title: string;
  body: string;
  category_id: string | null;
  is_pinned: boolean;
  status: string;
};

const FORM_ID = 'board-editor-form';
const input = 'w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm';

export async function BoardEditor({
  record,
  categories,
  locale,
  attachments,
  userId,
  ownerType,
  backHref,
  boardTitle,
  submitAction,
  deleteAction,
}: {
  record: EditorRecord;
  categories: BoardCategoryRow[];
  locale: string;
  attachments: BoardAttachmentRow[];
  userId: string;
  ownerType: BoardOwnerType;
  backHref: string;
  boardTitle: string;
  submitAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const t = await getTranslations('content');
  const published = record.status === 'published';
  const req = <span className="text-red-500"> *</span>;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-8">
      {/* 상단바 */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href={backHref} className="hover:text-neutral-800" aria-label={t('boardList')}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Link>
          <Link href="/" className="hover:text-neutral-800" aria-label={t('home')}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8z" />
            </svg>
          </Link>
          <span className="text-neutral-300">/</span>
          <span>{boardTitle}</span>
        </nav>
        <div className="flex items-center gap-2">
          {published && (
            <ConfirmButton
              action={deleteAction}
              title={t('deleteConfirm')}
              confirmLabel={t('delete')}
              variant="danger"
            >
              {t('delete')}
            </ConfirmButton>
          )}
          <button
            type="submit"
            form={FORM_ID}
            name="intent"
            value="draft"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-400"
          >
            {t('boardSaveDraft')}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            name="intent"
            value="publish"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {published ? t('boardUpdate') : t('boardRegister')}
          </button>
        </div>
      </div>

      {/* 폼 */}
      <form
        id={FORM_ID}
        action={submitAction}
        className="grid grid-cols-1 gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:grid-cols-[88px_1fr] sm:items-center"
      >
        <input type="hidden" name="id" value={record.id} />

        <label className="text-sm font-medium">{t('fieldTitle')}{req}</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={record.title}
          placeholder={t('boardTitlePlaceholder')}
          className={input}
        />

        <label className="text-sm font-medium">{t('fieldCategory')}{req}</label>
        <select name="category_id" required defaultValue={record.category_id ?? ''} className={input}>
          <option value="" disabled>
            {t('categoryNone')}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === 'ko' ? c.name_ko : c.name_en}
            </option>
          ))}
        </select>

        <label className="text-sm font-medium sm:self-start sm:pt-2">{t('fieldBody')}{req}</label>
        <RichTextEditor name="body" defaultValue={record.body} />

        <label className="text-sm font-medium sm:self-start">{t('pin')}</label>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" name="is_pinned" defaultChecked={record.is_pinned} />
          {t('pinHint')}
        </label>

        <label className="text-sm font-medium sm:self-start sm:pt-2">{t('boardAttach')}</label>
        <AttachmentManager
          ownerType={ownerType}
          ownerId={record.id}
          userId={userId}
          attachments={attachments}
        />
      </form>
    </main>
  );
}
