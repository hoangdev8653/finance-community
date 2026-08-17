import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactionButton } from '@/components/reactions/ReactionButton';

describe('ReactionButton Component', () => {
  it('renders inactive reaction button with count and aria attributes', () => {
    const onToggle = vi.fn();

    render(
      <ReactionButton
        total={12}
        userReacted={false}
        onToggle={onToggle}
        labelPrefix="Like this analysis"
      />
    );

    const button = screen.getByRole('button', {
      name: /Like - Like this analysis. 12 analysts liked this/i,
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('12')).toBeDefined();

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders active reaction button with aria-pressed="true"', () => {
    const onToggle = vi.fn();

    render(
      <ReactionButton
        total={13}
        userReacted={true}
        onToggle={onToggle}
        labelPrefix="Like this analysis"
      />
    );

    const button = screen.getByRole('button', {
      name: /Unlike - Like this analysis. 13 analysts liked this/i,
    });
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('is disabled when isLoading is true', () => {
    const onToggle = vi.fn();

    render(
      <ReactionButton
        total={10}
        userReacted={false}
        onToggle={onToggle}
        isLoading={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);

    fireEvent.click(button);
    expect(onToggle).not.toHaveBeenCalled();
  });
});
