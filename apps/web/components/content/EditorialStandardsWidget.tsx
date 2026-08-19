import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function EditorialStandardsWidget() {
  return (
    <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-[#edf5fe] dark:bg-blue-950/40 p-5 space-y-3 shadow-card">
      <div className="flex items-center gap-2 text-blue-950 dark:text-blue-200 font-bold text-base">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span>Editorial Standards</span>
      </div>
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        Every analysis published on Finance Pulse adheres to independent analytical integrity. Content is reviewed for factual rigor, data methodology, and source transparency.
      </p>
    </div>
  );
}
