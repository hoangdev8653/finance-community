'use client';

import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Avatar({ className, src, alt = '', fallback = 'U', size = 'md', ...props }: AvatarProps) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <AvatarPrimitive.Root
      className={cn('relative flex shrink-0 overflow-hidden rounded-full bg-muted', sizes[size], className)}
      {...props}
    >
      <AvatarPrimitive.Image src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center font-medium uppercase text-muted-foreground"
      >
        {fallback.slice(0, 2)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
