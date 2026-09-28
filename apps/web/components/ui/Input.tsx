import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-900 dark:text-slate-100">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/90 disabled:text-slate-800 dark:disabled:text-slate-200 disabled:border-slate-300 dark:disabled:border-slate-700',
            error && 'border-danger focus-visible:ring-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
