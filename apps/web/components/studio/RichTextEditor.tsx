'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Quote, Table2, Upload } from 'lucide-react';
import { validateMediaFile } from '@/lib/media/upload-client';

interface RichTextEditorProps { value: string; onChange: (html: string) => void; onPendingImagesChange?: (images: Map<string, File>) => void; }
const altFromFile = (file: File) => file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Ảnh minh họa';

export function RichTextEditor({ value, onChange, onPendingImagesChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(new Map<string, File>());
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [open, setOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editor = useEditor({ immediatelyRender: false, extensions: [StarterKit, Image.configure({ allowBase64: false }), Table.configure({ resizable: true }), TableRow, TableHeader, TableCell], content: value, editorProps: { attributes: { class: 'min-h-[360px] max-w-none px-5 py-4 text-base leading-8 text-foreground outline-none [&_p]:mb-5 [&_h2]:mb-4 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-3 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-3' } }, onUpdate: ({ editor: current }) => onChange(current.getHTML()) });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  if (!editor) return null;
  const imageCount = editor.getJSON().content?.filter((node: any) => node.type === 'image').length || 0;
  const insert = (src: string, alt: string) => editor.chain().focus().setImage({ src, alt: alt || 'Ảnh minh họa' }).run();
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (imageCount >= 3) { setError('Mỗi bài viết chỉ được dùng tối đa 3 ảnh content.'); return; }
    const validation = validateMediaFile(file); if (!validation.valid) { setError(validation.error || 'Tệp ảnh không hợp lệ.'); return; }
    const tempUrl = URL.createObjectURL(file); pendingRef.current.set(tempUrl, file); onPendingImagesChange?.(new Map(pendingRef.current)); insert(tempUrl, imageAlt.trim() || altFromFile(file)); setImageAlt(''); setOpen(false); setError(null);
  };
  const addUrl = () => { if (imageCount >= 3) { setError('Mỗi bài viết chỉ được dùng tối đa 3 ảnh content.'); return; } if (!imageUrl.trim()) { setError('Vui lòng nhập URL ảnh.'); return; } insert(imageUrl.trim(), imageAlt.trim()); setImageUrl(''); setImageAlt(''); setOpen(false); setError(null); };
  const button = (label: string, Icon: typeof Bold, run: () => void, active = false) => <button type="button" onClick={run} aria-label={label} aria-pressed={active} className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-4 w-4" aria-hidden="true" /></button>;
  return <div className="overflow-hidden rounded-lg border border-input bg-background">
    <div role="toolbar" aria-label="Thanh định dạng nội dung" className="flex flex-wrap items-center gap-1 border-b border-border bg-surface/60 p-2">
      {button('Tiêu đề lớn', Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}{button('Tiêu đề nhỏ', Heading3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}{button('In đậm', Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}{button('In nghiêng', Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}{button('Danh sách', List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}{button('Danh sách số', ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}{button('Trích dẫn', Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}{button('Chèn bảng', Table2, () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}{button('Chèn liên kết', LinkIcon, () => { const url = window.prompt('Nhập liên kết'); if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); })}{button('Chèn ảnh', ImagePlus, () => { setOpen((current) => !current); setError(null); })}
    </div>
    {open && <div className="space-y-3 border-b border-border bg-surface p-3"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseFile} className="sr-only" /><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Tải ảnh từ máy tính</p><p className="text-xs text-muted-foreground">Ảnh chỉ được tải lên khi lưu nháp hoặc gửi duyệt.</p></div><button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"><Upload className="h-4 w-4" aria-hidden="true" />Chọn ảnh</button></div><label className="block text-xs font-medium">Mô tả ảnh<input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Ví dụ: Biểu đồ minh họa lãi kép" className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><button type="button" onClick={() => setShowUrl((current) => !current)} className="text-xs font-medium text-primary hover:underline">{showUrl ? 'Ẩn tùy chọn URL' : 'Hoặc dán URL ảnh có sẵn'}</button>{showUrl && <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="h-10 rounded-md border border-input bg-background px-3 text-sm" /><button type="button" onClick={addUrl} className="min-h-10 rounded-md border border-primary px-4 text-sm font-semibold text-primary">Chèn URL</button></div>}{error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}</div>}
    <EditorContent editor={editor} />
  </div>;
}
