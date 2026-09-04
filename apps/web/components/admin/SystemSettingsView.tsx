'use client';

import React, { useState } from 'react';
import {
  useSystemSettings,
  useUpdateSystemSetting,
} from '@/lib/admin/use-admin';
import { SystemSettingEntity } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Sliders, AlertCircle, CheckCircle2, Save, Edit3, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/lib/toast/ToastContext';
import { AdminSearchInput } from './AdminSearchInput';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function SystemSettingsView() {
  const { data: settings = [], isLoading, isError, refetch } = useSystemSettings();
  const updateSettingMutation = useUpdateSystemSetting();

  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 350);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { toast } = useToast();

  const startEdit = (setting: SystemSettingEntity) => {
    setFeedback(null);
    setEditingKey(setting.key);
    setJsonText(JSON.stringify(setting.value, null, 2));
    setDescriptionText(setting.description || '');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setJsonText('');
    setDescriptionText('');
    setFeedback(null);
  };

  const handleSave = async (key: string) => {
    setFeedback(null);

    let parsedValue: Record<string, any>;
    try {
      parsedValue = JSON.parse(jsonText);
    } catch (err: any) {
      const msg = 'Invalid JSON format. Please verify syntax before saving.';
      setFeedback({
        type: 'error',
        message: msg,
      });
      toast.error(msg);
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
      const msg = `System setting '${key}' updated successfully.`;
      setFeedback({
        type: 'success',
        message: msg,
      });
      toast.success(msg);
      setEditingKey(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update system setting.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const filteredSettings = (settings || []).filter((setting) => {
    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase().trim();
    return (
      setting.key.toLowerCase().includes(q) ||
      (setting.description && setting.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sliders className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Cài đặt hệ thống
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Cấu hình tham số vận hành, giới hạn truy cập và ngưỡng hoạt động của hệ thống
          </p>
        </div>
      </div>

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

      {/* Summary & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearchInput
          value={search}
          onValueChange={setSearch}
          isLoading={isLoading}
          placeholder="Tìm cấu hình theo khóa (key) hoặc mô tả..."
          aria-label="Tìm kiếm cấu hình"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filteredSettings.length} / {settings.length} tham số
            </span>
            <span>•</span>
            <span>JSON định dạng chuẩn</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="h-8 text-xs self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Làm mới dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="p-8 text-center rounded-xl border border-danger/20 bg-danger/5 space-y-3"
        >
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <p className="text-sm font-medium text-foreground">
            Không thể tải cài đặt hệ thống.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredSettings.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-surface space-y-2">
          <Sliders className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            {settings.length === 0 ? 'Chưa có cài đặt' : 'Không tìm thấy cài đặt phù hợp'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {settings.length === 0
              ? 'Hiện chưa có cấu hình vận hành nào được lưu.'
              : `Không có tham số nào khớp với từ khóa “${search}”.`}
          </p>
        </div>
      )}

      {/* Settings List Container */}
      {!isLoading && !isError && filteredSettings.length > 0 && (
        <div className="space-y-4">
          {filteredSettings.map((setting) => {
            const isEditing = editingKey === setting.key;

            return (
              <div
                key={setting.key}
                className="rounded-xl border border-border bg-surface p-5 space-y-3 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <h3 className="font-mono text-xs font-bold text-foreground">
                      {setting.key}
                    </h3>
                    {setting.description && !isEditing && (
                      <p className="text-xs text-muted-foreground pt-0.5">
                        {setting.description}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(setting)}
                      className="text-xs h-8 gap-1.5 font-mono"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label
                        htmlFor={`edit-desc-${setting.key}`}
                        className="text-xs font-semibold text-muted-foreground uppercase font-mono"
                      >
                        Description
                      </label>
                      <input
                        id={`edit-desc-${setting.key}`}
                        type="text"
                        value={descriptionText}
                        onChange={(e) => setDescriptionText(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor={`edit-json-${setting.key}`}
                        className="text-xs font-semibold text-muted-foreground uppercase font-mono"
                      >
                        JSON Configuration Payload
                      </label>
                      <textarea
                        id={`edit-json-${setting.key}`}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        rows={7}
                        className="w-full font-mono text-xs rounded-lg border border-input bg-background p-3 text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={updateSettingMutation.isPending}
                        className="gap-1 font-mono text-xs h-8"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleSave(setting.key)}
                        isLoading={updateSettingMutation.isPending}
                        className="gap-1 font-mono text-xs h-8"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Configuration</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="p-3.5 rounded-lg bg-background border border-border text-xs font-mono text-foreground/90 overflow-x-auto">
                    {JSON.stringify(setting.value, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

