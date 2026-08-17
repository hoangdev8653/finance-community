'use client';

import React, { useState } from 'react';
import { PublicProfile } from '@/types/users';
import { useUpdateProfile } from '@/lib/users/use-user-profile';
import { Button } from '@/components/ui/Button';
import { AvatarPicker } from '@/components/media/AvatarPicker';
import { X } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PublicProfile;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(
    profile.avatarMediaId || null
  );
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useUpdateProfile(profile.username);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.length > 100) {
      setError('Display name cannot exceed 100 characters.');
      return;
    }
    if (bio.length > 1000) {
      setError('Bio cannot exceed 1000 characters.');
      return;
    }

    try {
      setError(null);
      const payload: {
        displayName?: string;
        bio?: string;
        avatarMediaId?: string;
      } = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      if (avatarMediaId && avatarMediaId !== profile.avatarMediaId) {
        payload.avatarMediaId = avatarMediaId;
      }

      await updateMutation.mutateAsync(payload);
      onClose();
    } catch {
      setError('Failed to update profile. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="relative w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 id="edit-profile-title" className="font-serif text-lg font-bold text-foreground">
            Edit Analyst Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
              {error}
            </div>
          )}

          {/* Avatar Picker */}
          <AvatarPicker
            value={avatarMediaId}
            currentAvatarUrl={profile.avatarMediaId}
            onChange={setAvatarMediaId}
          />

          {/* Display Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="displayName" className="font-medium text-foreground">
                Display Name
              </label>
              <span className="font-mono text-muted-foreground">
                {displayName.length} / 100
              </span>
            </div>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Quantitative Macro Strategist"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="bio" className="font-medium text-foreground">
                Executive Bio
              </label>
              <span className="font-mono text-muted-foreground">
                {bio.length} / 1000
              </span>
            </div>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Detail your analytical focus, valuation frameworks, asset class specialization..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
