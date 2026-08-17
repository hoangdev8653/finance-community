import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email Address" name="email" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<Input name="email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });
});
