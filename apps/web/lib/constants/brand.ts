/**
 * Single Source of Truth for Brand Identity & Slogans.
 * Mọi thông tin tên thương hiệu, slogan, ban biên tập, email liên hệ đều được định nghĩa tại đây.
 * Khi cần thay đổi thương hiệu, chỉ cần chỉnh sửa duy nhất file này.
 */
export const BRAND = {
  name: 'BrewSeven',
  shortName: 'BrewSeven',
  code: 'Br7',
  domain: 'brewseven.vn',
  fallbackUrl: 'https://brewseven.vn',

  // Slogans & Taglines
  slogan: 'Mỗi ngày một tách tri thức cùng BrewSeven.',
  sloganShort: 'Mỗi ngày một tách tri thức',
  sloganCore: 'BrewSeven — Chưng cất tri thức, nâng tầm cuộc sống.',
  sloganPositioning: 'BrewSeven — Nền tảng học tập & phong cách sống: Tài chính, Thể thao & Kỹ năng sống.',

  // Desks & Units
  editorialDesk: 'Ban Biên Tập BrewSeven',
  expertDesk: 'Chuyên Gia BrewSeven',
  intelligenceBadge: 'BrewSeven Intelligence • Verified Research',
  studioName: 'BrewSeven Studio',
  adminName: 'BrewSeven Admin',

  // Emails
  emails: {
    editorial: 'editorial@brewseven.vn',
    support: 'support@brewseven.vn',
    partners: 'partners@brewseven.vn',
  },

  // Social & Channels
  social: {
    twitter: '@brewseven',
  },
} as const;

export type BrandConfig = typeof BRAND;
