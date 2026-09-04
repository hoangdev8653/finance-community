import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime, formatDate, formatDateTime } from '@/lib/utils/date';
import {
  calculateReadingMinutes,
  formatReadingTime,
  calculateReadingTime,
} from '@/lib/utils/reading-time';

describe('date utils', () => {
  const FIXED_NOW = new Date('2026-09-04T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('returns fallback for empty, null, or undefined dates', () => {
      expect(formatRelativeTime(null)).toBe('Gần đây');
      expect(formatRelativeTime(undefined)).toBe('Gần đây');
      expect(formatRelativeTime('')).toBe('Gần đây');
      expect(formatRelativeTime(null, 'Không rõ')).toBe('Không rõ');
    });

    it('returns fallback for invalid date strings', () => {
      expect(formatRelativeTime('invalid-date-string')).toBe('Gần đây');
      expect(formatRelativeTime('not-a-date', 'N/A')).toBe('N/A');
    });

    it('returns "Vừa xong" for timestamps less than 60 seconds ago', () => {
      const thirtySecondsAgo = new Date(FIXED_NOW.getTime() - 30 * 1000);
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('Vừa xong');
    });

    it('handles slight negative clock drift (< 60s in future) as "Vừa xong"', () => {
      const tenSecondsInFuture = new Date(FIXED_NOW.getTime() + 10 * 1000);
      expect(formatRelativeTime(tenSecondsInFuture)).toBe('Vừa xong');
    });

    it('returns formatted date for dates far in the future (> 60s)', () => {
      const twoDaysInFuture = new Date(FIXED_NOW.getTime() + 2 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoDaysInFuture);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/2026/);
    });

    it('formats minutes ago correctly', () => {
      const fiveMinutesAgo = new Date(FIXED_NOW.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 phút trước');

      const fiftyNineMinutesAgo = new Date(FIXED_NOW.getTime() - 59 * 60 * 1000);
      expect(formatRelativeTime(fiftyNineMinutesAgo)).toBe('59 phút trước');
    });

    it('formats hours ago correctly', () => {
      const twoHoursAgo = new Date(FIXED_NOW.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 giờ trước');

      const twentyThreeHoursAgo = new Date(FIXED_NOW.getTime() - 23 * 60 * 60 * 1000);
      expect(formatRelativeTime(twentyThreeHoursAgo)).toBe('23 giờ trước');
    });

    it('formats 1 day ago as "Hôm qua"', () => {
      const oneDayAgo = new Date(FIXED_NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneDayAgo)).toBe('Hôm qua');
    });

    it('formats 2 to 6 days ago as "X ngày trước"', () => {
      const threeDaysAgo = new Date(FIXED_NOW.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 ngày trước');

      const sixDaysAgo = new Date(FIXED_NOW.getTime() - 6 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(sixDaysAgo)).toBe('6 ngày trước');
    });

    it('formats timestamps older than 7 days as standard formatted date', () => {
      const eightDaysAgo = new Date(FIXED_NOW.getTime() - 8 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(eightDaysAgo);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/2026/);
    });
  });

  describe('formatDate', () => {
    it('returns fallback for invalid or empty inputs', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
      expect(formatDate('invalid')).toBe('—');
      expect(formatDate(null, undefined, 'Chưa xác định')).toBe('Chưa xác định');
    });

    it('formats valid date correctly according to vi-VN locale', () => {
      const result = formatDate('2026-08-15T10:00:00Z');
      expect(result).toMatch(/15\/0?8\/2026/);
    });
  });

  describe('formatDateTime', () => {
    it('returns fallback for invalid or empty inputs', () => {
      expect(formatDateTime(null)).toBe('—');
      expect(formatDateTime(undefined)).toBe('—');
    });

    it('formats valid date and time string', () => {
      const result = formatDateTime('2026-08-15T14:30:00Z');
      expect(result).toBeDefined();
      expect(result).toContain('2026');
    });
  });

  describe('reading-time utils', () => {
    it('returns 1 minute for empty or null content', () => {
      expect(calculateReadingMinutes(null)).toBe(1);
      expect(calculateReadingMinutes('')).toBe(1);
      expect(calculateReadingMinutes('   ')).toBe(1);
    });

    it('calculates reading minutes based on word count', () => {
      // 450 words at 225 words/min = 2 minutes
      const text = new Array(450).fill('từ').join(' ');
      expect(calculateReadingMinutes(text)).toBe(2);
    });

    it('strips HTML tags before counting words', () => {
      const html = '<p>Phân tích <strong>thị trường</strong> tài chính <em>Việt Nam</em></p>';
      expect(calculateReadingMinutes(html)).toBe(1);
    });

    it('formats reading time string', () => {
      expect(formatReadingTime(5)).toBe('5 phút đọc');
      expect(formatReadingTime(1)).toBe('1 phút đọc');
    });

    it('calculates and formats reading time in one call', () => {
      const text = new Array(225).fill('từ').join(' ');
      expect(calculateReadingTime(text)).toBe('1 phút đọc');
    });
  });
});
