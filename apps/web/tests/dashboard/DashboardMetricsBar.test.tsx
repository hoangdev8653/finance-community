import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardMetricsBar } from '@/components/dashboard/DashboardMetricsBar';

describe('DashboardMetricsBar Component', () => {
  it('renders all KPI metric cards with formatted numbers', () => {
    const mockMetrics = {
      totalAnalyses: 12,
      draftsCount: 3,
      totalViews: 45200,
    };

    render(<DashboardMetricsBar metrics={mockMetrics} />);

    expect(screen.getByText('Bài viết đã đăng')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Bản thảo nghiên cứu')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Tổng lượt xem')).toBeInTheDocument();
    expect(screen.getByText('45,200')).toBeInTheDocument();

  });

  it('renders dashes when isLoading is true', () => {
    const emptyMetrics = {
      totalAnalyses: 0,
      draftsCount: 0,
      totalViews: 0,
    };

    render(<DashboardMetricsBar metrics={emptyMetrics} isLoading={true} />);

    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(3);
  });
});
