import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportModal } from '@/components/moderation/ReportModal';
import * as moderationHooks from '@/lib/moderation/use-moderation';

vi.mock('@/lib/moderation/use-moderation');

describe('ReportModal Component', () => {
  const mockFileReport = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(moderationHooks.useFileReport).mockReturnValue({
      mutateAsync: mockFileReport,
      isPending: false,
    } as any);
  });

  it('renders reason options, character counter, and handles report submission', async () => {
    mockFileReport.mockResolvedValueOnce({
      report: { id: 'report-1' },
      isDuplicate: false,
    });

    const onClose = vi.fn();

    render(
      <ReportModal
        isOpen={true}
        onClose={onClose}
        targetType="POST"
        targetId="post-uuid-99"
        targetTitle="Macro Valuation Analysis"
      />
    );

    expect(screen.getByText('Report Post')).toBeDefined();
    expect(screen.getByText(/"Macro Valuation Analysis"/i)).toBeDefined();

    // Select reason
    const spamOption = screen.getByLabelText(/Spam or Commercial Promotion/i);
    fireEvent.click(spamOption);

    // Enter optional description
    const descInput = screen.getByLabelText(/Additional Context/i);
    fireEvent.change(descInput, { target: { value: 'Contains repetitive telegram promo links.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFileReport).toHaveBeenCalledWith({
        reportedPostId: 'post-uuid-99',
        reason: 'Spam or Commercial Promotion',
        description: 'Contains repetitive telegram promo links.',
      });
      expect(screen.getByText(/Report submitted successfully/i)).toBeDefined();
    });
  });

  it('displays duplicate message when report is duplicate', async () => {
    mockFileReport.mockResolvedValueOnce({
      report: { id: 'report-1' },
      isDuplicate: true,
    });

    render(
      <ReportModal
        isOpen={true}
        onClose={vi.fn()}
        targetType="USER"
        targetId="user-uuid-10"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/You have already filed an active report/i)).toBeDefined();
    });
  });
});
