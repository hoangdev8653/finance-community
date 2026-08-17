import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardMetricsBar } from '@/components/dashboard/DashboardMetricsBar';

describe('DashboardMetricsBar Component', () => {
  it('renders all four KPI metric cards with formatted numbers', () => {
    const mockMetrics = {
      totalAnalyses: 12,
      draftsCount: 3,
      totalViews: 45200,
      followersCount: 180,
    };

    render(<DashboardMetricsBar metrics={mockMetrics} />);

    expect(screen.getByText('Published Analyses')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Research Drafts')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('45,200')).toBeInTheDocument();

    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('180')).toBeInTheDocument();
  });

  it('renders dashes when isLoading is true', () => {
    const emptyMetrics = {
      totalAnalyses: 0,
      draftsCount: 0,
      totalViews: 0,
      followersCount: 0,
    };

    render(<DashboardMetricsBar metrics={emptyMetrics} isLoading={true} />);

    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(4);
  });
});
