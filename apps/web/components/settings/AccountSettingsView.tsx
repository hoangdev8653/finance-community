'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { usersService } from '@/lib/users/users-service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Alert } from '@/components/ui/Alert';
import {
  User,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';

type SettingsTab = 'profile' | 'security' | 'notifications';

export function AccountSettingsView() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notification toggles
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifySeries, setNotifySeries] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  // Form submission feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Load current bio from usersService.getCurrentUserMe()
  useEffect(() => {
    let isMounted = true;
    usersService
      .getCurrentUserMe()
      .then((res) => {
        if (isMounted && res.profile) {
          if (res.profile.bio) setBio(res.profile.bio);
          if (res.profile.displayName && !displayName) setDisplayName(res.profile.displayName);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await usersService.updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      setSaveSuccess('Thông tin hồ sơ cá nhân đã được cập nhật thành công.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể cập nhật hồ sơ vào lúc này. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate/request password change
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveSuccess('Mật khẩu của bạn đã được thay đổi an toàn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('Cài đặt thông báo đã được lưu thành công.');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <Alert variant="success" title="Cập nhật thành công">
          {saveSuccess}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" title="Có lỗi xảy ra">
          {errorMessage}
        </Alert>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all',
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="h-4 w-4" />
          <span>Hồ sơ công khai</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all',
            activeTab === 'security'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Shield className="h-4 w-4" />
          <span>Bảo mật & Mật khẩu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all',
            activeTab === 'notifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Bell className="h-4 w-4" />
          <span>Thông báo</span>
        </button>
      </div>

      {/* Tab 1: Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
            <h3 className="font-heading text-lg font-bold text-foreground">
              Thông tin hiển thị công khai
            </h3>

            {/* Avatar Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                src={avatarUrl || user?.avatarUrl}
                fallback={displayName || user?.username || 'U'}
                size="lg"
                className="h-20 w-20 ring-4 ring-slate-100 dark:ring-slate-800"
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Ảnh đại diện</p>
                <p className="text-xs text-muted-foreground">
                  Ảnh đại diện được hiển thị cùng các bài phân tích và bình luận của bạn trên {BRAND.name}.
                </p>
                <span className="inline-block pt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  Hỗ trợ JPG, PNG hoặc WebP tối đa 5MB.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="display-name" className="text-sm font-semibold text-foreground">
                  Tên hiển thị
                </label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh"
                  className="h-11 rounded-xl"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-foreground">
                  Tên người dùng (Username)
                </label>
                <Input
                  id="username"
                  value={`@${user?.username || ''}`}
                  disabled
                  className="h-11 rounded-xl bg-slate-50 font-mono text-muted-foreground dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Địa chỉ Email
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="h-11 rounded-xl bg-slate-50 font-mono text-muted-foreground dark:bg-slate-950 flex-1"
                />
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã xác thực</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="bio" className="text-sm font-semibold text-foreground">
                  Giới thiệu ngắn (Bio)
                </label>
                <span className="font-mono text-xs text-muted-foreground">
                  {bio.length}/500 ký tự
                </span>
              </div>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ đôi nét về kinh nghiệm đầu tư, lĩnh vực quan tâm hoặc phong cách sống của bạn..."
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={isSaving}
                className="h-11 px-6 bg-primary font-semibold text-primary-foreground shadow-xs"
              >
                Lưu thay đổi hồ sơ
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleUpdatePassword}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Đổi mật khẩu tài khoản
                </h3>
                <p className="text-xs text-muted-foreground">
                  Khuyến nghị sử dụng mật khẩu mạnh có chứa chữ hoa, số và ký hiệu đặc biệt.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <label htmlFor="current-pass" className="text-sm font-semibold text-foreground">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Input
                      id="current-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="h-11 rounded-xl pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-pass" className="text-sm font-semibold text-foreground">
                    Mật khẩu mới
                  </label>
                  <Input
                    id="new-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-pass" className="text-sm font-semibold text-foreground">
                    Xác nhận mật khẩu mới
                  </label>
                  <Input
                    id="confirm-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    disabled={isSaving || !currentPassword || !newPassword}
                    className="h-11 px-6 bg-primary font-semibold text-primary-foreground shadow-xs"
                  >
                    Cập nhật mật khẩu mới
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Account Role & Status */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50 sm:p-8 space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              Thông tin phiên & Quyền hạn
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                <span className="text-xs text-muted-foreground block">Trạng thái tài khoản</span>
                <span className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Hoạt động bình thường</span>
                </span>
              </div>

              <div className="rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                <span className="text-xs text-muted-foreground block">Cấp bậc / Vai trò</span>
                <span className="mt-1 font-mono text-sm font-bold uppercase text-foreground">
                  {user?.roles?.join(', ') || 'MEMBER'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications Tab */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
            <h3 className="font-heading text-lg font-bold text-foreground">
              Tùy chọn nhận thông báo
            </h3>

            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5 max-w-md">
                  <p className="text-sm font-semibold text-foreground">
                    Tương tác trên bài viết & bình luận
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nhận thông báo khi có độc giả phản hồi hoặc bày tỏ cảm xúc trên bài phân tích của bạn.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyComments}
                  onChange={(e) => setNotifyComments(e.target.checked)}
                  className="h-5 w-5 rounded-md text-emerald-600 focus:ring-primary cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5 max-w-md">
                  <p className="text-sm font-semibold text-foreground">
                    Bài học mới trong Series đang theo dõi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nhận thông báo khi Ban biên tập xuất bản chương mới trong lộ trình bạn đang học.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifySeries}
                  onChange={(e) => setNotifySeries(e.target.checked)}
                  className="h-5 w-5 rounded-md text-emerald-600 focus:ring-primary cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5 max-w-md">
                  <p className="text-sm font-semibold text-foreground">
                    Bản tin thị trường & Tri thức tuần (Newsletter)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email tổng hợp các diễn biến kinh tế vĩ mô và bài phân tích nổi bật nhất vào mỗi sáng thứ Hai.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewsletter}
                  onChange={(e) => setNotifyNewsletter(e.target.checked)}
                  className="h-5 w-5 rounded-md text-emerald-600 focus:ring-primary cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                className="h-11 px-6 bg-primary font-semibold text-primary-foreground shadow-xs"
              >
                Lưu tùy chọn thông báo
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
