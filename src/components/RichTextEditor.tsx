'use client';
// 공통 리치 텍스트 에디터(5.7-B, TipTap). HTML 을 hidden input 으로 폼에 전달. 출력은 SafeHtml 로 새니타이즈.
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Btn = { cmd: (e: NonNullable<ReturnType<typeof useEditor>>) => void; label: string; mark?: string };

export function RichTextEditor({ name, defaultValue = '' }: { name: string; defaultValue?: string }) {
  const t = useTranslations('editor');
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'min-h-40 rounded-b-md border border-t-0 border-neutral-300 px-3 py-2 focus:outline-none prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-500',
      },
    },
  });

  if (!editor) return null;

  const buttons: Btn[] = [
    { cmd: (e) => e.chain().focus().toggleBold().run(), label: t('bold'), mark: 'bold' },
    { cmd: (e) => e.chain().focus().toggleItalic().run(), label: t('italic'), mark: 'italic' },
    { cmd: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), label: t('h2') },
    { cmd: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), label: t('h3') },
    { cmd: (e) => e.chain().focus().toggleBulletList().run(), label: t('bullet') },
    { cmd: (e) => e.chain().focus().toggleOrderedList().run(), label: t('ordered') },
    { cmd: (e) => e.chain().focus().toggleBlockquote().run(), label: t('quote') },
    { cmd: (e) => e.chain().focus().setHorizontalRule().run(), label: t('hr') },
  ];

  function setLink() {
    if (!editor) return;
    const url = window.prompt(t('linkPrompt')) ?? '';
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  }

  return (
    <div className="flex flex-col">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-1 rounded-t-md border border-neutral-300 bg-neutral-50 p-1">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => b.cmd(editor)}
            aria-pressed={b.mark ? editor.isActive(b.mark) : undefined}
            className={`rounded px-2 py-1 text-xs ${
              b.mark && editor.isActive(b.mark) ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-200'
            }`}
          >
            {b.label}
          </button>
        ))}
        <button type="button" onClick={setLink} className="rounded px-2 py-1 text-xs hover:bg-neutral-200">
          {t('link')}
        </button>
        <span className="ml-auto flex gap-1">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} className="rounded px-2 py-1 text-xs hover:bg-neutral-200">
            {t('undo')}
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className="rounded px-2 py-1 text-xs hover:bg-neutral-200">
            {t('redo')}
          </button>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
