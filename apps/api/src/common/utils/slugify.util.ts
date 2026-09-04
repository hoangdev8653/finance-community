export class SlugifyUtil {
  /**
   * Converts any string (especially Vietnamese with diacritics/accents)
   * into an SEO-friendly, clean URL slug.
   *
   * Example:
   * "Nhận định thị trường chứng khoán hôm nay & mã $HPG!"
   * -> "nhan-dinh-thi-truong-chung-khoan-hom-nay-ma-hpg"
   */
  static slugify(input: string, maxLength = 300): string {
    if (!input || typeof input !== 'string') {
      return 'post';
    }

    let str = input.trim();

    // 1. Explicitly map Vietnamese specific characters (e.g., đ/Đ)
    str = str
      .replace(/[đĐ]/g, 'd');

    // 2. Normalize Unicode NFD and strip combining diacritical marks
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 3. Lowercase and replace non-alphanumeric chars with hyphen
    str = str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 4. Safe fallback if resulting string is empty
    if (!str) {
      return 'post';
    }

    return str.slice(0, maxLength).replace(/-+$/, '');
  }
}
