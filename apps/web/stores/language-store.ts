import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Locale } from '@/lib/i18n/types';

export interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'vi', // Default language is Vietnamese
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({
          locale: state.locale === 'vi' ? 'en' : 'vi',
        })),
    }),
    {
      name: 'finance-pulse-language',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
