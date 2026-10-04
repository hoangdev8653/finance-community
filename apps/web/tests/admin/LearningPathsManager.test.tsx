import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LearningPathsManager } from '@/components/admin/LearningPathsManager';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { postsService } from '@/lib/posts/posts-service';

vi.mock('@/lib/learning/learning-course-service', () => ({
  learningCourseService: {
    list: vi.fn(),
    getAdminPath: vi.fn(),
    createPath: vi.fn(),
    updatePath: vi.fn(),
    deletePath: vi.fn(),
    addLesson: vi.fn(),
    reorderLesson: vi.fn(),
    updateLesson: vi.fn(),
    removeLesson: vi.fn(),
  },
}));

vi.mock('@/lib/posts/posts-service', () => ({
  postsService: {
    getDomains: vi.fn(),
    getCategories: vi.fn(),
    getFeed: vi.fn(),
  },
}));

vi.mock('@/lib/toast/ToastContext', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  }),
}));

const mockCourses = [
  {
    id: 'course-1',
    title: 'Đầu tư Chứng khoán F0',
    slug: 'dau-tu-chung-khoan-f0',
    description: 'Khóa học cơ bản cho người mới',
    domainId: 'domain-1',
    categoryId: 'cat-1',
    isPublished: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
  },
  {
    id: 'course-2',
    title: 'Quản lý tài chính cá nhân',
    slug: 'quan-ly-tai-chinh-ca-nhan',
    description: 'Lập kế hoạch ngân sách thông minh',
    domainId: 'domain-1',
    categoryId: 'cat-2',
    isPublished: false,
    createdAt: '2026-01-03',
    updatedAt: '2026-01-04',
  },
];

describe('LearningPathsManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(learningCourseService.list).mockResolvedValue(mockCourses as any);
    vi.mocked(postsService.getDomains).mockResolvedValue([
      { id: 'domain-1', code: 'FIN', name: 'Finance', nameVi: 'Tài chính', slug: 'tai-chinh', isActive: true },
    ] as any);
    vi.mocked(postsService.getCategories).mockResolvedValue([
      { id: 'cat-1', name: 'Chứng khoán', slug: 'chung-khoan', domainId: 'domain-1' },
      { id: 'cat-2', name: 'Tiết kiệm', slug: 'tiet-kiem', domainId: 'domain-1' },
    ] as any);
    vi.mocked(postsService.getFeed).mockResolvedValue({
      data: [{ id: 'lesson-1', title: 'Bài 1: Tổng quan' }],
    } as any);
  });

  it('renders page header, 5 KPI cards, and path list', async () => {
    render(<LearningPathsManager />);

    await waitFor(() => {
      expect(screen.getByText('Quản lý Khóa học & Lộ trình')).toBeInTheDocument();
    });

    // Check KPI cards
    expect(screen.getByText('Tổng khóa học / Lộ trình')).toBeInTheDocument();
    expect(screen.getAllByText('Đã xuất bản').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bản nháp / Tạm ẩn')).toBeInTheDocument();

    // Check course list items
    expect(screen.getByText('Đầu tư Chứng khoán F0')).toBeInTheDocument();
    expect(screen.getByText('Quản lý tài chính cá nhân')).toBeInTheDocument();
  });

  it('selects a path and loads its lessons into the right pane', async () => {
    vi.mocked(learningCourseService.getAdminPath).mockResolvedValue({
      series: mockCourses[0],
      lessons: [
        { id: 'item-1', postId: 'lesson-1', lessonOrder: 1, isRequired: true, title: 'Bài 1: Giới thiệu' },
      ],
    } as any);

    render(<LearningPathsManager />);

    await waitFor(() => {
      expect(screen.getByText('Đầu tư Chứng khoán F0')).toBeInTheDocument();
    });

    const manageBtn = screen.getAllByRole('button', { name: /Quản lý bài/i })[0];
    fireEvent.click(manageBtn);

    await waitFor(() => {
      expect(screen.getByText('Bài 1: Giới thiệu')).toBeInTheDocument();
    });

    expect(screen.getByText('Bài học bắt buộc')).toBeInTheDocument();
  });
});
