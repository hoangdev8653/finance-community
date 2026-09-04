'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  useChangeUserStatus,
  useAssignRole,
  useRevokeRole,
  useAdminUsers,
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
  LockKeyhole,
  ShieldPlus,
  ShieldMinus,
  Eye,
} from 'lucide-react';
import { AdminSearchInput } from './AdminSearchInput';
import { AdminPagination } from './AdminPagination';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { useToast } from '@/lib/toast/ToastContext';

export function UserManagementView() {
  const { user } = useAuth();
  const [targetUserId, setTargetUserId] = useState('');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [reason, setReason] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleName>('MODERATOR');
  const [confirmedDestructive, setConfirmedDestructive] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const debouncedSearch = useDebounce(userSearch, 350);
  const [userPage, setUserPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleName | 'ALL'>('ALL');
  const [providerFilter, setProviderFilter] = useState<'ALL' | 'LOCAL' | 'GOOGLE'>('ALL');
  const [pendingStatusAction, setPendingStatusAction] = useState<{ id: string; status: UserStatus; email: string } | null>(null);
  const [quickStatusReason, setQuickStatusReason] = useState('');

  useEffect(() => {
    setUserPage(1);
  }, [debouncedSearch]);

  const { data: usersResponse, isLoading: usersLoading } = useAdminUsers({ page: userPage, limit: DEFAULT_PAGE_SIZE, search: debouncedSearch || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter });

  const { toast } = useToast();
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
      const msg = 'Target User ID is required.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isSelf) {
      const msg = 'Administrators cannot modify their own account status.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isDestructive && !confirmedDestructive) {
      const msg = 'Please confirm the destructive status change checkbox.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    try {
      await changeStatusMutation.mutateAsync({
        id: trimmedId,
        dto: { status, reason: reason.trim() || undefined },
      });
      const msg = `User status successfully updated to '${status}'.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setConfirmedDestructive(false);
      setReason('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update user status.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const handleAssignRole = async () => {
    setFeedback(null);
    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      const msg = 'Target User ID is required.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isSelf) {
      const msg = 'Administrators cannot modify their own roles.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (
      (selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN') &&
      !isCallerSuperAdmin
    ) {
      const msg = `Only SUPER_ADMIN can assign '${selectedRole}' role.`;
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    try {
      await assignRoleMutation.mutateAsync({
        userId: trimmedId,
        roleName: selectedRole,
      });
      const msg = `Role '${selectedRole}' successfully assigned to user.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to assign role.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const handleRevokeRole = async () => {
    setFeedback(null);
    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      const msg = 'Target User ID is required.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isSelf) {
      const msg = 'Administrators cannot modify their own roles.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (
      (selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN') &&
      !isCallerSuperAdmin
    ) {
      const msg = `Only SUPER_ADMIN can revoke '${selectedRole}' role.`;
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    try {
      await revokeRoleMutation.mutateAsync({
        userId: trimmedId,
        roleName: selectedRole,
      });
      const msg = `Role '${selectedRole}' successfully revoked from user.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to revoke role.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const handleQuickStatus = async (id: string, nextStatus: UserStatus) => {
    if (user?.id === id) {
      const msg = 'Không thể thay đổi trạng thái tài khoản của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }
    const selected = usersResponse?.data.find((item) => item.id === id);
    if (nextStatus !== 'ACTIVE') {
      setPendingStatusAction({ id, status: nextStatus, email: selected?.email ?? id });
      setQuickStatusReason('');
      return;
    }
    try {
      await changeStatusMutation.mutateAsync({ id, dto: { status: nextStatus, reason: 'Admin quick action' } });
      const msg = `Đã chuyển tài khoản sang ${nextStatus}.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const confirmQuickStatus = async () => {
    if (!pendingStatusAction) return;
    try {
      await changeStatusMutation.mutateAsync({ id: pendingStatusAction.id, dto: { status: pendingStatusAction.status, reason: quickStatusReason.trim() || 'Admin quick action' } });
      const msg = `Đã chuyển tài khoản sang ${pendingStatusAction.status}.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setPendingStatusAction(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const handleQuickRole = async (id: string, action: 'assign' | 'revoke') => {
    if (user?.id === id) {
      const msg = 'Không thể thay đổi role của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }
    try {
      if (action === 'assign') await assignRoleMutation.mutateAsync({ userId: id, roleName: 'MODERATOR' });
      else await revokeRoleMutation.mutateAsync({ userId: id, roleName: 'MODERATOR' });
      const msg = action === 'assign' ? 'Đã gán role MODERATOR.' : 'Đã thu hồi role MODERATOR.';
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật role.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          User Account Governance & RBAC
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage user lifecycle states, suspend accounts, and assign governance roles.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface" aria-labelledby="admin-users-list">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="admin-users-list" className="font-heading text-base font-bold text-foreground">Danh sách người dùng</h3>
            <p className="text-xs text-muted-foreground">Chọn một user để thực hiện thao tác quản trị.</p>
          </div>
          <AdminSearchInput value={userSearch} onValueChange={setUserSearch} isLoading={usersLoading} placeholder="Tìm theo email, tên, username hoặc ID..." aria-label="Tìm kiếm user" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as UserStatus | 'ALL'); setUserPage(1); }} aria-label="Status filter" className="h-9 rounded-md border border-input bg-background px-3 text-xs">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="BANNED">BANNED</option>
            <option value="DEACTIVATED">DEACTIVATED</option>
          </select>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value as RoleName | 'ALL'); setUserPage(1); }} aria-label="Role filter" className="h-9 rounded-md border border-input bg-background px-3 text-xs">
            <option value="ALL">All roles</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <select value={providerFilter} onChange={e => { setProviderFilter(e.target.value as 'ALL' | 'LOCAL' | 'GOOGLE'); setUserPage(1); }} aria-label="Login method filter" className="h-9 rounded-md border border-input bg-background px-3 text-xs">
            <option value="ALL">All login methods</option>
            <option value="LOCAL">LOCAL</option>
            <option value="GOOGLE">GOOGLE</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Login method</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usersLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Đang tải user...</td></tr>
              ) : (usersResponse?.data ?? []).filter(item => (roleFilter === 'ALL' || item.roles.includes(roleFilter)) && (providerFilter === 'ALL' || item.provider === providerFilter)).map(item => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 font-semibold text-primary">
                        {item.avatarUrl ? <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" /> : (item.displayName || item.username || item.email).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{item.displayName || item.username || 'Chưa đặt tên'}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={item.provider === 'GOOGLE' ? 'rounded-md bg-blue-500/15 px-2 py-1 font-mono font-bold text-blue-400' : 'rounded-md bg-slate-500/15 px-2 py-1 font-mono font-bold text-slate-300'}>
                      {item.provider === 'GOOGLE' ? 'GOOGLE' : 'LOCAL'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(item.roles.length ? item.roles : ['MEMBER' as RoleName]).map(role => (
                        <span key={role} className={role === 'SUPER_ADMIN' ? 'rounded-md bg-red-500/15 px-2 py-1 font-mono text-[10px] font-bold text-red-400' : role === 'ADMIN' ? 'rounded-md bg-orange-500/15 px-2 py-1 font-mono text-[10px] font-bold text-orange-400' : role === 'MODERATOR' ? 'rounded-md bg-violet-500/15 px-2 py-1 font-mono text-[10px] font-bold text-violet-400' : 'rounded-md bg-slate-500/15 px-2 py-1 font-mono text-[10px] font-bold text-slate-300'}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={item.status === 'ACTIVE' ? 'rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 font-mono font-bold text-emerald-400' : item.status === 'SUSPENDED' ? 'rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-1 font-mono font-bold text-amber-400' : item.status === 'BANNED' ? 'rounded-md border border-red-500/30 bg-red-500/15 px-2 py-1 font-mono font-bold text-red-400' : 'rounded-md bg-slate-500/15 px-2 py-1 font-mono font-bold text-slate-400'}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => void handleQuickStatus(item.id, item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')} disabled={item.id === user?.id || changeStatusMutation.isPending} title={item.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} aria-label={item.status === 'ACTIVE' ? `Khóa tài khoản ${item.email}` : `Mở khóa tài khoản ${item.email}`} className="h-9 w-9 p-0 text-warning hover:bg-warning/10">
                        {item.status === 'ACTIVE' ? <LockKeyhole className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void handleQuickRole(item.id, item.roles.includes('MODERATOR') ? 'revoke' : 'assign')} disabled={item.id === user?.id || assignRoleMutation.isPending || revokeRoleMutation.isPending} title={item.roles.includes('MODERATOR') ? 'Thu hồi Moderator' : 'Gán Moderator'} aria-label={item.roles.includes('MODERATOR') ? `Thu hồi Moderator ${item.email}` : `Gán Moderator ${item.email}`} className="h-9 w-9 p-0 text-primary hover:bg-primary/10">
                        {item.roles.includes('MODERATOR') ? <ShieldMinus className="h-4 w-4" /> : <ShieldPlus className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setTargetUserId(item.id)} title="Xem chi tiết" aria-label={`Xem chi tiết ${item.email}`} className="h-9 w-9 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usersResponse?.meta && <AdminPagination meta={usersResponse.meta} itemLabel="user" pageLabel="Trang" onPageChange={setUserPage} />}
      </section>

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
      <div className="hidden rounded-lg border border-border bg-surface p-5 space-y-3">
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
          <div className="flex items-center gap-1 text-xs text-warning font-mono">
            <Lock className="h-3 w-3" />
            <span>You cannot modify your own administrator account.</span>
          </div>
        )}
      </div>

      {targetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl space-y-3 rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-foreground">Chi tiết quản trị người dùng</h3>
              <Button variant="ghost" size="sm" onClick={() => setTargetUserId('')}>
                Đóng
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status Form */}
        <form
          onSubmit={handleStatusSubmit}
          className="rounded-lg border border-border bg-surface p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <UserX className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-heading font-bold text-foreground">
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
              <p className="text-xs text-danger font-medium">
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
            <h3 className="text-sm font-heading font-bold text-foreground">
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
            <p className="text-xs text-muted-foreground italic font-mono pt-1">
              Note: Only SUPER_ADMIN accounts can grant or revoke ADMIN and SUPER_ADMIN roles.
            </p>
          )}
        </div>
      </div>
          </div>
        </div>
      )}

      {pendingStatusAction && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-confirm-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 id="status-confirm-title" className="font-heading text-lg font-bold text-foreground">
                  Xác nhận khóa tài khoản
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{pendingStatusAction.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPendingStatusAction(null)}>
                Đóng
              </Button>
            </div>
            <p className="mb-4 text-sm text-foreground">
              Tài khoản sẽ chuyển sang trạng thái <strong>{pendingStatusAction.status}</strong> và bị hạn chế truy cập.
            </p>
            <label className="block space-y-2 text-xs font-semibold text-foreground">
              <span>Lý do</span>
              <textarea
                value={quickStatusReason}
                onChange={(event) => setQuickStatusReason(event.target.value)}
                rows={3}
                placeholder="Nhập lý do xử lý..."
                className="w-full rounded-lg border border-border bg-background p-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingStatusAction(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => void confirmQuickStatus()}
                isLoading={changeStatusMutation.isPending}
              >
                Xác nhận khóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





