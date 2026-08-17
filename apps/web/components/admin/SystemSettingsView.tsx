'use client';

import React, { useState } from 'react';
import {
  useSystemSettings,
  useUpdateSystemSetting,
} from '@/lib/admin/use-admin';
import { SystemSettingEntity } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Sliders, AlertCircle, CheckCircle2, Save, Edit3, X } from 'lucide-react';

export function SystemSettingsView() {
  const { data: settings, isLoading, isError, refetch } = useSystemSettings();
  const updateSettingMutation = useUpdateSystemSetting();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
      setFeedback({
        type: 'error',
        message: 'Invalid JSON format. Please verify syntax before saving.',
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
      setEditingKey(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update system setting.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">
            Runtime System Settings
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Configure system runtime parameters, rate limits, and operational thresholds.
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

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-lg border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="p-8 text-center rounded-lg border border-danger/20 bg-danger/5 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            Failed to load system settings.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && settings && settings.length === 0 && (
        <div className="p-12 text-center rounded-lg border border-dashed border-border bg-surface space-y-2">
          <Sliders className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No Settings Configured</h3>
          <p className="text-xs text-muted-foreground">
            No system runtime configuration keys are currently stored.
          </p>
        </div>
      )}

      {!isLoading && !isError && settings && settings.length > 0 && (
        <div className="space-y-4">
          {settings.map((setting) => {
            const isEditing = editingKey === setting.key;

            return (
              <div
                key={setting.key}
                className="rounded-lg border border-border bg-surface p-5 space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <h3 className="font-mono text-xs font-bold text-foreground">
                      {setting.key}
                    </h3>
                    {setting.description && !isEditing && (
                      <p className="text-2xs text-muted-foreground pt-0.5">
                        {setting.description}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(setting)}
                      className="text-xs h-7 gap-1 font-mono"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label
                        htmlFor={`edit-desc-${setting.key}`}
                        className="text-2xs font-semibold text-muted-foreground uppercase font-mono"
                      >
                        Description
                      </label>
                      <input
                        id={`edit-desc-${setting.key}`}
                        type="text"
                        value={descriptionText}
                        onChange={(e) => setDescriptionText(e.target.value)}
                        className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor={`edit-json-${setting.key}`}
                        className="text-2xs font-semibold text-muted-foreground uppercase font-mono"
                      >
                        JSON Configuration Payload
                      </label>
                      <textarea
                        id={`edit-json-${setting.key}`}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        rows={6}
                        className="w-full font-mono text-xs rounded-md border border-input bg-background p-3 text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={updateSettingMutation.isPending}
                        className="gap-1 font-mono text-xs"
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
                        className="gap-1 font-mono text-xs"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Configuration</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="p-3 rounded-md bg-background border border-border text-2xs font-mono text-foreground/90 overflow-x-auto">
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
