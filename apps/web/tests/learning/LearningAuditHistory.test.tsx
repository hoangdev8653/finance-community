import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LearningAuditHistory } from '@/components/learning/LearningAuditHistory';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock('@/lib/api/client', () => ({ apiClient: { get: getMock } }));

describe('LearningAuditHistory', () => {
  it('shows actor email from the persisted audit record', async () => {
    getMock.mockResolvedValueOnce({ data: [{ id: '1', action: 'LEARNING_STATUS_UPDATE', actorEmail: 'editor@example.com', createdAt: '2026-08-31T10:00:00.000Z' }] });
    render(<LearningAuditHistory postId="post-1" />);
    await waitFor(() => expect(screen.getByText(/editor@example.com/)).toBeInTheDocument());
  });

  it('falls back to actor id when email is unavailable', async () => {
    getMock.mockResolvedValueOnce({ data: [{ id: '2', action: 'LEARNING_SUBMIT_REVIEW', actor_id: 'user-1' }] });
    render(<LearningAuditHistory postId="post-2" />);
    await waitFor(() => expect(screen.getByText(/user-1/)).toBeInTheDocument());
  });
});
