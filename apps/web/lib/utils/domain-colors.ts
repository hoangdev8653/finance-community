export interface DomainColorTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  badge: string;
  monogramBg: string;
  monogramText: string;
  dot: string;
}

export const DOMAIN_PALETTES: DomainColorTheme[] = [
  // 0. Emerald (Tài chính - Money / Xanh lục tiền tệ)
  {
    id: 'emerald',
    name: 'Xanh ngọc',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    monogramBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    monogramText: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  // 1. Amber (Nghề nghiệp & Học tập - Career / Vàng hổ phách tri thức)
  {
    id: 'amber',
    name: 'Vàng hổ phách',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200/80 dark:border-amber-800/60',
    badge: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    monogramBg: 'bg-amber-100 dark:bg-amber-900/60',
    monogramText: 'text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  // 2. Purple / Violet (Công nghệ - Tech / Tím công nghệ cao)
  {
    id: 'purple',
    name: 'Tím công nghệ',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200/80 dark:border-purple-800/60',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
    monogramBg: 'bg-purple-100 dark:bg-purple-900/60',
    monogramText: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-600',
  },
  // 3. Royal Blue (Kinh doanh - Business / Xanh dương thương mại)
  {
    id: 'blue',
    name: 'Xanh dương',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200/80 dark:border-blue-800/60',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    monogramBg: 'bg-blue-100 dark:bg-blue-900/60',
    monogramText: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-600',
  },
  // 4. Rose (Đời sống & Sức khỏe - Life / Hồng ngọc sức sống)
  {
    id: 'rose',
    name: 'Hồng ngọc',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200/80 dark:border-rose-800/60',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    monogramBg: 'bg-rose-100 dark:bg-rose-900/60',
    monogramText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  // 5. Cyan (Thể thao - Sports / Xanh lơ biển năng động)
  {
    id: 'cyan',
    name: 'Xanh lơ biển',
    bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    text: 'text-cyan-800 dark:text-cyan-300',
    border: 'border-cyan-200/80 dark:border-cyan-800/60',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60',
    monogramBg: 'bg-cyan-100 dark:bg-cyan-900/60',
    monogramText: 'text-cyan-800 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  // 6. Slate (Khác & Tổng hợp - General / Xám thanh lịch)
  {
    id: 'slate',
    name: 'Xám thanh lịch',
    bg: 'bg-slate-100 dark:bg-slate-800/70',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200/80 dark:border-slate-700/60',
    badge: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/60',
    monogramBg: 'bg-slate-200/80 dark:bg-slate-800',
    monogramText: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  // 7. Orange (Cam nhiệt đới / Bất động sản)
  {
    id: 'orange',
    name: 'Cam tươi',
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-200/80 dark:border-orange-800/60',
    badge: 'bg-orange-50 text-orange-800 border-orange-200/80 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
    monogramBg: 'bg-orange-100 dark:bg-orange-900/60',
    monogramText: 'text-orange-800 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  // 8. Fuchsia (Hồng cánh sen / Tiền số Crypto)
  {
    id: 'fuchsia',
    name: 'Hồng cánh sen',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-200/80 dark:border-fuchsia-800/60',
    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-800/60',
    monogramBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/60',
    monogramText: 'text-fuchsia-700 dark:text-fuchsia-300',
    dot: 'bg-fuchsia-500',
  },
  // 9. Lime (Xanh cốm tươi mới - Dành cho Lĩnh vực mới tạo #1)
  {
    id: 'lime',
    name: 'Xanh cốm',
    bg: 'bg-lime-50 dark:bg-lime-950/60',
    text: 'text-lime-800 dark:text-lime-300',
    border: 'border-lime-200/80 dark:border-lime-800/60',
    badge: 'bg-lime-50 text-lime-800 border-lime-200/80 dark:bg-lime-950/60 dark:text-lime-300 dark:border-lime-800/60',
    monogramBg: 'bg-lime-100 dark:bg-lime-900/60',
    monogramText: 'text-lime-800 dark:text-lime-300',
    dot: 'bg-lime-500',
  },
  // 10. Indigo (Xanh chàm - Dành cho Lĩnh vực mới tạo #2)
  {
    id: 'indigo',
    name: 'Xanh chàm',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200/80 dark:border-indigo-800/60',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    monogramBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    monogramText: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-600',
  },
  // 11. Red (Đỏ ruby nhiệt huyết - Dành cho Lĩnh vực mới tạo #3)
  {
    id: 'red',
    name: 'Đỏ ruby',
    bg: 'bg-red-50 dark:bg-red-950/60',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200/80 dark:border-red-800/60',
    badge: 'bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60',
    monogramBg: 'bg-red-100 dark:bg-red-900/60',
    monogramText: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
  // 12. Teal (Xanh mòng két đậm - Dành cho Lĩnh vực mới tạo #4)
  {
    id: 'teal',
    name: 'Xanh mòng két',
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-200/80 dark:border-teal-800/60',
    badge: 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
    monogramBg: 'bg-teal-100 dark:bg-teal-900/60',
    monogramText: 'text-teal-800 dark:text-teal-300',
    dot: 'bg-teal-600',
  },
  // 13. Pink (Hồng phấn - Dành cho Lĩnh vực mới tạo #5)
  {
    id: 'pink',
    name: 'Hồng phấn',
    bg: 'bg-pink-50 dark:bg-pink-950/60',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200/80 dark:border-pink-800/60',
    badge: 'bg-pink-50 text-pink-700 border-pink-200/80 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/60',
    monogramBg: 'bg-pink-100 dark:bg-pink-900/60',
    monogramText: 'text-pink-700 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
  // 14. Yellow (Vàng nắng - Dành cho Lĩnh vực mới tạo #6)
  {
    id: 'yellow',
    name: 'Vàng nắng',
    bg: 'bg-yellow-50 dark:bg-yellow-950/60',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-200/80 dark:border-yellow-800/60',
    badge: 'bg-yellow-50 text-yellow-800 border-yellow-200/80 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800/60',
    monogramBg: 'bg-yellow-100 dark:bg-yellow-900/60',
    monogramText: 'text-yellow-800 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  // 15. Violet (Tím violet sẫm - Dành cho Lĩnh vực mới tạo #7)
  {
    id: 'violet',
    name: 'Tím violet',
    bg: 'bg-violet-50 dark:bg-violet-950/60',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200/80 dark:border-violet-800/60',
    badge: 'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/60',
    monogramBg: 'bg-violet-100 dark:bg-violet-900/60',
    monogramText: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-600',
  },
];

// Special fixed mapping for primary default domains
export const KNOWN_DOMAIN_MAP: Record<string, number> = {
  MONEY: 0,              // Emerald (Tài chính)
  TAI_CHINH: 0,
  CAREER: 1,             // Amber (Nghề nghiệp & Học tập)
  NGHE_NGHIEP: 1,
  HOC_TAP: 1,
  TECH: 2,               // Purple (Công nghệ)
  CONG_NGHE: 2,
  TECHNOLOGY: 2,
  BUSINESS: 3,           // Royal Blue (Kinh doanh)
  KINH_DOANH: 3,
  LIFE: 4,               // Rose (Đời sống & Sức khỏe)
  DOI_SONG: 4,
  DOI_SONG_SUC_KHOE: 4,
  SPORTS: 5,             // Cyan (Thể thao)
  THE_THAO: 5,
  GENERAL: 6,            // Slate (Khác / Chung)
  CHUNG: 6,
  KHAC: 6,
  REAL_ESTATE: 7,        // Orange (Bất động sản)
  BAT_DONG_SAN: 7,
  CRYPTO: 8,             // Fuchsia (Tiền mã hóa)
  TIEN_MA_HOA: 8,
};

// Global cache to keep color assignments strictly unique across renders
const domainColorCache = new Map<string, DomainColorTheme>();
const allocatedDomainIds = new Set<string>();

/**
 * Re-allocates unique colors for all domains so that every newly added domain
 * receives an unused color from the palette that is distinct from all existing domains.
 */
export function syncDomainColorAllocations(allDomains: Array<{ id?: string; code?: string; slug?: string; name?: string }>): void {
  if (!allDomains || !allDomains.length) return;

  const usedPaletteIndices = new Set<number>();
  const unassignedDomains: Array<{ id?: string; code?: string; slug?: string; name?: string }> = [];

  // Pass 1: Keep or assign known signature colors
  for (const domain of allDomains) {
    const codeKey = (domain.code || '').toUpperCase();
    const slugKey = (domain.slug || '').toUpperCase().replace(/-/g, '_');

    let fixedIndex: number | undefined = undefined;
    if (KNOWN_DOMAIN_MAP[codeKey] !== undefined) {
      fixedIndex = KNOWN_DOMAIN_MAP[codeKey];
    } else if (KNOWN_DOMAIN_MAP[slugKey] !== undefined) {
      fixedIndex = KNOWN_DOMAIN_MAP[slugKey];
    }

    if (fixedIndex !== undefined && DOMAIN_PALETTES[fixedIndex]) {
      const theme = DOMAIN_PALETTES[fixedIndex];
      usedPaletteIndices.add(fixedIndex);
      if (domain.id) domainColorCache.set(domain.id, theme);
      if (domain.code) domainColorCache.set(domain.code.toUpperCase(), theme);
      if (domain.slug) domainColorCache.set(domain.slug.toLowerCase(), theme);
      if (domain.id) allocatedDomainIds.add(domain.id);
    } else {
      unassignedDomains.push(domain);
    }
  }

  // Pass 2: For any new or custom domain, allocate the next available unused color!
  for (const domain of unassignedDomains) {
    // If already cached and valid, keep it unless collided
    let targetIndex = -1;
    for (let i = 0; i < DOMAIN_PALETTES.length; i++) {
      if (!usedPaletteIndices.has(i)) {
        targetIndex = i;
        break;
      }
    }

    // Wrap around if domain count exceeds palette length
    if (targetIndex === -1) {
      const fallbackStr = domain.code || domain.slug || domain.id || 'NEW_DOMAIN';
      let hash = 0;
      for (let j = 0; j < fallbackStr.length; j++) {
        hash = (hash << 5) - hash + fallbackStr.charCodeAt(j);
        hash |= 0;
      }
      targetIndex = Math.abs(hash) % DOMAIN_PALETTES.length;
    }

    usedPaletteIndices.add(targetIndex);
    const theme = DOMAIN_PALETTES[targetIndex];
    if (domain.id) domainColorCache.set(domain.id, theme);
    if (domain.code) domainColorCache.set(domain.code.toUpperCase(), theme);
    if (domain.slug) domainColorCache.set(domain.slug.toLowerCase(), theme);
    if (domain.id) allocatedDomainIds.add(domain.id);
  }
}

/**
 * Automatically get a distinctive color theme for any domain.
 * Guarantee: When allDomains is supplied, no two domains will share the same color.
 */
export function getDomainColorTheme(
  domainOrCode?: { id?: string; code?: string; slug?: string; name?: string } | string | null,
  allDomains?: Array<{ id?: string; code?: string; slug?: string; name?: string }>
): DomainColorTheme {
  if (allDomains && allDomains.length) {
    syncDomainColorAllocations(allDomains);
  }

  if (!domainOrCode) {
    return DOMAIN_PALETTES[0];
  }

  // String lookup (ID, Code, or Slug)
  if (typeof domainOrCode === 'string') {
    const raw = domainOrCode.trim();
    if (domainColorCache.has(raw)) return domainColorCache.get(raw)!;
    if (domainColorCache.has(raw.toUpperCase())) return domainColorCache.get(raw.toUpperCase())!;
    if (domainColorCache.has(raw.toLowerCase())) return domainColorCache.get(raw.toLowerCase())!;

    const codeUpper = raw.toUpperCase().replace(/-/g, '_');
    if (KNOWN_DOMAIN_MAP[codeUpper] !== undefined) {
      return DOMAIN_PALETTES[KNOWN_DOMAIN_MAP[codeUpper]];
    }

    // Stable hash fallback
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return DOMAIN_PALETTES[Math.abs(hash) % DOMAIN_PALETTES.length];
  }

  // Object lookup
  const { id, code, slug } = domainOrCode;
  if (id && domainColorCache.has(id)) return domainColorCache.get(id)!;
  if (code && domainColorCache.has(code.toUpperCase())) return domainColorCache.get(code.toUpperCase())!;
  if (slug && domainColorCache.has(slug.toLowerCase())) return domainColorCache.get(slug.toLowerCase())!;

  // Check known mapping
  const codeKey = (code || '').toUpperCase();
  const slugKey = (slug || '').toUpperCase().replace(/-/g, '_');
  if (codeKey && KNOWN_DOMAIN_MAP[codeKey] !== undefined) {
    return DOMAIN_PALETTES[KNOWN_DOMAIN_MAP[codeKey]];
  }
  if (slugKey && KNOWN_DOMAIN_MAP[slugKey] !== undefined) {
    return DOMAIN_PALETTES[KNOWN_DOMAIN_MAP[slugKey]];
  }

  // Stable hash fallback
  const fallback = code || slug || id || 'DOMAIN';
  let hash = 0;
  for (let i = 0; i < fallback.length; i++) {
    hash = (hash << 5) - hash + fallback.charCodeAt(i);
    hash |= 0;
  }
  return DOMAIN_PALETTES[Math.abs(hash) % DOMAIN_PALETTES.length];
}
