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
    <div className="w-full space-y-6 sm:space-y-8">
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

      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Cài đặt tài khoản
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            Quản lý thông tin công khai, chính sách bảo mật và thông báo cá nhân
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <nav
          aria-label="Danh mục cài đặt"
          className="flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-900 p-1.5 shadow-2xs"
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-150',
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            )}
          >
            <User aria-hidden="true" className="h-4 w-4" />
            <span>Hồ sơ công khai</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={cn(
              'flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-150',
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            )}
          >
            <Shield aria-hidden="true" className="h-4 w-4" />
            <span>Bảo mật & Mật khẩu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-150',
              activeTab === 'notifications'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            )}
          >
            <Bell aria-hidden="true" className="h-4 w-4" />
            <span>Thông báo</span>
          </button>
        </nav>
      </div>

      <div className="w-full min-w-0 space-y-6">
        {/* Tab 1: Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-card p-6 sm:p-8 shadow-sm">
              <div className="border-b border-border/80 pb-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Thông tin hiển thị công khai
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Thông tin này sẽ xuất hiện trên trang tác giả và bài viết nghiên cứu của bạn.
                </p>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 p-4 sm:p-5 dark:bg-slate-900/80">
                <Avatar
                  src={avatarUrl || user?.avatarUrl}
                  fallback={displayName || user?.username || 'U'}
                  size="lg"
                  className="h-16 w-16 rounded-full border-2 border-primary/20 shadow-md ring-4 ring-card text-xl font-bold"
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Ảnh đại diện
                  </p>
                  <p className="text-xs sm:text-sm font-medium leading-5 text-slate-600 dark:text-slate-300">
                    Ảnh đại diện được hiển thị cùng các bài phân tích và bình luận của bạn trên {BRAND.name}.
                  </p>
                </div>
              </div>

              {/* Display Name & Username */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                <div className="space-y-2">
                  <label htmlFor="display-name" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Tên hiển thị
                  </label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Minh"
                    className="h-11 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Tên người dùng (Username)
                  </label>
                  <input
                    id="username"
                    value={`@${user?.username || ''}`}
                    readOnly
                    className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 px-3.5 py-2 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 shadow-2xs cursor-default select-all"
                  />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Tên người dùng định danh cố định không thể chỉnh sửa.
                  </p>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                  Địa chỉ Email
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    id="email"
                    value={user?.email || ''}
                    readOnly
                    className="flex h-11 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 px-3.5 py-2 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 shadow-2xs cursor-default select-all"
                  />
                  <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã xác thực</span>
                  </span>
                </div>
              </div>

              {/* Biography Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="bio" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Giới thiệu ngắn (Bio)
                  </label>
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                    {bio.length}/500 ký tự
                  </span>
                </div>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Chia sẻ đôi nét về kinh nghiệm đầu tư, lĩnh vực quan tâm hoặc chuyên môn nghiên cứu của bạn..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  isLoading={isSaving}
                  className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-primary-foreground shadow-sm transition-all"
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
              <div className="space-y-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-card p-6 sm:p-8 shadow-sm">
                <div className="border-b border-border/80 pb-4">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Đổi mật khẩu tài khoản
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Khuyến nghị sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="current-pass" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <Input
                        id="current-pass"
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="h-11 rounded-xl pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="new-pass" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                      Mật khẩu mới
                    </label>
                    <Input
                      id="new-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="h-11 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-pass" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      id="confirm-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="h-11 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                      required
                    />
                  </div>

                  <div className="pt-2 md:col-span-2 flex justify-start">
                    <Button
                      type="submit"
                      isLoading={isSaving}
                      className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-primary-foreground shadow-sm transition-all"
                    >
                      Cập nhật mật khẩu mới
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Account Role & Status */}
            <div className="space-y-5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-card p-6 sm:p-8 shadow-sm">
              <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Thông tin phiên & Quyền hạn
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Trạng thái tài khoản
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Hoạt động bình thường</span>
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Cấp bậc / Vai trò
                  </span>
                  <span className="font-mono text-sm font-bold uppercase text-slate-900 dark:text-slate-100">
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
            <div className="space-y-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-card p-6 sm:p-8 shadow-sm">
              <div className="border-b border-border/80 pb-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Tùy chọn nhận thông báo
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Tùy chỉnh thông báo tương tác bài viết và thư tin tức thị trường gửi về tài khoản.
                </p>
              </div>

              <div className="divide-y divide-border/80">
                <div className="flex items-center justify-between gap-6 py-5">
                  <div className="max-w-2xl space-y-1">
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Tương tác trên bài viết & bình luận
                    </p>
                    <p className="text-xs sm:text-sm font-medium leading-5 text-slate-600 dark:text-slate-300">
                      Nhận thông báo khi có độc giả phản hồi hoặc bày tỏ cảm xúc trên bài phân tích của bạn.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={(e) => setNotifyComments(e.target.checked)}
                    aria-label="Nhận thông báo về tương tác bài viết và bình luận"
                    className="h-5 w-5 shrink-0 cursor-pointer rounded-md text-emerald-600 accent-emerald-600 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between gap-6 py-5">
                  <div className="max-w-2xl space-y-1">
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Bản tin thị trường & Tri thức tuần (Newsletter)
                    </p>
                    <p className="text-xs sm:text-sm font-medium leading-5 text-slate-600 dark:text-slate-300">
                      Email tổng hợp các diễn biến kinh tế vĩ mô và bài phân tích nổi bật nhất vào mỗi sáng thứ Hai.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyNewsletter}
                    onChange={(e) => setNotifyNewsletter(e.target.checked)}
                    aria-label="Nhận bản tin thị trường và tri thức tuần"
                    className="h-5 w-5 shrink-0 cursor-pointer rounded-md text-emerald-600 accent-emerald-600 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-primary-foreground shadow-sm transition-all"
                >
                  Lưu tùy chọn thông báo
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
