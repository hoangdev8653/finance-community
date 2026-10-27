'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleHelp, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

type Option = { id: string; label: string; isCorrect: boolean };
type Question = { prompt: string; options: Option[]; explanation: string };

const blank = (): Question => ({
  prompt: '',
  explanation: '',
  options: [
    { id: crypto.randomUUID(), label: '', isCorrect: true },
    { id: crypto.randomUUID(), label: '', isCorrect: false },
  ],
});

const fieldClassName =
  'min-h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:ring-2 focus:ring-primary/15';

export function LearningQuizManager({ postId }: { postId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void apiClient.get(`/learning/admin/posts/${postId}/quiz`).then(({ data }) => {
      if (!active || !data.quiz) return;
      setTitle(data.quiz.title);
      setDescription(data.quiz.description || '');
      setQuestions(data.questions.map((question: any) => ({
        prompt: question.prompt,
        explanation: question.explanation || '',
        options: question.options.map((option: any) => ({
          id: option.id,
          label: option.label || option.text || '',
          isCorrect: Boolean(option.isCorrect),
        })),
      })));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [postId]);

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((current) => current.map((question, i) => i === index ? { ...question, ...patch } : question));
  }

  async function save() {
    if (!title.trim() || questions.some((question) => !question.prompt.trim() || question.options.length < 2)) return;
    setSaving(true);
    setMessage('');
    try {
      await apiClient.patch(`/learning/admin/posts/${postId}/quiz`, {
        title: title.trim(),
        description: description.trim() || undefined,
        questions,
      });
      setMessage('Đã lưu quiz.');
    } catch {
      setMessage('Không thể lưu quiz. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm"><Loader2 className="h-4 w-4 animate-spin" />Đang tải quiz…</div>;
  }

  return (
    <section className="font-sans overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300"><CircleHelp className="h-5 w-5" /></span>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">Quiz bài học</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Giúp người học ôn tập và kiểm tra kiến thức</p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{questions.length} câu hỏi</span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Tên bài kiểm tra</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Ôn tập chương 1" className={fieldClassName} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Mô tả <span className="font-normal text-muted-foreground">(không bắt buộc)</span></span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mô tả ngắn về bài kiểm tra" className={fieldClassName} />
          </label>
        </div>

        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question, questionIndex) => (
              <fieldset key={questionIndex} className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <legend className="text-sm font-bold text-foreground">Câu {questionIndex + 1}</legend>
                  <button type="button" onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))} aria-label={`Xóa câu ${questionIndex + 1}`} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />Xóa câu hỏi
                  </button>
                </div>
                <input value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} placeholder="Nhập nội dung câu hỏi" className={fieldClassName} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={option.id} className={`flex min-h-11 items-center gap-2.5 rounded-lg border px-3 transition ${option.isCorrect ? 'border-emerald-300 bg-emerald-500/5 dark:border-emerald-800' : 'border-border bg-background'}`}>
                      <input type="radio" name={`correct-${postId}-${questionIndex}`} checked={option.isCorrect} onChange={() => updateQuestion(questionIndex, { options: question.options.map((item, index) => ({ ...item, isCorrect: index === optionIndex })) })} aria-label={`Đặt lựa chọn ${optionIndex + 1} làm đáp án đúng`} className="h-4 w-4 accent-emerald-600" />
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">{String.fromCharCode(65 + optionIndex)}</span>
                      <input value={option.label} onChange={(event) => updateQuestion(questionIndex, { options: question.options.map((item, index) => index === optionIndex ? { ...item, label: event.target.value } : item) })} placeholder={`Lựa chọn ${optionIndex + 1}`} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/75" />
                      {option.isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                    </label>
                  ))}
                </div>
                <textarea value={question.explanation} onChange={(event) => updateQuestion(questionIndex, { explanation: event.target.value })} placeholder="Giải thích đáp án (không bắt buộc)" className="min-h-20 w-full resize-y rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </fieldset>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-4">
            <CircleHelp className="h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Chưa có câu hỏi. Thêm câu đầu tiên để tạo bài kiểm tra cho học viên.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 border-t border-border/70 pt-4">
          <button type="button" onClick={() => setQuestions((current) => [...current, blank()])} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3.5 text-sm font-semibold text-foreground transition hover:bg-muted">
            <Plus className="h-4 w-4" />Thêm câu hỏi
          </button>
          <button type="button" disabled={saving || !title.trim()} onClick={() => void save()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-55">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Đang lưu…' : 'Lưu quiz'}
          </button>
          {message && <span role="status" className={`text-sm ${message.startsWith('Đã') ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}>{message}</span>}
        </div>
      </div>
    </section>
  );
}
