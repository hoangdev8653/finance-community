'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useSystemSettings,
  useUpdateSystemSetting,
  useAdminFeatureFlags,
  useToggleFeatureFlag,
} from '@/lib/admin/use-admin';
import { SystemSettingEntity, FeatureFlagEntity } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import {
  Sliders,
  AlertCircle,
  CheckCircle2,
  Save,
  RotateCcw,
  Globe,
  MessageSquare,
  BookOpen,
  Flag,
  Code,
  ShieldAlert,
  Loader2,
  Check,
  Edit3,
  X,
  Database,
  Radio,
} from 'lucide-react';
import { useToast } from '@/lib/toast/ToastContext';
import { BRAND } from '@/lib/constants/brand';

type ActiveTab = 'GENERAL' | 'COMMUNITY' | 'LEARNING' | 'FEATURES' | 'ADVANCED';

export function SystemSettingsView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('GENERAL');

  const { data: settings = [], isLoading, isError, refetch } = useSystemSettings();
  const updateSettingMutation = useUpdateSystemSetting();

  const flagsResult = useAdminFeatureFlags();
  const featureFlags = flagsResult?.data || [];
  const isFlagsLoading = Boolean(flagsResult?.isLoading);
  const toggleFlagMutation = useToggleFeatureFlag();

  // 1. General Settings State
  const [generalConfig, setGeneralConfig] = useState<{
    platformName: string;
    platformSlogan: string;
    supportEmail: string;
    hotline: string;
    communityTelegram: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  }>({
    platformName: BRAND.name,
    platformSlogan: BRAND.sloganShort,
    supportEmail: BRAND.emails.support,
    hotline: '1900 6868',
    communityTelegram: 'https://t.me/brewseven',
    maintenanceMode: false,
    maintenanceMessage:
      'Hệ thống đang tiến hành bảo trì nâng cấp định kỳ. Chúng tôi sẽ trở lại trong ít phút.',
  });

  // 2. Community & Moderation State
  const [communityConfig, setCommunityConfig] = useState({
    moderationMode: 'AUTO' as 'AUTO' | 'PRE_MODERATION',
    postCooldownMinutes: 5,
    commentCooldownSeconds: 30,
    dailyPostLimitNewUsers: 3,
    bannedKeywords:
      'lừa đảo, cam kết lãi khủng, ủy thác đầu tư, nạp tiền gấp, đa cấp biến tướng, spam link rác',
  });

  // 3. Learning & Financial Data State
  const [learningConfig, setLearningConfig] = useState({
    allowGuestLessonPreview: true,
    enableLessonDiscussions: true,
    autoSaveLearningProgress: true,
    marketDataProvider: 'VNSTOCK' as 'VNSTOCK' | 'SSI' | 'VIETCAP',
    dataRefreshFrequency: '15_MINUTES' as 'REALTIME' | '15_MINUTES' | '30_MINUTES' | 'EOD',
  });

  // 4. Raw JSON Editor State (Advanced Tab)
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync settings from server if available
  useEffect(() => {
    if (settings && settings.length > 0) {
      const gen = settings.find((s) => s.key === 'general_config');
      if (gen?.value) setGeneralConfig((prev) => ({ ...prev, ...gen.value }));

      const com = settings.find((s) => s.key === 'community_moderation');
      if (com?.value) setCommunityConfig((prev) => ({ ...prev, ...com.value }));

      const lrn = settings.find((s) => s.key === 'learning_data');
      if (lrn?.value) setLearningConfig((prev) => ({ ...prev, ...lrn.value }));
    }
  }, [settings]);

  // Save current active tab configuration
  const handleSaveTabConfig = async () => {
    try {
      if (activeTab === 'GENERAL') {
        await updateSettingMutation.mutateAsync({
          key: 'general_config',
          dto: {
            value: generalConfig,
            description: 'Cấu hình thông tin chung & thương hiệu nền tảng',
          },
        });
        toast.success('Đã lưu cấu hình chung & thương hiệu thành công.');
      } else if (activeTab === 'COMMUNITY') {
        await updateSettingMutation.mutateAsync({
          key: 'community_moderation',
          dto: {
            value: communityConfig,
            description: 'Quy tắc duyệt bài và thông số chống spam cộng đồng',
          },
        });
        toast.success('Đã lưu cấu hình kiểm duyệt & cộng đồng thành công.');
      } else if (activeTab === 'LEARNING') {
        await updateSettingMutation.mutateAsync({
          key: 'learning_data',
          dto: {
            value: learningConfig,
            description: 'Cấu hình giáo trình học tập và nguồn cấp dữ liệu tài chính',
          },
        });
        toast.success('Đã lưu cấu hình học tập & dữ liệu tài chính thành công.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu cài đặt.';
      toast.error(msg);
    }
  };

  // Toggle Feature Flag
  const handleToggleFlag = async (flag: FeatureFlagEntity) => {
    try {
      await toggleFlagMutation.mutateAsync({
        key: flag.key,
        dto: { isEnabled: !flag.isEnabled, description: flag.description || undefined },
      });
      toast.success(`Đã cập nhật trạng thái tính năng “${flag.key}”.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật cờ tính năng.');
    }
  };

  // Advanced Raw JSON handlers
  const startEditRaw = (setting: SystemSettingEntity) => {
    setFeedback(null);
    setEditingKey(setting.key);
    setJsonText(JSON.stringify(setting.value, null, 2));
    setDescriptionText(setting.description || '');
  };

  const handleSaveRaw = async (key: string) => {
    setFeedback(null);
    let parsedValue: Record<string, any>;
    try {
      parsedValue = JSON.parse(jsonText);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Định dạng JSON không hợp lệ. Vui lòng kiểm tra cú pháp trước khi lưu.',
      });
      return;
    }

    try {
      await updateSettingMutation.mutateAsync({
        key,
        dto: {
          value: parsedValue,
          description: descriptionText.trim() || undefined,
        },
      });
      setFeedback({
        type: 'success',
        message: `System setting '${key}' updated successfully.`,
      });
      toast.success(`Đã lưu cấu hình '${key}'.`);
      setEditingKey(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật cài đặt.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const isSaving = updateSettingMutation.isPending;

  return (
    <div className="system-area space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Cài đặt hệ thống
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cấu hình tham số vận hành, quy tắc cộng đồng, dữ liệu tài chính và cờ tính năng nền tảng.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="h-10 gap-2 rounded-[8px] border-slate-200/80 bg-white dark:bg-card dark:border-border px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Tải lại</span>
          </Button>

          {activeTab !== 'ADVANCED' && activeTab !== 'FEATURES' && (
            <Button
              onClick={handleSaveTabConfig}
              disabled={isSaving}
              className="h-10 gap-2 rounded-[8px] bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Lưu thay đổi</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Container with Tabs */}
      <div className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-border/60 px-4 sm:px-5 scrollbar-none">
          {[
            { id: 'GENERAL' as const, label: 'Chung & Thương hiệu', icon: Globe },
            { id: 'COMMUNITY' as const, label: 'Kiểm duyệt & Chống Spam', icon: MessageSquare },
            { id: 'LEARNING' as const, label: 'Học tập & Dữ liệu', icon: BookOpen },
            { id: 'FEATURES' as const, label: 'Tính năng thử nghiệm', icon: Flag },
            { id: 'ADVANCED' as const, label: 'Cấu hình nâng cao (JSON)', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 relative shrink-0 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Areas */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: GENERAL & BRANDING */}
          {activeTab === 'GENERAL' && (
            <div className="w-full space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Thông tin định danh nền tảng
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tên hiển thị, khẩu hiệu và các kênh liên hệ chính thức trên toàn bộ giao diện.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-1">
                  <label className="block text-sm font-semibold text-foreground">
                    Tên nền tảng (Site Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={generalConfig.platformName}
                    onChange={(e) =>
                      setGeneralConfig((p) => ({ ...p, platformName: e.target.value }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Khẩu hiệu thương hiệu (Slogan)
                  </label>
                  <input
                    type="text"
                    value={generalConfig.platformSlogan}
                    onChange={(e) =>
                      setGeneralConfig((p) => ({ ...p, platformSlogan: e.target.value }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Email hỗ trợ quản trị (Support Email)
                  </label>
                  <input
                    type="email"
                    value={generalConfig.supportEmail}
                    onChange={(e) =>
                      setGeneralConfig((p) => ({ ...p, supportEmail: e.target.value }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Hotline CSKH
                  </label>
                  <input
                    type="text"
                    value={generalConfig.hotline}
                    onChange={(e) =>
                      setGeneralConfig((p) => ({ ...p, hotline: e.target.value }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Đường dẫn cộng đồng (Telegram / Zalo Group)
                  </label>
                  <input
                    type="url"
                    value={generalConfig.communityTelegram}
                    onChange={(e) =>
                      setGeneralConfig((p) => ({ ...p, communityTelegram: e.target.value }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Maintenance Mode Card */}
              <div className="rounded-[10px] border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        Chế độ bảo trì hệ thống (Maintenance Mode)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Khi kích hoạt, người dùng thông thường sẽ thấy trang thông báo bảo trì. Chỉ tài khoản Quản trị viên mới có thể truy cập hệ thống.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={generalConfig.maintenanceMode}
                    onClick={() =>
                      setGeneralConfig((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      generalConfig.maintenanceMode ? 'bg-amber-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        generalConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {generalConfig.maintenanceMode && (
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                    <label className="block text-sm font-semibold text-foreground">
                      Thông điệp thông báo bảo trì gửi người dùng:
                    </label>
                    <textarea
                      rows={2}
                      value={generalConfig.maintenanceMessage}
                      onChange={(e) =>
                        setGeneralConfig((p) => ({ ...p, maintenanceMessage: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-[8px] border border-amber-300 dark:border-amber-800 bg-white dark:bg-card p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITY & MODERATION */}
          {activeTab === 'COMMUNITY' && (
            <div className="w-full space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Quy tắc duyệt bài & Giới hạn chống Spam
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Thiết lập cơ chế kiểm soát chất lượng thảo luận và ngăn chặn bot tự động.
                </p>
              </div>

              {/* Moderation Mode Radio Selection */}
              <div className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                  Cơ chế xuất bản bài viết cộng đồng:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setCommunityConfig((p) => ({ ...p, moderationMode: 'AUTO' }))
                    }
                    className={`cursor-pointer rounded-[8px] border p-4 transition-all ${
                      communityConfig.moderationMode === 'AUTO'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          communityConfig.moderationMode === 'AUTO'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {communityConfig.moderationMode === 'AUTO' && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground">Tự động xuất bản (Hậu kiểm)</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Bài viết hiển thị ngay sau khi người dùng nhấn đăng. Hệ thống chỉ gắn cờ nếu phát hiện từ khóa nhạy cảm.
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      setCommunityConfig((p) => ({ ...p, moderationMode: 'PRE_MODERATION' }))
                    }
                    className={`cursor-pointer rounded-[8px] border p-4 transition-all ${
                      communityConfig.moderationMode === 'PRE_MODERATION'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          communityConfig.moderationMode === 'PRE_MODERATION'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {communityConfig.moderationMode === 'PRE_MODERATION' && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground">Kiểm duyệt trước (Tiền kiểm)</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Bài viết được đưa vào hàng đợi kiểm duyệt. Quản trị viên phê duyệt thì bài mới xuất hiện công khai.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Limiting Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Thời gian chờ giữa 2 bài đăng (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={communityConfig.postCooldownMinutes}
                    onChange={(e) =>
                      setCommunityConfig((p) => ({
                        ...p,
                        postCooldownMinutes: Number(e.target.value) || 1,
                      }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">Mặc định: 5 phút</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Thời gian chờ giữa 2 bình luận (giây)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={communityConfig.commentCooldownSeconds}
                    onChange={(e) =>
                      setCommunityConfig((p) => ({
                        ...p,
                        commentCooldownSeconds: Number(e.target.value) || 10,
                      }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">Mặc định: 30 giây</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Số bài đăng tối đa / ngày (Mem mới)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={communityConfig.dailyPostLimitNewUsers}
                    onChange={(e) =>
                      setCommunityConfig((p) => ({
                        ...p,
                        dailyPostLimitNewUsers: Number(e.target.value) || 3,
                      }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-4 text-base font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">Áp dụng tài khoản &lt; 7 ngày</p>
                </div>
              </div>

              {/* Banned Keywords */}
              <div>
                <label className="block text-sm font-semibold text-foreground">
                  Danh sách từ khóa nhạy cảm / Chặn tự động (Phân cách bằng dấu phẩy)
                </label>
                <textarea
                  rows={3}
                  value={communityConfig.bannedKeywords}
                  onChange={(e) =>
                    setCommunityConfig((p) => ({ ...p, bannedKeywords: e.target.value }))
                  }
                  placeholder="lừa đảo, cam kết lãi khủng, ủy thác, ..."
                  className="mt-1.5 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 leading-relaxed shadow-2xs"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Bài viết hoặc bình luận chứa các từ khóa này sẽ tự động bị tạm giữ để quản trị viên kiểm tra.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING & FINANCIAL DATA */}
          {activeTab === 'LEARNING' && (
            <div className="w-full space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Giáo trình khóa học & Cấp dữ liệu thị trường
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Cấu hình hành vi học tập và nguồn cấp chỉ số tài chính cho các công cụ định giá.
                </p>
              </div>

              {/* Learning Toggles in 3-Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col justify-between rounded-[10px] border border-slate-100 dark:border-border/80 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-foreground leading-snug">
                      Đọc trước bài mở đầu (Guest Preview)
                    </h4>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={learningConfig.allowGuestLessonPreview}
                      onClick={() =>
                        setLearningConfig((p) => ({
                          ...p,
                          allowGuestLessonPreview: !p.allowGuestLessonPreview,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        learningConfig.allowGuestLessonPreview ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          learningConfig.allowGuestLessonPreview ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Khách vãng lai chưa đăng nhập có thể xem bài học đầu tiên của mỗi khóa học để trải nghiệm.
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-[10px] border border-slate-100 dark:border-border/80 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-foreground leading-snug">
                      Khu vực thảo luận bài học (Q&A)
                    </h4>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={learningConfig.enableLessonDiscussions}
                      onClick={() =>
                        setLearningConfig((p) => ({
                          ...p,
                          enableLessonDiscussions: !p.enableLessonDiscussions,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        learningConfig.enableLessonDiscussions ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          learningConfig.enableLessonDiscussions ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Hiển thị khung bình luận và giải đáp thắc mắc dưới mỗi bài học trong giáo trình.
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-[10px] border border-slate-100 dark:border-border/80 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-foreground leading-snug">
                      Tự động lưu tiến độ (Auto-Save)
                    </h4>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={learningConfig.autoSaveLearningProgress}
                      onClick={() =>
                        setLearningConfig((p) => ({
                          ...p,
                          autoSaveLearningProgress: !p.autoSaveLearningProgress,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        learningConfig.autoSaveLearningProgress ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          learningConfig.autoSaveLearningProgress ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tự động lưu % tiến độ hoàn thành bài học khi học viên cuộn qua 90% nội dung.
                  </p>
                </div>
              </div>

              {/* Financial Data Feeds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Nhà cung cấp dữ liệu thị trường mặc định:
                  </label>
                  <select
                    value={learningConfig.marketDataProvider}
                    onChange={(e) =>
                      setLearningConfig((p) => ({
                        ...p,
                        marketDataProvider: e.target.value as any,
                      }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-3 text-base font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  >
                    <option value="VNSTOCK">Vnstock Open Data (Khuyên dùng - Ổn định)</option>
                    <option value="SSI">SSI iBoard API Connector</option>
                    <option value="VIETCAP">Vietcap Realtime Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Tần suất đồng bộ số liệu vĩ mô & cổ phiếu:
                  </label>
                  <select
                    value={learningConfig.dataRefreshFrequency}
                    onChange={(e) =>
                      setLearningConfig((p) => ({
                        ...p,
                        dataRefreshFrequency: e.target.value as any,
                      }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-background px-3 text-base font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs"
                  >
                    <option value="REALTIME">Thời gian thực (Trong phiên giao dịch)</option>
                    <option value="15_MINUTES">15 phút một lần</option>
                    <option value="30_MINUTES">30 phút một lần</option>
                    <option value="EOD">Cuối ngày (Sau 15:30 ATC)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE FLAGS */}
          {activeTab === 'FEATURES' && (
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Cờ tính năng hệ thống (Feature Flags)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Bật hoặc tắt tức thời các tính năng thử nghiệm và module mới mà không cần khởi động lại server.
                  </p>
                </div>
                <Link
                  href="/quan-tri/tinh-nang"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Quản lý chi tiết →
                </Link>
              </div>

              {isFlagsLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>Đang tải danh sách tính năng...</span>
                </div>
              ) : featureFlags.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-[8px]">
                  Chưa có cờ tính năng nào trong hệ thống.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureFlags.map((flag) => (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-2xs hover:border-slate-200 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {flag.key}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              flag.isEnabled
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-slate-400'
                            }`}
                          >
                            {flag.isEnabled ? 'Đang bật' : 'Đã tắt'}
                          </span>
                        </div>
                        {flag.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {flag.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={flag.isEnabled}
                        onClick={() => handleToggleFlag(flag)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          flag.isEnabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            flag.isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADVANCED JSON CONFIG */}
          {activeTab === 'ADVANCED' && (
            <div className="w-full space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Tham số cấu hình JSON chuyên sâu (Database Raw Values)
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Dành riêng cho kỹ sư hệ thống kiểm tra và hiệu chỉnh trực tiếp các key-value trong bảng{' '}
                  <code className="rounded bg-slate-100 dark:bg-muted px-1.5 py-0.5 font-mono text-sm text-emerald-600">
                    system_settings
                  </code>.
                </p>
              </div>

              {feedback && (
                <div
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                  className={`flex items-center gap-2 p-3.5 rounded-[8px] border text-sm font-medium ${
                    feedback.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300'
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

              {settings.length === 0 ? (
                <div className="p-12 text-center rounded-[8px] border border-dashed border-slate-200 dark:border-border text-sm text-muted-foreground space-y-3">
                  <Sliders className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold text-foreground">Chưa có cài đặt raw nào trong cơ sở dữ liệu.</p>
                  <p>Khi bạn lưu cài đặt ở các tab trên, dữ liệu sẽ tự động xuất hiện tại đây.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.map((setting) => {
                    const isEditing = editingKey === setting.key;

                    return (
                      <div
                        key={setting.key}
                        className="rounded-[8px] border border-slate-100 dark:border-border/80 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-border/60 pb-3">
                          <div>
                            <span className="font-mono text-sm font-bold text-foreground">
                              {setting.key}
                            </span>
                            {setting.description && !isEditing && (
                              <p className="text-sm text-muted-foreground pt-0.5">
                                {setting.description}
                              </p>
                            )}
                          </div>

                          {!isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditRaw(setting)}
                              className="text-sm h-8 px-3 rounded-[6px] gap-1.5 font-mono"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Edit</span>
                            </Button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-4 pt-1">
                            <div>
                              <label
                                htmlFor={`edit-desc-${setting.key}`}
                                className="block text-sm font-semibold text-foreground font-mono"
                              >
                                Description
                              </label>
                              <input
                                id={`edit-desc-${setting.key}`}
                                type="text"
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                                className="mt-1 w-full rounded-[6px] border border-slate-200 dark:border-border bg-white dark:bg-card p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`edit-json-${setting.key}`}
                                className="block text-sm font-semibold text-foreground font-mono"
                              >
                                JSON Configuration Payload
                              </label>
                              <textarea
                                id={`edit-json-${setting.key}`}
                                rows={6}
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                className="mt-1 w-full rounded-[6px] border border-slate-200 dark:border-border bg-white dark:bg-card p-3 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-border/60">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingKey(null)}
                                className="rounded-[6px] text-sm h-8 px-3 font-mono"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveRaw(setting.key)}
                                disabled={updateSettingMutation.isPending}
                                className="rounded-[6px] text-sm h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono gap-1.5"
                              >
                                <Save className="h-3 w-3" />
                                <span>Save Configuration</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <pre className="p-3.5 rounded-[6px] bg-slate-900 text-slate-100 text-sm font-mono overflow-x-auto max-h-52">
                            {JSON.stringify(setting.value, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
