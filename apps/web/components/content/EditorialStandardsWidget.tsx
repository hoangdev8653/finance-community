'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function EditorialStandardsWidget() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 space-y-2">
      <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">
        {t('home.editorialStandards')}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {t('home.editorialStandardsDesc')}
      </p>
    </div>
  );
}
