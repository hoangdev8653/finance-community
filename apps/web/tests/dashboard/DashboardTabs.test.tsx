import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

describe('DashboardTabs Component', () => {
  it('renders tab buttons with accessible roles and badge counts', () => {
    const handleTabChange = vi.fn();

    render(
      <DashboardTabs
        activeTab="published"
        onTabChange={handleTabChange}
        publishedCount={8}
        draftsCount={2}
      />
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const publishedTab = screen.getByRole('tab', { name: /Published Research/i });
    expect(publishedTab).toHaveAttribute('aria-selected', 'true');
    expect(publishedTab).toHaveTextContent('8');

    const draftsTab = screen.getByRole('tab', { name: /Drafts/i });
    expect(draftsTab).toHaveAttribute('aria-selected', 'false');
    expect(draftsTab).toHaveTextContent('2');

    const archivedTab = screen.getByRole('tab', { name: /Archived Notes/i });
    expect(archivedTab).toHaveAttribute('aria-selected', 'false');
  });

  it('triggers onTabChange when a tab is clicked or navigated via keyboard', () => {
    const handleTabChange = vi.fn();

    render(
      <DashboardTabs
        activeTab="published"
        onTabChange={handleTabChange}
        publishedCount={5}
        draftsCount={1}
      />
    );

    const draftsTab = screen.getByRole('tab', { name: /Drafts/i });
    fireEvent.click(draftsTab);
    expect(handleTabChange).toHaveBeenCalledWith('drafts');

    const publishedTab = screen.getByRole('tab', { name: /Published Research/i });
    fireEvent.keyDown(publishedTab, { key: 'ArrowRight' });
    expect(handleTabChange).toHaveBeenCalledWith('drafts');

    // Left arrow navigation from first tab wraps to last tab (archived)
    fireEvent.keyDown(publishedTab, { key: 'ArrowLeft' });
    expect(handleTabChange).toHaveBeenCalledWith('archived');
  });
});
