'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  useChangeUserStatus,
  useAssignRole,
  useRevokeRole,
  useAdminUsers,
  useAdminOverview,
} from '@/lib/admin/use-admin';
import { UserStatus, RoleName, AdminUserEntity } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast/ToastContext';
import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldPlus,
  ShieldMinus,
  Lock,
  LockKeyhole,
  Eye,
  Search,
  RefreshCw,
  X,
  Calendar,
  AlertTriangle,
  Mail,
  Shield,
  KeyRound,
} from 'lucide-react';
import { AdminSearchInput } from './AdminSearchInput';
import { AdminPagination } from './AdminPagination';

type FilterTab = 'ALL' | UserStatus;

interface StatusTabConfig {
  value: FilterTab;
  label: string;
}

const STATUS_TABS: StatusTabConfig[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'SUSPENDED', label: 'Tạm khóa' },
  { value: 'BANNED', label: 'Bị cấm' },
  { value: 'DEACTIVATED', label: 'Đã vô hiệu hóa' },
];

export function UserManagementView() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [targetUserId, setTargetUserId] = useState('');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [reason, setReason] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleName>('MODERATOR');
  const [confirmedDestructive, setConfirmedDestructive] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleName | 'ALL'>('ALL');
  const [providerFilter, setProviderFilter] = useState<'ALL' | 'LOCAL' | 'GOOGLE'>('ALL');
  const [pendingStatusAction, setPendingStatusAction] = useState<{
    id: string;
    status: UserStatus;
    email: string;
  } | null>(null);
  const [quickStatusReason, setQuickStatusReason] = useState('');

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(userSearch);
      setUserPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [userSearch]);

  const {
    data: usersResponse,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useAdminUsers({
    page: userPage,
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const overviewQuery = typeof useAdminOverview === 'function' ? useAdminOverview() : undefined;
  const overviewData = overviewQuery?.data;

  const changeStatusMutation = useChangeUserStatus();
  const assignRoleMutation = useAssignRole();
  const revokeRoleMutation = useRevokeRole();

  const isCallerSuperAdmin = Boolean(
    user && user.roles && user.roles.includes('SUPER_ADMIN')
  );
  const isSelf = Boolean(user && user.id === targetUserId.trim());
  const isDestructive = status === 'BANNED' || status === 'DEACTIVATED';

  const userList: AdminUserEntity[] = usersResponse?.data ?? [];

  // Filtered users for role and provider
  const filteredUsers = useMemo(() => {
    return userList.filter((item) => {
      const matchRole = roleFilter === 'ALL' || item.roles.includes(roleFilter);
      const matchProvider = providerFilter === 'ALL' || item.provider === providerFilter;
      return matchRole && matchProvider;
    });
  }, [userList, roleFilter, providerFilter]);

  // Compute 5 Metric KPI stats
  const stats = useMemo(() => {
    const total = usersResponse?.meta?.totalItems ?? userList.length;
    const active =
      overviewData?.userStatusBreakdown?.active ??
      userList.filter((u) => u.status === 'ACTIVE').length;
    const suspended =
      overviewData?.userStatusBreakdown?.suspended ??
      userList.filter((u) => u.status === 'SUSPENDED').length;
    const banned = userList.filter((u) => u.status === 'BANNED' || u.status === 'DEACTIVATED').length;
    const staff = userList.filter((u) =>
      u.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN' || r === 'MODERATOR')
    ).length;

    return [
      {
        label: 'Tổng người dùng',
        value: total,
        icon: Users,
        iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        label: 'Đang hoạt động',
        value: active,
        icon: CheckCircle2,
        iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        label: 'Tạm khóa',
        value: suspended,
        icon: Clock3,
        iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
      {
        label: 'Bị cấm / Vô hiệu',
        value: banned,
        icon: UserX,
        iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      },
      {
        label: 'Ban điều hành & Mod',
        value: staff,
        icon: ShieldCheck,
        iconWrap: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      },
    ];
  }, [usersResponse, userList, overviewData]);

  // Calculate count for status tabs
  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      ALL: usersResponse?.meta?.totalItems ?? userList.length,
      ACTIVE: 0,
      SUSPENDED: 0,
      BANNED: 0,
      DEACTIVATED: 0,
    };
    for (const u of userList) {
      if (counts[u.status] !== undefined) {
        counts[u.status] += 1;
      }
    }
    return counts;
  }, [usersResponse, userList]);

  // Submit status update in Detail Modal
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      const msg = 'Mã định danh User ID không được để trống.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isSelf) {
      const msg = 'Quản trị viên không thể tự thay đổi trạng thái tài khoản của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isDestructive && !confirmedDestructive) {
      const msg = 'Vui lòng đánh dấu xác nhận hình phạt thay đổi trạng thái quan trọng.';
      setFeedback({ type: 'error', message: msg });
      toast.warning(msg);
      return;
    }

    try {
      await changeStatusMutation.mutateAsync({
        id: trimmedId,
        dto: { status, reason: reason.trim() || undefined },
      });
      const msg = `Đã cập nhật trạng thái tài khoản thành '${status}'.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setConfirmedDestructive(false);
      setReason('');
      void refetchUsers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái người dùng.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  // Assign Role in Detail Modal
  const handleAssignRole = async () => {
    setFeedback(null);
    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      const msg = 'Mã định danh User ID không được để trống.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isSelf) {
      const msg = 'Quản trị viên không thể tự thay đổi vai trò của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (
      (selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN') &&
      !isCallerSuperAdmin
    ) {
      const msg = `Chỉ Quản trị cấp cao (SUPER_ADMIN) mới có quyền gán vai trò '${selectedRole}'.`;
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    try {
      await assignRoleMutation.mutateAsync({
        userId: trimmedId,
        roleName: selectedRole,
      });
      const msg = `Đã gán vai trò '${selectedRole}' cho người dùng thành công.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      void refetchUsers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể gán vai trò.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  // Revoke Role in Detail Modal
  const handleRevokeRole = async () => {
    setFeedback(null);
    const trimmedId = targetUserId.trim();
    if (!trimmedId) {
      const msg = 'Mã định danh User ID không được để trống.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (isSelf) {
      const msg = 'Quản trị viên không thể tự thay đổi vai trò của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (
      (selectedRole === 'SUPER_ADMIN' || selectedRole === 'ADMIN') &&
      !isCallerSuperAdmin
    ) {
      const msg = `Chỉ Quản trị cấp cao (SUPER_ADMIN) mới có quyền thu hồi vai trò '${selectedRole}'.`;
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    try {
      await revokeRoleMutation.mutateAsync({
        userId: trimmedId,
        roleName: selectedRole,
      });
      const msg = `Đã thu hồi vai trò '${selectedRole}' khỏi người dùng thành công.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      void refetchUsers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể thu hồi vai trò.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  // Quick Lock / Unlock Status Toggle
  const handleQuickStatus = async (id: string, nextStatus: UserStatus) => {
    if (user?.id === id) {
      const msg = 'Không thể thay đổi trạng thái tài khoản của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }
    const selected = userList.find((item) => item.id === id);
    if (nextStatus !== 'ACTIVE') {
      setPendingStatusAction({ id, status: nextStatus, email: selected?.email ?? id });
      setQuickStatusReason('');
      return;
    }
    try {
      await changeStatusMutation.mutateAsync({
        id,
        dto: { status: nextStatus, reason: 'Admin quick action' },
      });
      const msg = `Đã mở khóa tài khoản thành công.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      void refetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  // Confirm Quick Status Action
  const confirmQuickStatus = async () => {
    if (!pendingStatusAction) return;
    try {
      await changeStatusMutation.mutateAsync({
        id: pendingStatusAction.id,
        dto: {
          status: pendingStatusAction.status,
          reason: quickStatusReason.trim() || 'Admin quick action',
        },
      });
      const msg = `Đã chuyển tài khoản sang trạng thái ${pendingStatusAction.status}.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setPendingStatusAction(null);
      void refetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  // Quick Role Toggle for Moderator
  const handleQuickRole = async (id: string, action: 'assign' | 'revoke') => {
    if (user?.id === id) {
      const msg = 'Không thể thay đổi vai trò của chính mình.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }
    try {
      if (action === 'assign') {
        await assignRoleMutation.mutateAsync({ userId: id, roleName: 'MODERATOR' });
        toast.success('Đã cấp quyền Điều hành viên (MODERATOR).');
      } else {
        await revokeRoleMutation.mutateAsync({ userId: id, roleName: 'MODERATOR' });
        toast.success('Đã thu hồi quyền Điều hành viên (MODERATOR).');
      }
      setFeedback({
        type: 'success',
        message: action === 'assign' ? 'Đã gán vai trò MODERATOR.' : 'Đã thu hồi vai trò MODERATOR.',
      });
      void refetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật vai trò.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  // Render role badge helper
  const renderRoleBadge = (role: RoleName) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-300"
          >
            SUPER ADMIN
          </span>
        );
      case 'ADMIN':
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-full border border-orange-200/70 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-300"
          >
            ADMIN
          </span>
        );
      case 'MODERATOR':
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-full border border-blue-200/70 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-300"
          >
            MODERATOR
          </span>
        );
      default:
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            MEMBER
          </span>
        );
    }
  };

  // Render status badge helper
  const renderStatusBadge = (userStatus: UserStatus) => {
    switch (userStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            Đang hoạt động
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            Tạm khóa
          </span>
        );
      case 'BANNED':
        return (
          <span className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            Bị cấm
          </span>
        );
      case 'DEACTIVATED':
        return (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Đã vô hiệu hóa
          </span>
        );
    }
  };

  const targetUser = userList.find((u) => u.id === targetUserId);

  return (
    <div className="admin-user-surface space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý danh sách tài khoản, trạng thái truy cập, cấp phát vai trò và phân quyền trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetchUsers()}
            disabled={usersLoading}
            className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold text-foreground shadow-2xs hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* 2. 5 Metric Summary KPI Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-border/80 dark:bg-card"
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] ${stat.iconWrap}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stat.value.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-2 rounded-lg border p-3.5 text-xs font-medium ${
            feedback.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Main Content Container: Tabs + Filter Toolbar + Table */}
      <section
        className="overflow-hidden rounded-[10px] border border-slate-200/60 bg-white shadow-xs dark:border-border/60 dark:bg-card"
        aria-labelledby="admin-users-list"
      >
        {/* Horizontal Status Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-card px-2 sm:px-4 dark:border-border/40">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count = tabCounts[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setUserPage(1);
                }}
                className={`relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)] lg:items-center dark:border-border/40">
          {/* Smart Search */}
          <div className="relative min-w-0">
            <AdminSearchInput
              value={userSearch}
              onValueChange={setUserSearch}
              placeholder="Email, tên hoặc username..."
              aria-label="Tìm kiếm user"
            />
          </div>

          {/* Role Filter */}
          <div className="relative min-w-0">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as RoleName | 'ALL');
                setUserPage(1);
              }}
              aria-label="Role filter"
              className="h-10 w-full appearance-none rounded-lg border border-slate-200/80 bg-background py-1.5 pl-3 pr-8 text-sm font-medium text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="MEMBER">Thành viên (Member)</option>
              <option value="MODERATOR">Điều hành viên (Moderator)</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
              <option value="SUPER_ADMIN">Quản trị cấp cao (Super Admin)</option>
            </select>
            <Shield className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Login Provider Filter */}
          <div className="relative min-w-0">
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value as 'ALL' | 'LOCAL' | 'GOOGLE');
                setUserPage(1);
              }}
              aria-label="Login method filter"
              className="h-10 w-full appearance-none rounded-lg border border-slate-200/80 bg-background py-1.5 pl-3 pr-8 text-sm font-medium text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-border/60"
            >
              <option value="ALL">Mọi phương thức đăng nhập</option>
              <option value="LOCAL">Tài khoản nội bộ (Local)</option>
              <option value="GOOGLE">Google OAuth</option>
            </select>
            <KeyRound className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:border-border/40 dark:bg-muted/10">
              <tr>
                <th className="px-4 py-3.5">Người dùng</th>
                <th className="px-4 py-3.5">Đăng nhập</th>
                <th className="px-4 py-3.5">Vai trò</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Ngày tạo</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border/40">
              {usersLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                      <span>Đang đồng bộ dữ liệu người dùng…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted/60 text-muted-foreground">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="mt-2 font-heading text-base font-semibold text-foreground">
                        Không tìm thấy người dùng nào
                      </p>
                      <p className="max-w-md text-xs text-muted-foreground">
                        Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc vai trò, trạng thái.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* User info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200/60 bg-emerald-50 font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (item.displayName || item.username || item.email).slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {item.displayName || item.username || 'Chưa có tên'}
                          </p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          item.provider === 'GOOGLE'
                            ? 'border border-blue-200/80 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.provider === 'GOOGLE' ? 'GOOGLE' : 'LOCAL'}
                      </span>
                    </td>

                    {/* Roles */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(item.roles?.length ? item.roles : (['MEMBER' as RoleName])).map(
                          (role) => renderRoleBadge(role)
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">{renderStatusBadge(item.status)}</td>

                    {/* Created Date */}
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void handleQuickStatus(
                              item.id,
                              item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                            )
                          }
                          disabled={item.id === user?.id || changeStatusMutation.isPending}
                          title={
                            item.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
                          }
                          aria-label={
                            item.status === 'ACTIVE'
                              ? `Khóa tài khoản ${item.email}`
                              : `Mở khóa tài khoản ${item.email}`
                          }
                          className="h-9 w-9 rounded-lg border border-slate-200/70 bg-card p-0 text-amber-600 shadow-2xs hover:bg-amber-50 dark:border-border/50 dark:hover:bg-amber-950/40"
                        >
                          {item.status === 'ACTIVE' ? (
                            <LockKeyhole className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void handleQuickRole(
                              item.id,
                              item.roles.includes('MODERATOR') ? 'revoke' : 'assign'
                            )
                          }
                          disabled={
                            item.id === user?.id ||
                            assignRoleMutation.isPending ||
                            revokeRoleMutation.isPending
                          }
                          title={
                            item.roles.includes('MODERATOR')
                              ? 'Thu hồi Moderator'
                              : 'Gán Moderator'
                          }
                          aria-label={
                            item.roles.includes('MODERATOR')
                              ? `Thu hồi Moderator ${item.email}`
                              : `Gán Moderator ${item.email}`
                          }
                          className="h-9 w-9 rounded-lg border border-slate-200/70 bg-card p-0 text-emerald-600 shadow-2xs hover:bg-emerald-50 dark:border-border/50 dark:hover:bg-emerald-950/40"
                        >
                          {item.roles.includes('MODERATOR') ? (
                            <ShieldMinus className="h-4 w-4" />
                          ) : (
                            <ShieldPlus className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTargetUserId(item.id)}
                          title="Xem chi tiết & phân quyền"
                          aria-label={`Xem chi tiết ${item.email}`}
                          className="h-9 w-9 rounded-lg p-0 text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {usersResponse?.meta && (
          <AdminPagination
            meta={usersResponse.meta}
            itemLabel="người dùng"
            pageLabel="Trang"
            onPageChange={setUserPage}
          />
        )}
      </section>

      {/* 4. Target User Detail & RBAC Modal */}
      {targetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl space-y-4 rounded-[10px] border border-border bg-card p-6 text-foreground shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Chi tiết quản trị & Phân quyền người dùng
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  {targetUser?.email || targetUserId} · UUID: {targetUserId}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTargetUserId('')}
                className="h-9 w-9 rounded-lg p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content: 2 Forms Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Form 1: Quản lý trạng thái tài khoản */}
              <form
                onSubmit={handleStatusSubmit}
                className="rounded-[10px] border border-border bg-muted/20 p-5 space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <UserX className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-heading font-bold text-foreground">
                    Quản lý trạng thái tài khoản
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="user-status-select"
                    className="text-xs font-semibold text-foreground"
                  >
                    Chọn trạng thái mới
                  </label>
                  <select
                    id="user-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                    <option value="SUSPENDED">SUSPENDED (Tạm khóa)</option>
                    <option value="BANNED">BANNED (Bị cấm vĩnh viễn)</option>
                    <option value="DEACTIVATED">DEACTIVATED (Đã vô hiệu hóa)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="status-reason"
                    className="text-xs font-semibold text-foreground"
                  >
                    Lý do ghi nhận kiểm toán (Tùy chọn)
                  </label>
                  <textarea
                    id="status-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="Nhập lý do thay đổi trạng thái..."
                    className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 resize-y"
                  />
                </div>

                {isDestructive && (
                  <div className="rounded-md border border-rose-200/80 bg-rose-50 p-3 space-y-1.5 dark:border-rose-900/50 dark:bg-rose-950/40">
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Cảnh báo: Cấm hoặc vô hiệu hóa tài khoản sẽ ngay lập tức thu hồi toàn bộ quyền truy cập nền tảng.</span>
                    </p>
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={confirmedDestructive}
                        onChange={(e) => setConfirmedDestructive(e.target.checked)}
                        className="rounded accent-rose-600"
                      />
                      <span>Xác nhận áp dụng hình phạt thay đổi trạng thái quan trọng</span>
                    </label>
                  </div>
                )}

                <Button
                  type="submit"
                  size="sm"
                  variant={isDestructive ? 'destructive' : 'primary'}
                  isLoading={changeStatusMutation.isPending}
                  disabled={isSelf || !targetUserId.trim()}
                  className="w-full h-10 rounded-lg text-sm font-semibold"
                >
                  Cập nhật trạng thái tài khoản
                </Button>
              </form>

              {/* Form 2: Phân quyền & Vai trò RBAC */}
              <div className="rounded-[10px] border border-border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-heading font-bold text-foreground">
                    Phân quyền & Cấp phát vai trò (RBAC)
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="role-name-select"
                    className="text-xs font-semibold text-foreground"
                  >
                    Chọn vai trò thao tác
                  </label>
                  <select
                    id="role-name-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleName)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    <option value="MEMBER">MEMBER (Thành viên chuẩn)</option>
                    <option value="MODERATOR">MODERATOR (Điều hành viên)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Quản trị cấp cao)</option>
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
                    className="flex-1 h-10 rounded-lg text-sm font-semibold"
                  >
                    Gán vai trò
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRevokeRole}
                    isLoading={revokeRoleMutation.isPending}
                    disabled={isSelf || !targetUserId.trim()}
                    className="flex-1 h-10 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Thu hồi vai trò
                  </Button>
                </div>

                {!isCallerSuperAdmin && (
                  <p className="text-xs text-muted-foreground italic pt-2">
                    Lưu ý: Chỉ tài khoản Quản trị cấp cao (SUPER_ADMIN) mới có quyền cấp hoặc thu hồi vai trò ADMIN và SUPER_ADMIN.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick Status Lock Confirmation Dialog */}
      {pendingStatusAction && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-confirm-title"
        >
          <div className="w-full max-w-md rounded-[10px] border border-border bg-card p-6 text-foreground shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 id="status-confirm-title" className="font-heading text-lg font-bold text-foreground">
                  Xác nhận khóa tài khoản
                </h3>
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  {pendingStatusAction.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingStatusAction(null)}
                className="h-8 w-8 rounded-lg p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mb-4 text-sm text-foreground">
              Tài khoản sẽ chuyển sang trạng thái <strong>{pendingStatusAction.status}</strong> và bị hạn chế quyền truy cập hệ thống.
            </p>

            <label className="block space-y-2 text-xs font-semibold text-foreground">
              <span>Lý do xử lý</span>
              <textarea
                value={quickStatusReason}
                onChange={(event) => setQuickStatusReason(event.target.value)}
                rows={3}
                placeholder="Nhập lý do xử lý..."
                className="w-full rounded-lg border border-border bg-background p-3 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
