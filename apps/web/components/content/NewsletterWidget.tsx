'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function NewsletterWidget() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    // Simulate brief network submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail('');
    }, 600);
  };

  return (
    <div className="relative overflow-hidden rounded-none border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 via-slate-900/5 to-slate-900/20 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900/80 p-5 space-y-3.5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-none bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <Mail className="h-4 w-4" />
        </div>
        <span className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
          {t('newsletter.title')}
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
        {t('newsletter.desc')}
      </p>

      {isSuccess ? (
        <div className="flex items-center gap-2 p-3 rounded-none bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{t('newsletter.subscribed')}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              required
              className="w-full rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-heading font-bold text-xs py-2.5 transition-all cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>{t('newsletter.subscribe')}</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-1">
        <span>{t('newsletter.privacyNote')}</span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <Sparkles className="h-2.5 w-2.5" />
          Miễn phí
        </span>
      </div>
    </div>
  );
}
