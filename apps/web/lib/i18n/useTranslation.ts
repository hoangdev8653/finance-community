'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { vi } from './dictionaries/vi';
import { en } from './dictionaries/en';
import { Locale, TranslationDictionary } from './types';

const dictionaries: Record<Locale, TranslationDictionary> = {
  vi,
  en,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationDictionary>;

export function useTranslation() {
  const { locale, setLocale, toggleLocale } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mounting, use 'vi' as default to match server render
  const activeLocale: Locale = mounted ? locale : 'vi';
  const dict = dictionaries[activeLocale] || dictionaries.vi;

  /**
   * Translate a nested key like 'common.signIn' or 'navigation.home'
   * Supports parameter interpolation: t('key', { name: 'Alice' })
   */
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Vietnamese dictionary or key name
        let fallbackVal: any = dictionaries.vi;
        for (const fbK of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fbK in fallbackVal) {
            fallbackVal = fallbackVal[fbK];
          } else {
            fallbackVal = key;
            break;
          }
        }
        value = fallbackVal;
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
    locale: activeLocale,
    setLocale,
    toggleLocale,
    isVietnamese: activeLocale === 'vi',
    isEnglish: activeLocale === 'en',
  };
}
