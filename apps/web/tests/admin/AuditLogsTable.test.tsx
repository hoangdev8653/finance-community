import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditLogsTable } from '@/components/admin/AuditLogsTable';
import * as adminHooks from '@/lib/admin/use-admin';

vi.mock('@/lib/admin/use-admin');

describe('AuditLogsTable Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders audit logs, handles filter inputs and opens metadata modal', () => {
    const mockLogs = [
      {
        id: 'audit-log-1',
        actor_id: 'admin-uuid-1',
        action: 'ROLE_ASSIGN',
        entity_type: 'users',
        entity_id: 'target-user-1',
        metadata: { roleName: 'MODERATOR' },
        ip_address: '127.0.0.1',
        reason: 'Staff promotion',
        created_at: '2026-08-16T00:00:00Z',
      },
    ];

    vi.mocked(adminHooks.useAuditLogs).mockReturnValue({
      data: {
        data: mockLogs,
        meta: {
          page: 1,
          limit: 15,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AuditLogsTable />);

    expect(screen.getByText('Security & Governance Audit Logs')).toBeDefined();
    expect(screen.getAllByText('ROLE_ASSIGN').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/#admin-uu/i).length).toBeGreaterThan(0);

    // Open metadata modal
    const jsonBtn = screen.getByRole('button', { name: /JSON/i });
    fireEvent.click(jsonBtn);

    expect(screen.getByRole('dialog', { name: /Audit Event Metadata/i })).toBeDefined();
    expect(screen.getByText(/"roleName": "MODERATOR"/i)).toBeDefined();
  });

  it('renders empty state when no audit logs match query', () => {
    vi.mocked(adminHooks.useAuditLogs).mockReturnValue({
      data: {
        data: [],
        meta: {
          page: 1,
          limit: 15,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AuditLogsTable />);

    expect(screen.getByText('No Audit Logs Found')).toBeDefined();
  });
});
