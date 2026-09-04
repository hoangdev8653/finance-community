'use client';

import React from 'react';

interface ToolSliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  helperText?: string;
  formatAsCurrency?: boolean;
}

export function ToolSliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = '',
  helperText,
  formatAsCurrency = false,
}: ToolSliderInputProps) {
  const formatDisplay = (val: number) => {
    if (formatAsCurrency) {
      return new Intl.NumberFormat('vi-VN').format(Math.max(0, val));
    }
    return val.toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = raw === '' ? 0 : Number(raw);
    onChange(num);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
      </div>

      <div className="flex items-center rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <input
          type={formatAsCurrency ? 'text' : 'number'}
          value={formatDisplay(value)}
          onChange={handleInputChange}
          className="h-11 min-w-0 flex-1 bg-transparent text-base font-bold text-foreground outline-none"
        />
        {suffix && (
          <span className="shrink-0 pl-2 font-mono text-sm font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>

      <div className="space-y-1 pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={handleRangeChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none"
        />
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{formatDisplay(min)} {suffix}</span>
          <span>{formatDisplay(max)} {suffix}</span>
        </div>
      </div>
    </div>
  );
}
