/**
 * Tiện ích định dạng ngày giờ và thời gian tương đối chuẩn tiếng Việt
 */

const DEFAULT_LOCALE = 'vi-VN';

/**
 * Định dạng thời gian tương đối (VD: "Vừa xong", "5 phút trước", "2 giờ trước", "Hôm qua", "3 ngày trước", "25/08/2026")
 * @param dateInput Chuỗi ISO date, Date object hoặc null/undefined
 * @param fallback Chuỗi hiển thị mặc định khi ngày không hợp lệ hoặc rỗng (mặc định: 'Gần đây')
 */
export function formatRelativeTime(
  dateInput?: string | Date | null,
  fallback = 'Gần đây'
): string {
  if (!dateInput) return fallback;

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return fallback;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Xử lý ngày ở tương lai xa (trên 1 phút) -> hiển thị ngày cụ thể
  if (diffInSeconds < -60) {
    return date.toLocaleDateString(DEFAULT_LOCALE, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }

  // Chênh lệch dưới 1 phút (bao gồm lệch clock client/server nhẹ)
  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Hôm qua';
  }
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  // Quá 7 ngày: hiển thị ngày tháng năm cụ thể
  return date.toLocaleDateString(DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

/**
 * Định dạng ngày theo chuẩn Việt Nam (mặc định: dd/mm/yyyy)
 * @param dateInput Chuỗi ISO date, Date object hoặc null/undefined
 * @param options Tùy chọn format của Intl.DateTimeFormatOptions
 * @param fallback Chuỗi hiển thị khi không có ngày hợp lệ
 */
export function formatDate(
  dateInput?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
  fallback = '—'
): string {
  if (!dateInput) return fallback;

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString(DEFAULT_LOCALE, options);
}

/**
 * Định dạng ngày giờ đầy đủ (mặc định: HH:mm, dd/mm/yyyy)
 * @param dateInput Chuỗi ISO date, Date object hoặc null/undefined
 * @param fallback Chuỗi hiển thị khi không có ngày hợp lệ
 */
export function formatDateTime(
  dateInput?: string | Date | null,
  fallback = '—'
): string {
  if (!dateInput) return fallback;

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return fallback;

  return date.toLocaleString(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
