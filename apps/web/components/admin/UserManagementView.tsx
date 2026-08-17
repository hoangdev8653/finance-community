'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  useChangeUserStatus,
  useAssignRole,
  useRevokeRole,
} from '@/lib/admin/use-admin';
import { UserStatus, RoleName } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function UserManagementView() {
  const { user } = useAuth();
  const [targetUserId, setTargetUserId] = useState('');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [reason, setReason] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleName>('MODERATOR');
  const [confirmedDestructive, setConfirmedDestructive] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const changeStatusMutation = useChangeUserStatus();
  const assignRoleMutation = useAssignRole();
  const revokeRoleMutation = useRevokeRole();

  const isCallerSuperAdmin = Boolean(
    user && user.roles && user.roles.includes('SUPER_ADMIN')
  );
  const isSelf = Boolean(user && user.id === targetUserId.trim());
  const isDestructive = status === 'BANNED' || status === 'DEACTIVATED';

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      setFeedback({ type: 'error', message: 'Target User ID is required.' });
      return;
    }

    if (isSelf) {
      setFeedback({
        type: 'error',
        message: 'Administrators cannot modify their own account status.',
      });
      return;
    }

    if (isDestructive && !confirmedDestructive) {
      setFeedback({
        type: 'error',
        message: 'Please confirm the destructive status change checkbox.',
      });
      return;
    }

    try {
      await changeStatusMutation.mutateAsync({
        id: trimmedId,
        dto: { status, reason: reason.trim() || undefined },
      });
      setFeedback({
        type: 'success',
        message: `User status successfully updated to '${status}'.`,
      });
      setConfirmedDestructive(false);
      setReason('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update user status.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleAssignRole = async () => {
    setFeedback(null);
    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      setFeedback({ type: 'error', message: 'Target User ID is required.' });
      return;
    }

    if (isSelf) {
      setFeedback({
        type: 'error',
        message: 'Administrators cannot modify their own roles.',
      });
      return;
    }

    if (
      (selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN') &&
      !isCallerSuperAdmin
    ) {
      setFeedback({
        type: 'error',
        message: `Only SUPER_ADMIN can assign '${selectedRole}' role.`,
      });
      return;
    }

    try {
      await assignRoleMutation.mutateAsync({
        userId: trimmedId,
        roleName: selectedRole,
      });
      setFeedback({
        type: 'success',
        message: `Role '${selectedRole}' successfully assigned to user.`,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to assign role.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleRevokeRole = async () => {
    setFeedback(null);
    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      setFeedback({ type: 'error', message: 'Target User ID is required.' });
      return;
    }

    if (isSelf) {
      setFeedback({
        type: 'error',
        message: 'Administrators cannot modify their own roles.',
      });
      return;
    }

    if (
      (selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN') &&
      !isCallerSuperAdmin
    ) {
      setFeedback({
        type: 'error',
        message: `Only SUPER_ADMIN can revoke '${selectedRole}' role.`,
      });
      return;
    }

    try {
      await revokeRoleMutation.mutateAsync({
        userId: trimmedId,
        roleName: selectedRole,
      });
      setFeedback({
        type: 'success',
        message: `Role '${selectedRole}' successfully revoked from user.`,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to revoke role.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          User Account Governance & RBAC
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage user lifecycle states, suspend accounts, and assign governance roles.
        </p>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs font-medium ${
            feedback.type === 'error'
              ? 'bg-danger/10 border-danger/20 text-danger'
              : 'bg-success/10 border-success/20 text-success'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Target User Identifier Card */}
      <div className="rounded-lg border border-border bg-surface p-5 space-y-3">
        <label
          htmlFor="target-user-id"
          className="text-xs font-semibold text-foreground flex items-center gap-1.5"
        >
          <span>Target User UUID</span>
          <span className="text-danger">*</span>
        </label>
        <input
          id="target-user-id"
          type="text"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
          className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
        />
        {isSelf && (
          <div className="flex items-center gap-1 text-2xs text-warning font-mono">
            <Lock className="h-3 w-3" />
            <span>You cannot modify your own administrator account.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status Form */}
        <form
          onSubmit={handleStatusSubmit}
          className="rounded-lg border border-border bg-surface p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <UserX className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-serif font-bold text-foreground">
              Account Status Management
            </h3>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="user-status-select"
              className="text-xs font-semibold text-foreground"
            >
              Set New Status
            </label>
            <select
              id="user-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BANNED">BANNED</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="status-reason"
              className="text-xs font-semibold text-foreground"
            >
              Audit Reason (Optional)
            </label>
            <textarea
              id="status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Reason for status change..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>

          {isDestructive && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-3 space-y-1.5">
              <p className="text-2xs text-danger font-medium">
                Warning: Banning or Deactivating a user immediately revokes platform access.
              </p>
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedDestructive}
                  onChange={(e) => setConfirmedDestructive(e.target.checked)}
                  className="rounded accent-danger"
                />
                <span>Confirm destructive status penalty</span>
              </label>
            </div>
          )}

          <Button
            type="submit"
            size="sm"
            variant={isDestructive ? 'destructive' : 'primary'}
            isLoading={changeStatusMutation.isPending}
            disabled={isSelf || !targetUserId.trim()}
            className="w-full"
          >
            Update Account Status
          </Button>
        </form>

        {/* RBAC Role Assignment */}
        <div className="rounded-lg border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <UserCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-serif font-bold text-foreground">
              Role Assignment & Revocation
            </h3>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="role-name-select"
              className="text-xs font-semibold text-foreground"
            >
              Select Role
            </label>
            <select
              id="role-name-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleName)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleAssignRole}
              isLoading={assignRoleMutation.isPending}
              disabled={isSelf || !targetUserId.trim()}
              className="flex-1"
            >
              Assign Role
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRevokeRole}
              isLoading={revokeRoleMutation.isPending}
              disabled={isSelf || !targetUserId.trim()}
              className="flex-1 text-danger hover:bg-danger/10"
            >
              Revoke Role
            </Button>
          </div>

          {!isCallerSuperAdmin && (
            <p className="text-2xs text-muted-foreground italic font-mono pt-1">
              Note: Only SUPER_ADMIN accounts can grant or revoke ADMIN and SUPER_ADMIN roles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
