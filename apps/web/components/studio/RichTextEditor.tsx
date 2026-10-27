'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Quote, RefreshCw, Table2, Trash2 } from 'lucide-react';
import { validateMediaFile } from '@/lib/media/upload-client';
import { MediaUploader } from '@/components/media/MediaUploader';

interface RichTextEditorProps { value: string; onChange: (html: string) => void; onPendingImagesChange?: (images: Map<string, File>) => void; }
const altFromFile = (file: File) => file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Ảnh minh họa';

export function RichTextEditor({ value, onChange, onPendingImagesChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceSelectedImageRef = useRef(false);
  const selectedImagePositionRef = useRef<number | null>(null);
  const pendingRef = useRef(new Map<string, File>());
  const [imageAlt, setImageAlt] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [tableSelected, setTableSelected] = useState(false);
  const editor = useEditor({ immediatelyRender: false, extensions: [StarterKit, Image.configure({ allowBase64: false }), Table.configure({ resizable: true }), TableRow, TableHeader, TableCell], content: value, editorProps: { attributes: { class: 'rich-text-content min-h-[360px] max-w-none px-5 py-4 text-base leading-8 text-foreground outline-none [&_p]:mb-5 [&_h2]:mb-4 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[10px] [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-3 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-3' } }, onUpdate: ({ editor: current }) => onChange(current.getHTML()) });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  useEffect(() => {
    if (!editor) return;
    const updateSelection = () => {
      setImageSelected(editor.isActive('image'));
      setTableSelected(editor.isActive('table'));
    };
    editor.on('selectionUpdate', updateSelection);
    editor.on('transaction', updateSelection);
    updateSelection();
    return () => {
      editor.off('selectionUpdate', updateSelection);
      editor.off('transaction', updateSelection);
    };
  }, [editor]);
  if (!editor) return null;
  const countImages = (nodes: any[] = []): number => nodes.reduce(
    (count, node) => count + (node.type === 'image' ? 1 : 0) + countImages(node.content || []),
    0,
  );
  const imageCount = countImages(editor.getJSON().content || []);
  const insert = (src: string, alt: string) => editor.chain().focus().setImage({ src, alt: alt || 'Ảnh minh họa' }).run();
  const chooseFile = (file: File) => {
    if (!file) return;
    const selectedImagePosition = selectedImagePositionRef.current;
    const replacingSelectedImage = replaceSelectedImageRef.current && selectedImagePosition !== null;
    replaceSelectedImageRef.current = false;
    selectedImagePositionRef.current = null;
    if (!replacingSelectedImage && imageCount >= 3) { setError('Mỗi bài viết chỉ được dùng tối đa 3 ảnh content.'); return; }
    const validation = validateMediaFile(file); if (!validation.valid) { setError(validation.error || 'Tệp ảnh không hợp lệ.'); return; }
    const tempUrl = URL.createObjectURL(file);
    pendingRef.current.set(tempUrl, file);
    onPendingImagesChange?.(new Map(pendingRef.current));
    if (replacingSelectedImage) {
      editor.chain().focus().setNodeSelection(selectedImagePosition!).updateAttributes('image', { src: tempUrl, alt: imageAlt.trim() || altFromFile(file) }).run();
    } else {
      insert(tempUrl, imageAlt.trim() || altFromFile(file));
    }
    setImageAlt(''); setOpen(false); setError(null);
  };
  const replaceSelectedImage = () => {
    const position = editor.state.selection.from;
    if (editor.state.doc.nodeAt(position)?.type.name !== 'image') return;
    replaceSelectedImageRef.current = true;
    selectedImagePositionRef.current = position;
    fileInputRef.current?.click();
  };
  const handleReplaceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) chooseFile(file);
  };
  const handleInsertFile = (file: File) => {
    replaceSelectedImageRef.current = false;
    selectedImagePositionRef.current = null;
    chooseFile(file);
  };
  const removeSelectedImage = () => {
    editor.chain().focus().deleteSelection().run();
    setImageSelected(false);
  };
  const button = (label: string, Icon: typeof Bold, run: () => void, active = false) => <button type="button" onClick={run} aria-label={label} aria-pressed={active} className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-4 w-4" aria-hidden="true" /></button>;
  return <div className="rounded-md border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-slate-700/70 dark:bg-slate-950">
    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleReplaceInputChange} className="sr-only" />
    <div className="sticky top-[72px] z-30 rounded-t-md bg-white shadow-sm dark:bg-slate-950">
    <div role="toolbar" aria-label="Thanh định dạng nội dung" className="flex flex-wrap items-center gap-1 rounded-t-md border-b border-border bg-surface/95 p-2 backdrop-blur">
      {button('Tiêu đề lớn', Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}{button('Tiêu đề nhỏ', Heading3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}{button('In đậm', Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}{button('In nghiêng', Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}{button('Danh sách', List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}{button('Danh sách số', ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}{button('Trích dẫn', Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}{button('Chèn bảng', Table2, () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}{button('Chèn liên kết', LinkIcon, () => { const url = window.prompt('Nhập liên kết'); if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); })}{button('Chèn ảnh', ImagePlus, () => { setOpen((current) => !current); setError(null); })}
      {imageSelected && <>
        <span className="mx-1 h-6 border-l border-border" aria-hidden="true" />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={replaceSelectedImage} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-primary hover:bg-primary/10" aria-label="Thay ảnh đang chọn">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />Thay ảnh
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={removeSelectedImage} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive/10" aria-label="Xóa ảnh đang chọn">
          <Trash2 className="h-4 w-4" aria-hidden="true" />Xóa ảnh
        </button>
      </>}
      {tableSelected && <>
        <span className="mx-1 h-6 border-l border-border" aria-hidden="true" />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().deleteTable().run()} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive/10" aria-label="Xóa bảng" title="Xóa toàn bộ bảng">
          <Trash2 className="h-4 w-4" aria-hidden="true" />Xóa bảng
        </button>
      </>}
    </div>
    {open && <div className="space-y-3 border-b border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Ảnh trong nội dung bài viết <span className="font-normal text-muted-foreground">({imageCount}/3)</span></p>
          <p className="mt-0.5 text-xs text-muted-foreground">Ảnh sẽ xuất hiện tại vị trí con trỏ, độc lập với ảnh bìa.</p>
        </div>
      </div>
      <MediaUploader
        purpose="content"
        folder="posts/content"
        label="Chọn ảnh trong nội dung bài viết"
        deferUpload
        onFileSelected={handleInsertFile}
      />
      <label className="block text-xs font-medium">Văn bản mô tả ảnh <span className="font-normal text-muted-foreground">(không bắt buộc, không phải URL)</span><input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Ví dụ: Biểu đồ minh họa lãi kép" className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>}
    </div>
    <EditorContent editor={editor} />
  </div>;
}
