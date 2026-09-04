'use client';

import { vi } from './dictionaries/vi';
import { TranslationDictionary } from './types';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationDictionary>;

export function useTranslation() {
  /**
   * Dịch key lồng nhau như 'common.signIn' hoặc 'navigation.home' (thuần tiếng Việt)
   * Hỗ trợ nội suy tham số: t('key', { name: 'Alice' })
   */
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = vi;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = key;
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, value);
    }

    return value;
  };

  return {
    t,
    locale: 'vi' as const,
    setLocale: (_loc?: string) => {},
    toggleLocale: () => {},
    isVietnamese: true,
    isEnglish: false,
  };
}
