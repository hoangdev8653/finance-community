import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/lib/toast/ToastContext';
import { SystemSettingsView } from '@/components/admin/SystemSettingsView';
import * as adminHooks from '@/lib/admin/use-admin';

vi.mock('@/lib/admin/use-admin');

describe('SystemSettingsView Component', () => {
  const mockUpdateSetting = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockUpdateSetting.mockReset();

    vi.mocked(adminHooks.useUpdateSystemSetting).mockReturnValue({
      mutateAsync: mockUpdateSetting,
      isPending: false,
    } as any);
  });

  it('renders settings list, validates JSON, and updates setting', async () => {
    const mockSettings = [
      {
        id: '1',
        key: 'rate_limits',
        value: { max_requests_per_minute: 120 },
        description: 'Global API rate limits',
        updatedAt: '2026-08-16T00:00:00Z',
      },
    ];

    vi.mocked(adminHooks.useSystemSettings).mockReturnValue({
      data: mockSettings,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <ToastProvider>
        <SystemSettingsView />
      </ToastProvider>
    );

    expect(screen.getByText('rate_limits')).toBeDefined();
    expect(screen.getByText('Global API rate limits')).toBeDefined();

    // Click Edit
    const editBtn = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editBtn);

    const jsonTextarea = screen.getByLabelText(/JSON Configuration Payload/i);

    // Enter Invalid JSON
    fireEvent.change(jsonTextarea, { target: { value: '{ invalid_json ' } });
    const saveBtn = screen.getByRole('button', { name: /Save Configuration/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Invalid JSON format/i)).toBeDefined();
    expect(mockUpdateSetting).not.toHaveBeenCalled();

    // Enter Valid JSON
    const validJson = JSON.stringify({ max_requests_per_minute: 240 });
    fireEvent.change(jsonTextarea, { target: { value: validJson } });

    mockUpdateSetting.mockResolvedValueOnce({
      ...mockSettings[0],
      value: { max_requests_per_minute: 240 },
    });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateSetting).toHaveBeenCalledWith({
        key: 'rate_limits',
        dto: {
          value: { max_requests_per_minute: 240 },
          description: 'Global API rate limits',
        },
      });
      expect(screen.getByText(/System setting 'rate_limits' updated successfully/i)).toBeDefined();
    });
  });
});
