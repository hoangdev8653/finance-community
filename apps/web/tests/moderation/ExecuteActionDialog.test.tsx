import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExecuteActionDialog } from '@/components/moderation/ExecuteActionDialog';
import * as moderationHooks from '@/lib/moderation/use-moderation';

vi.mock('@/lib/moderation/use-moderation');

describe('ExecuteActionDialog Component', () => {
  const mockExecuteAction = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockExecuteAction.mockReset();
    vi.mocked(moderationHooks.useExecuteModerationAction).mockReturnValue({
      mutateAsync: mockExecuteAction,
      isPending: false,
    } as any);
  });

  it('validates reason requirement and executes action', async () => {
    mockExecuteAction.mockResolvedValueOnce({ id: 'action-1' });

    const mockReport = {
      id: 'report-123',
      reporterId: 'user-1',
      reportedPostId: 'post-123',
      reportedCommentId: null,
      reportedUserId: null,
      reason: 'Spam',
      description: null,
      status: 'OPEN' as const,
      createdAt: '2026-08-16T00:00:00Z',
      resolvedAt: null,
    };

    const onClose = vi.fn();

    render(
      <ExecuteActionDialog
        isOpen={true}
        onClose={onClose}
        report={mockReport}
      />
    );

    const reasonInput = screen.getByLabelText(/Enforcement Justification/i);
    fireEvent.change(reasonInput, { target: { value: 'Content violates platform spam guidelines.' } });

    const submitBtn = screen.getByRole('button', { name: /Execute Action/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith({
        reportId: 'report-123',
        actionType: 'HIDE_CONTENT',
        reason: 'Content violates platform spam guidelines.',
      });
      expect(screen.getByText(/Moderation action 'HIDE_CONTENT' executed successfully/i)).toBeDefined();
    });
  });

  it('enforces destructive action confirmation checkbox for BAN or SUSPEND', async () => {
    const mockReport = {
      id: 'report-123',
      reporterId: 'user-1',
      reportedPostId: null,
      reportedCommentId: null,
      reportedUserId: 'user-to-ban',
      reason: 'Hostile harassment',
      description: null,
      status: 'OPEN' as const,
      createdAt: '2026-08-16T00:00:00Z',
      resolvedAt: null,
    };

    render(
      <ExecuteActionDialog
        isOpen={true}
        onClose={vi.fn()}
        report={mockReport}
      />
    );

    // Switch to BAN
    const select = screen.getByLabelText(/Action Type/i);
    fireEvent.change(select, { target: { value: 'BAN' } });

    const reasonInput = screen.getByLabelText(/Enforcement Justification/i);
    fireEvent.change(reasonInput, { target: { value: 'Persistent hostile harassment after repeated warnings.' } });

    const submitBtn = screen.getByRole('button', { name: /Execute Action/i });
    fireEvent.click(submitBtn);

    // Should require checkbox confirmation
    expect(screen.getByText(/Vui lòng xác nhận ô kiểm tra hành động quan trọng/i)).toBeDefined();
    expect(mockExecuteAction).not.toHaveBeenCalled();

    // Check confirmation checkbox
    const checkbox = screen.getByLabelText(/I confirm this penalty complies/i);
    fireEvent.click(checkbox);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith({
        reportId: 'report-123',
        actionType: 'BAN',
        reason: 'Persistent hostile harassment after repeated warnings.',
      });
    });
  });
});
