import { SlugifyUtil } from './slugify.util';

describe('SlugifyUtil', () => {
  it('should correctly convert Vietnamese title with accents to clean ASCII slug', () => {
    const title = 'Nhận định thị trường chứng khoán hôm nay';
    const result = SlugifyUtil.slugify(title);
    expect(result).toBe('nhan-dinh-thi-truong-chung-khoan-hom-nay');
  });

  it('should correctly handle "đ" and "Đ" characters', () => {
    const title = 'Đầu tư định kỳ cổ phiếu FPT và Đất Xanh';
    const result = SlugifyUtil.slugify(title);
    expect(result).toBe('dau-tu-dinh-ky-co-phieu-fpt-va-dat-xanh');
  });

  it('should strip special characters, punctuation, symbols and finance tickers', () => {
    const title = 'Báo cáo tài chính Q4/2024: $VCB tăng trưởng 25.5% (kỷ lục!)';
    const result = SlugifyUtil.slugify(title);
    expect(result).toBe('bao-cao-tai-chinh-q4-2024-vcb-tang-truong-25-5-ky-luc');
  });

  it('should return fallback "post" for empty or non-alphanumeric strings', () => {
    expect(SlugifyUtil.slugify('')).toBe('post');
    expect(SlugifyUtil.slugify('    ')).toBe('post');
    expect(SlugifyUtil.slugify('---!@#$%^&*()---+')).toBe('post');
  });

  it('should respect maximum length limit without trailing hyphen', () => {
    const longTitle = 'Bài viết rất dài về phân tích cơ bản và phân tích kỹ thuật trên thị trường Việt Nam';
    const result = SlugifyUtil.slugify(longTitle, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith('-')).toBe(false);
  });
});
