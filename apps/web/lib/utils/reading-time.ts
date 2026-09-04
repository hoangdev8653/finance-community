/**
 * Tiện ích ước tính thời gian đọc bài viết
 */

const DEFAULT_WORDS_PER_MINUTE = 225;

/**
 * Tính số phút đọc ước tính dựa trên nội dung văn bản (hoặc HTML)
 * @param content Nội dung bài viết dạng văn bản thuần hoặc HTML
 * @param wordsPerMinute Tốc độ đọc trung bình (mặc định: 225 từ/phút)
 */
export function calculateReadingMinutes(
  content?: string | null,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
): number {
  if (!content) return 1;

  // Loại bỏ các thẻ HTML nếu có
  const plainText = content.replace(/<[^>]*>/g, ' ').trim();
  if (!plainText) return 1;

  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Định dạng số phút thành chuỗi tiếng Việt (VD: "5 phút đọc")
 */
export function formatReadingTime(minutes: number): string {
  return `${Math.max(1, minutes)} phút đọc`;
}

/**
 * Tính và định dạng trực tiếp thời gian đọc bài từ nội dung
 */
export function calculateReadingTime(
  content?: string | null,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
): string {
  const minutes = calculateReadingMinutes(content, wordsPerMinute);
  return formatReadingTime(minutes);
}
