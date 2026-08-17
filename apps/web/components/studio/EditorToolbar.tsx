'use client';

import React from 'react';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  Code,
  List,
  Table as TableIcon,
} from 'lucide-react';

interface EditorToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
}

export function EditorToolbar({ onInsert }: EditorToolbarProps) {
  const tools = [
    {
      label: 'Heading 2',
      icon: Heading2,
      action: () => onInsert('## ', '', 'Section Heading'),
    },
    {
      label: 'Heading 3',
      icon: Heading3,
      action: () => onInsert('### ', '', 'Sub-heading'),
    },
    {
      label: 'Bold',
      icon: Bold,
      action: () => onInsert('**', '**', 'bold text'),
    },
    {
      label: 'Italic',
      icon: Italic,
      action: () => onInsert('*', '*', 'italic text'),
    },
    {
      label: 'Blockquote',
      icon: Quote,
      action: () => onInsert('> ', '', 'Analytical citation or quote'),
    },
    {
      label: 'Code Block',
      icon: Code,
      action: () => onInsert('```python\n', '\n```', '# Python quantitative code'),
    },
    {
      label: 'Bullet List',
      icon: List,
      action: () => onInsert('- ', '', 'Key finding item'),
    },
    {
      label: 'Financial Table',
      icon: TableIcon,
      action: () =>
        onInsert(
          '| Metric | FY25E | FY26E | Consensus |\n| :--- | :--- | :--- | :--- |\n| Revenue ($M) | 1,250 | 1,480 | 1,420 |\n| EBITDA Margin | 24.5% | 26.2% | 25.0% |\n\n',
          ''
        ),
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Editorial formatting toolbar"
      className="flex items-center gap-1 flex-wrap p-2 border border-border border-b-0 rounded-t-lg bg-surface/60"
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.label}
            type="button"
            onClick={tool.action}
            aria-label={tool.label}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
