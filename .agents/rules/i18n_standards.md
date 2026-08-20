# Frontend Internationalization (i18n) Standards Rule

When creating or modifying any Page, Component, Layout, Modal, or Toast in `apps/web`, you MUST follow the established bilingual translation system.

---

## 1. No Hardcoded UI Strings

- **NEVER** hardcode user-facing strings (Vietnamese or English) directly in JSX/TSX.
- ❌ Bad: `<button>Đăng nhập</button>` or `<h4>No records found</h4>`
- ✅ Good: `<button>{t('common.signIn')}</button>` or `<h4>{t('feedback.noRecords')}</h4>`

---

## 2. Bilingual Synchronization Requirement

Whenever a new UI string, label, button text, error message, or prompt is introduced:
1. Add the TypeScript key definition in `apps/web/lib/i18n/types.ts`.
2. Add the Vietnamese translation (Default) in `apps/web/lib/i18n/dictionaries/vi.ts`.
3. Add the English translation in `apps/web/lib/i18n/dictionaries/en.ts`.
4. Use the `useTranslation()` hook:
   ```tsx
   import { useTranslation } from '@/lib/i18n/useTranslation';

   export function MyComponent() {
     const { t } = useTranslation();
     return <span>{t('myNamespace.myKey')}</span>;
   }
   ```

---

## 3. Dynamic & Parameterized Messages

For dynamic strings (e.g. "5 minutes read", "Published by {author}"), use the interpolation helper:
- Dictionary: `readTime: '{count} phút đọc'` / `'{count} min read'`
- Component: `t('posts.readTime', { count: 5 })`
