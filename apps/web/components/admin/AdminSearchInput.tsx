'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface AdminSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

export function AdminSearchInput({ value, onValueChange, placeholder = 'Tìm kiếm...', ...props }: AdminSearchInputProps) {
  return <div className="relative w-full sm:w-[360px] sm:max-w-none"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input {...props} value={value} onChange={(event) => onValueChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />{value && <button type="button" onClick={() => onValueChange('')} className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Xóa tìm kiếm"><X className="h-4 w-4" /></button>}</div>;
}
