'use client';

import { useEffect, useState } from 'react';
import { Check, CircleHelp, Loader2, RotateCcw, X } from 'lucide-react';
import { learningService } from '@/lib/learning/learning-service';

type QuizOption = { id?: string; label?: string; text?: string; isCorrect?: boolean };

interface LearningQuizProps { postId: string; }

export function LearningQuiz({ postId }: LearningQuizProps) {
  const [quiz, setQuiz] = useState<Awaited<ReturnType<typeof learningService.getQuiz>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    void learningService.getQuiz(postId).then((value) => { if (active) { setQuiz(value); setLoading(false); } }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId]);

  if (loading) return <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border p-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang tải bài kiểm tra…</div>;
  if (!quiz?.quiz || quiz.questions.length === 0) return null;

  const score = quiz.questions.reduce((total, question) => {
    const selected = (question.options as QuizOption[]).find((option) => (option.id || option.label || option.text) === answers[question.id]);
    return total + (selected?.isCorrect ? 1 : 0);
  }, 0);
  const allAnswered = quiz.questions.every((question) => answers[question.id]);

  return <section className="mt-10 rounded-2xl border border-border bg-muted/20 p-5 sm:p-7" aria-labelledby="learning-quiz-title">
    <div className="mb-6 flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><CircleHelp className="h-5 w-5" /></div><div><h2 id="learning-quiz-title" className="text-xl font-bold">{quiz.quiz.title}</h2>{quiz.quiz.description && <p className="mt-1 text-sm text-muted-foreground">{quiz.quiz.description}</p>}</div></div>
    <div className="space-y-6">{quiz.questions.map((question, index) => <fieldset key={question.id} className="space-y-3"><legend className="font-semibold">{index + 1}. {question.prompt}</legend><div className="space-y-2">{(question.options as QuizOption[]).map((option, optionIndex) => { const value = option.id || option.label || option.text || String(optionIndex); const selected = answers[question.id] === value; const correct = submitted && option.isCorrect; const wrong = submitted && selected && !option.isCorrect; return <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${correct ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-red-400 bg-red-50' : selected ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/50'}`}><input type="radio" name={question.id} value={value} checked={selected} onChange={() => { if (!submitted) setAnswers((current) => ({ ...current, [question.id]: value })); }} disabled={submitted} className="accent-primary" /><span className="flex-1">{option.label || option.text || value}</span>{correct && <Check className="h-4 w-4 text-emerald-600" />}{wrong && <X className="h-4 w-4 text-red-600" />}</label>; })}</div>{submitted && question.explanation && <p className="rounded-lg bg-surface p-3 text-sm text-muted-foreground"><strong>Giải thích:</strong> {question.explanation}</p>}</fieldset>)}</div>
    <div className="mt-7 flex flex-wrap items-center gap-3"><button type="button" disabled={!allAnswered} onClick={() => setSubmitted(true)} className="min-h-11 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">Kiểm tra đáp án</button>{submitted && <><span className="text-sm font-semibold">Kết quả: {score}/{quiz.questions.length}</span><button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold"><RotateCcw className="h-4 w-4" />Làm lại</button></>}</div>
  </section>;
}
