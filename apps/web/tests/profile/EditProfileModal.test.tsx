import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { useUpdateProfile } from '@/lib/users/use-user-profile';
import { PublicProfile } from '@/types/users';

vi.mock('@/lib/users/use-user-profile', () => ({
  useUpdateProfile: vi.fn(),
}));

vi.mock('@/lib/media/use-media', () => ({
  useMediaDetail: () => ({ data: undefined }),
  useUploadMedia: () => ({ mutateAsync: vi.fn(), isPending: false, uploadProgress: 0 }),
}));

describe('EditProfileModal Component', () => {
  const mockProfile: PublicProfile = {
    id: 'p-1',
    userId: 'u-1',
    username: 'equity_analyst',
    displayName: 'Equity Strategist',
    avatarMediaId: null,
    bio: 'Valuation modeling.',
    createdAt: '2026-08-01T00:00:00Z',
  };

  it('renders inputs pre-filled with existing profile data and handles save', async () => {
    const mutateAsyncMock = vi.fn().mockResolvedValue(mockProfile);
    vi.mocked(useUpdateProfile).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as any);

    const onCloseMock = vi.fn();

    render(
      <EditProfileModal
        isOpen={true}
        onClose={onCloseMock}
        profile={mockProfile}
      />
    );

    const nameInput = screen.getByLabelText(/Display Name/i);
    const bioInput = screen.getByLabelText(/Executive Bio/i);

    expect((nameInput as HTMLInputElement).value).toBe('Equity Strategist');
    expect((bioInput as HTMLTextAreaElement).value).toBe('Valuation modeling.');

    fireEvent.change(nameInput, { target: { value: 'Senior Equity Strategist' } });
    fireEvent.change(bioInput, { target: { value: 'DCF and LBO valuation modeling.' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        displayName: 'Senior Equity Strategist',
        bio: 'DCF and LBO valuation modeling.',
      });
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <EditProfileModal
        isOpen={false}
        onClose={vi.fn()}
        profile={mockProfile}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
