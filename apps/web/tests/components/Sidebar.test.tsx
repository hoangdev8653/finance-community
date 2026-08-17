import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sidebar } from '@/components/navigation/Sidebar';

describe('Sidebar Component', () => {
  it('renders all primary discovery navigation items with valid routes', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Home Feed/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Explore Posts/i })).toHaveAttribute('href', '/posts');
    expect(screen.getByRole('link', { name: /Educational Series/i })).toHaveAttribute('href', '/series');
    expect(screen.getByRole('link', { name: /Categories/i })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: /Market Tags/i })).toHaveAttribute('href', '/tags');
  });

  it('renders personal workspace link to /dashboard', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /My Workspace/i })).toHaveAttribute('href', '/dashboard');
  });

  it('enforces dead-link protection by ensuring no /bookmarks or /subscriptions exist in DOM', () => {
    render(<Sidebar />);
    expect(screen.queryByText('Bookmarks')).toBeNull();
    expect(screen.queryByText('My Subscriptions')).toBeNull();
    expect(screen.queryByRole('link', { name: /Bookmarks/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /My Subscriptions/i })).toBeNull();
  });
});
