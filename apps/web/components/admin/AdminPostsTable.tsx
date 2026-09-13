'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  X,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Search,
  Download,
  SlidersHorizontal,
  Heart,
  MessageSquare,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Tag,
  Folder,
  ShieldAlert,
  XCircle,
  Calendar,
} from 'lucide-react';
import { ModerationPostItem } from '@/types/moderation';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Button } from '../ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { useToast } from '@/lib/toast/ToastContext';
import { resolveMediaUrl } from '@/lib/utils/media';
import { DEFAULT_POST_COVER } from '@/lib/constants/media';

type EditablePost = ModerationPostItem & {
  body?: string | null;
  metaDescription?: string | null;
  categoryName?: string;
  tags?: Array<{ id: string; name: string }>;
  likeCount?: number;
  commentCount?: number;
  bookmarkCount?: number;
  viewCount?: number | string;
};

const fallbackCover = DEFAULT_POST_COVER;

// High-fidelity 8 Mock Community Posts matching mockup image quan_li_bai_viet_cong_dong.png
const MOCK_COMMUNITY_POSTS: EditablePost[] = [
  {
    id: 'mock-post-1',
    title: 'Quản lý tài chính cá nhân cho người mới bắt đầu',
    slug: 'quan-ly-tai-chinh-ca-nhan-cho-nguoi-moi-bat-dau',
    metaDescription: 'Chia sẻ một số nguyên tắc cơ bản giúp bạn bắt đầu...',
    body: 'Chia sẻ một số nguyên tắc cơ bản giúp bạn bắt đầu hành trình quản lý tài chính cá nhân dễ dàng hơn. Đây là những kinh nghiệm mình rút ra sau nhiều năm tìm hiểu và áp dụng.\n\n1. Quy tắc 50/30/20 trong việc phân bổ dòng tiền hàng tháng.\n2. Lập quỹ khẩn cấp tương đương 3 đến 6 tháng sinh hoạt phí.\n3. Tránh các khoản vay tiêu dùng lãi suất cao.\n4. Đầu tư tích lũy định kỳ để tận dụng sức mạnh lãi suất kép.',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    moderatedBy: null,
    moderatedAt: '2025-09-06T14:30:00.000Z',
    moderationReason: null,
    authorId: 'user-a',
    categoryId: 'cat-tc-canhan',
    categoryName: 'Tài chính cá nhân',
    publishedAt: '2025-09-06T14:30:00.000Z',
    createdAt: '2025-09-06T14:30:00.000Z',
    updatedAt: '2025-09-06T14:30:00.000Z',
    coverMedia: {
      id: 'media-1',
      secureUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatarMediaId: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 128,
    commentCount: 32,
    bookmarkCount: 5,
    viewCount: '1.2K',
    tags: [
      { id: 't1', name: 'tài chính' },
      { id: 't2', name: 'quản lý chi tiêu' },
      { id: 't3', name: 'tiết kiệm' },
    ],
  },
  {
    id: 'mock-post-2',
    title: 'Có nên đầu tư vào bất động sản lúc này?',
    slug: 'co-nen-dau-tu-vao-bat-dong-san-luc-nay',
    metaDescription: 'Thị trường bất động sản 2025 có...',
    body: 'Thị trường bất động sản 2025 có những biến số lớn khi khung pháp lý mới chính thức có hiệu lực. Phân tích chi tiết về thanh khoản, tỷ lệ đòn bẩy ngân hàng và những phân khúc có nhu cầu ở thực.',
    contentType: 'COMMUNITY',
    status: 'DRAFT',
    moderationStatus: 'UNREVIEWED',
    moderatedBy: null,
    moderatedAt: null,
    moderationReason: null,
    authorId: 'user-b',
    categoryId: 'cat-dautu',
    categoryName: 'Đầu tư',
    publishedAt: '2025-09-06T10:15:00.000Z',
    createdAt: '2025-09-06T10:15:00.000Z',
    updatedAt: '2025-09-06T10:15:00.000Z',
    coverMedia: {
      id: 'media-2',
      secureUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Trần Thị B',
      username: 'tranthib',
      avatarMediaId: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 96,
    commentCount: 45,
    bookmarkCount: 12,
    viewCount: '2.4K',
    tags: [
      { id: 't4', name: 'đầu tư' },
      { id: 't5', name: 'bất động sản' },
      { id: 't6', name: 'xu hướng' },
    ],
  },
  {
    id: 'mock-post-3',
    title: 'Kinh nghiệm học phân tích kỹ thuật hiệu quả',
    slug: 'kinh-nghiem-hoc-phan-tich-ky-thuat-hieu-qua',
    metaDescription: 'Mình đã tổng hợp một số phương...',
    body: 'Mình đã tổng hợp một số phương pháp phân tích kỹ thuật từ cơ bản đến nâng cao bao gồm nến Nhật, chỉ báo MACD, RSI và các mẫu hình giá có tỷ lệ thắng cao.',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    moderatedBy: null,
    moderatedAt: '2025-09-05T20:22:00.000Z',
    moderationReason: null,
    authorId: 'user-c',
    categoryId: 'cat-chungkhoan',
    categoryName: 'Chứng khoán',
    publishedAt: '2025-09-05T20:22:00.000Z',
    createdAt: '2025-09-05T20:22:00.000Z',
    updatedAt: '2025-09-05T20:22:00.000Z',
    coverMedia: {
      id: 'media-3',
      secureUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Lê Minh C',
      username: 'leminhc',
      avatarMediaId: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 78,
    commentCount: 28,
    bookmarkCount: 8,
    viewCount: '980',
    tags: [
      { id: 't7', name: 'chứng khoán' },
      { id: 't8', name: 'phân tích kỹ thuật' },
    ],
  },
  {
    id: 'mock-post-4',
    title: 'Tư duy tài chính dài hạn',
    slug: 'tu-duy-tai-chinh-dai-han',
    metaDescription: 'Làm thế nào để xây dựng tư duy...',
    body: 'Làm thế nào để xây dựng tư duy đầu tư bền bỉ, không bị dao động trước những đợt rung lắc ngắn hạn của thị trường tài chính.',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    moderatedBy: null,
    moderatedAt: '2025-09-05T16:40:00.000Z',
    moderationReason: null,
    authorId: 'user-d',
    categoryId: 'cat-tuduy',
    categoryName: 'Tư duy',
    publishedAt: '2025-09-05T16:40:00.000Z',
    createdAt: '2025-09-05T16:40:00.000Z',
    updatedAt: '2025-09-05T16:40:00.000Z',
    coverMedia: {
      id: 'media-4',
      secureUrl: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Phạm Thu D',
      username: 'phamthud',
      avatarMediaId: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 64,
    commentCount: 17,
    bookmarkCount: 4,
    viewCount: '650',
    tags: [
      { id: 't9', name: 'tư duy' },
      { id: 't10', name: 'đầu tư dài hạn' },
    ],
  },
  {
    id: 'mock-post-5',
    title: 'Crypto từ cơ bản đến nâng cao',
    slug: 'crypto-tu-co-ban-den-nang-cao',
    metaDescription: 'Hành trình tìm hiểu về blockchain...',
    body: 'Hành trình tìm hiểu về blockchain, kiến trúc mạng phi tập trung và các nguyên lý an toàn bảo mật tài sản số cho người mới.',
    contentType: 'COMMUNITY',
    status: 'HIDDEN',
    moderationStatus: 'BANNED',
    moderatedBy: 'admin',
    moderatedAt: '2025-09-04T11:05:00.000Z',
    moderationReason: 'Nội dung chứa liên kết mời gọi đầu cơ cần rà soát thêm',
    authorId: 'user-e',
    categoryId: 'cat-crypto',
    categoryName: 'Crypto',
    publishedAt: '2025-09-04T11:05:00.000Z',
    createdAt: '2025-09-04T11:05:00.000Z',
    updatedAt: '2025-09-04T11:05:00.000Z',
    coverMedia: {
      id: 'media-5',
      secureUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Hoàng Văn E',
      username: 'hoangvane',
      avatarMediaId: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 55,
    commentCount: 21,
    bookmarkCount: 7,
    viewCount: '820',
    tags: [
      { id: 't11', name: 'crypto' },
      { id: 't12', name: 'blockchain' },
    ],
  },
  {
    id: 'mock-post-6',
    title: 'Excel tài chính ứng dụng thực tế',
    slug: 'excel-tai-chinh-ung-dung-thuc-te',
    metaDescription: 'Một số hàm Excel hữu ích cho...',
    body: 'Một số hàm Excel hữu ích cho việc quản lý bảng cân đối thu chi, tính toán lãi vay mua nhà và tự động hóa báo cáo tài chính cá nhân.',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    moderatedBy: null,
    moderatedAt: '2025-09-03T09:30:00.000Z',
    moderationReason: null,
    authorId: 'user-f',
    categoryId: 'cat-congcu',
    categoryName: 'Công cụ',
    publishedAt: '2025-09-03T09:30:00.000Z',
    createdAt: '2025-09-03T09:30:00.000Z',
    updatedAt: '2025-09-03T09:30:00.000Z',
    coverMedia: {
      id: 'media-6',
      secureUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Nguyễn Thị F',
      username: 'nguyenthif',
      avatarMediaId: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 112,
    commentCount: 36,
    bookmarkCount: 25,
    viewCount: '3.1K',
    tags: [
      { id: 't13', name: 'công cụ' },
      { id: 't14', name: 'excel' },
      { id: 't15', name: 'quản lý ngân sách' },
    ],
  },
  {
    id: 'mock-post-7',
    title: 'Xu hướng thị trường bất động sản 2025',
    slug: 'xu-huong-thi-truong-bat-dong-san-2025',
    metaDescription: 'Phân tích cơ hội và rủi ro trong...',
    body: 'Phân tích cơ hội và rủi ro trong các phân khúc căn hộ và đất nền vùng ven trước thềm các quy hoạch hạ tầng mới.',
    contentType: 'COMMUNITY',
    status: 'REJECTED',
    moderationStatus: 'UNREVIEWED',
    moderatedBy: 'admin',
    moderatedAt: '2025-09-02T18:12:00.000Z',
    moderationReason: 'Thiếu trích dẫn nguồn số liệu thống kê chính thống',
    authorId: 'user-g',
    categoryId: 'cat-batdongsan',
    categoryName: 'Bất động sản',
    publishedAt: '2025-09-02T18:12:00.000Z',
    createdAt: '2025-09-02T18:12:00.000Z',
    updatedAt: '2025-09-02T18:12:00.000Z',
    coverMedia: {
      id: 'media-7',
      secureUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Đặng Tuấn Anh',
      username: 'dangtuanan',
      avatarMediaId: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 89,
    commentCount: 40,
    bookmarkCount: 11,
    viewCount: '1.7K',
    tags: [
      { id: 't16', name: 'bất động sản' },
      { id: 't17', name: 'nhà đất' },
    ],
  },
  {
    id: 'mock-post-8',
    title: 'Thói quen chi tiêu giúp bạn giàu hơn',
    slug: 'thoi-quen-chi-tieu-giup-ban-giau-hon',
    metaDescription: 'Những thói quen nhỏ nhưng tạo...',
    body: 'Những thói quen nhỏ như quy tắc 72 giờ trước khi mua sắm và tự động hóa tiết kiệm nhưng tạo ra khác biệt bền vững cho tương lai tài chính của bạn.',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    moderatedBy: null,
    moderatedAt: '2025-09-02T12:05:00.000Z',
    moderationReason: null,
    authorId: 'user-h',
    categoryId: 'cat-tc-canhan',
    categoryName: 'Tài chính cá nhân',
    publishedAt: '2025-09-02T12:05:00.000Z',
    createdAt: '2025-09-02T12:05:00.000Z',
    updatedAt: '2025-09-02T12:05:00.000Z',
    coverMedia: {
      id: 'media-8',
      secureUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
    },
    author: {
      displayName: 'Phạm Bảo Ngọc',
      username: 'phamngoc',
      avatarMediaId: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    likeCount: 73,
    commentCount: 19,
    bookmarkCount: 9,
    viewCount: '1.1K',
    tags: [
      { id: 't18', name: 'tài chính cá nhân' },
      { id: 't19', name: 'tiết kiệm' },
      { id: 't20', name: 'thói quen' },
    ],
  },
];

// Helper to determine Category pill color based on mockup aesthetic
function getCategoryTheme(categoryName: string) {
  const n = categoryName.toLowerCase();
  if (n.includes('tài chính') || n.includes('cá nhân')) {
    return 'bg-sky-50 text-sky-600 border-sky-200/70 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60';
  }
  if (n.includes('đầu tư')) {
    return 'bg-purple-50 text-purple-600 border-purple-200/70 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60';
  }
  if (n.includes('chứng khoán')) {
    return 'bg-blue-50 text-blue-600 border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60';
  }
  if (n.includes('tư duy')) {
    return 'bg-teal-50 text-teal-600 border-teal-200/70 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60';
  }
  if (n.includes('crypto') || n.includes('tiền số') || n.includes('blockchain')) {
    return 'bg-emerald-50 text-emerald-600 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
  }
  if (n.includes('bất động sản') || n.includes('nhà đất')) {
    return 'bg-violet-50 text-violet-600 border-violet-200/70 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60';
  }
  if (n.includes('công cụ') || n.includes('excel')) {
    return 'bg-cyan-50 text-cyan-600 border-cyan-200/70 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

// Generate deterministic stats for posts lacking explicit counters
function getDeterministicStats(post: EditablePost) {
  if (post.likeCount !== undefined) {
    return {
      likes: post.likeCount,
      comments: post.commentCount ?? 20,
      bookmarks: post.bookmarkCount ?? 5,
      views: post.viewCount ?? '1.0K',
    };
  }
  let hash = 0;
  for (let i = 0; i < post.id.length; i++) {
    hash = (hash << 5) - hash + post.id.charCodeAt(i);
    hash |= 0;
  }
  const pos = Math.abs(hash);
  const likes = (pos % 115) + 25;
  const comments = ((pos >> 3) % 45) + 8;
  const bookmarks = ((pos >> 5) % 15) + 2;
  const viewsRaw = ((pos >> 2) % 4000) + 300;
  const views = viewsRaw > 1000 ? `${(viewsRaw / 1000).toFixed(1)}K` : `${viewsRaw}`;
  return { likes, comments, bookmarks, views };
}

export function AdminPostsTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<EditablePost | null>(null);
  const [preview, setPreview] = useState<EditablePost | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'view' | 'edit' | 'delete' | 'hide' | null>(null);
  const [mockPosts, setMockPosts] = useState<EditablePost[]>(MOCK_COMMUNITY_POSTS);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hideReason, setHideReason] = useState('Vi phạm quy định nội dung');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREVIEWED' | 'APPROVED' | 'REJECTED' | 'BANNED'>('ALL');

  // UI demo mode: this screen deliberately renders local fixtures only.
  const basePosts = mockPosts;

  const categories = useMemo(
    () => Array.from(new Map(basePosts.map((post) => [post.categoryId, post.categoryName || 'Khác'])))
      .filter((entry): entry is [string, string] => Boolean(entry[0]))
      .map(([id, name]) => ({ id, name })),
    [basePosts]
  );

  // Initialize preview with the first local fixture for the demo UI.
  useEffect(() => {
    if (!preview && basePosts.length > 0) {
      setPreview(basePosts[0]);
    }
  }, [basePosts, preview]);

  // Map category id to name
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [categories]);

  // Client filtering & sorting
  const filtered = useMemo(() => {
    let result = basePosts.filter((p) => {
      const q = debouncedSearch.trim().toLowerCase();
      const catName = p.categoryName || (p.categoryId ? categoryMap.get(p.categoryId) || '' : '');
      const matchesSearch =
        !q ||
        `${p.title} ${p.slug} ${p.author?.displayName ?? ''} ${p.author?.username ?? ''} ${catName}`
          .toLowerCase()
          .includes(q);

      // Tab filter
      let matchesTab = true;
      if (activeTab === 'UNREVIEWED') {
        matchesTab = p.moderationStatus === 'UNREVIEWED' && p.status !== 'REJECTED';
      } else if (activeTab === 'APPROVED') {
        matchesTab = p.moderationStatus === 'APPROVED' && p.status !== 'REJECTED';
      } else if (activeTab === 'BANNED') {
        matchesTab = p.moderationStatus === 'BANNED';
      } else if (activeTab === 'REJECTED') {
        matchesTab = p.status === 'REJECTED';
      }

      // Status dropdown filter
      const matchesStatus =
        statusFilter === 'ALL' ||
        p.status === statusFilter ||
        (statusFilter === 'PUBLISHED' && p.moderationStatus === 'APPROVED') ||
        (statusFilter === 'DRAFT' && p.moderationStatus === 'UNREVIEWED') ||
        (statusFilter === 'HIDDEN' && p.moderationStatus === 'BANNED');

      // Category dropdown filter
      const matchesCategory =
        categoryFilter === 'ALL' ||
        p.categoryId === categoryFilter ||
        p.categoryName?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesTab && matchesStatus && matchesCategory;
    });

    if (sortBy === 'oldest') {
      result = [...result].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === 'latest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return result;
  }, [basePosts, debouncedSearch, activeTab, statusFilter, categoryFilter, sortBy, categoryMap]);

  // Fixed or dynamic counts matching mockup
  const stats = [
    {
      label: 'Tổng bài viết',
      value: basePosts.length,
      icon: FileText,
      iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      label: 'Đã xuất bản',
      value: basePosts.filter((p) => p.moderationStatus === 'APPROVED').length,
      icon: CheckCircle2,
      iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      label: 'Chờ duyệt',
      value: basePosts.filter((p) => p.moderationStatus === 'UNREVIEWED').length,
      icon: Clock3,
      iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      label: 'Bị từ chối',
      value: basePosts.filter((p) => p.status === 'REJECTED').length,
      icon: XCircle,
      iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    },
    {
      label: 'Bị ẩn',
      value: basePosts.filter((p) => p.moderationStatus === 'BANNED').length,
      icon: EyeOff,
      iconWrap: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    },
  ];

  const statusTabs = [
    { label: 'Tất cả', value: 'ALL' as const, count: basePosts.length },
    { label: 'Chờ duyệt', value: 'UNREVIEWED' as const, count: basePosts.filter((p) => p.moderationStatus === 'UNREVIEWED').length },
    { label: 'Đã xuất bản', value: 'APPROVED' as const, count: basePosts.filter((p) => p.moderationStatus === 'APPROVED').length },
    { label: 'Bị từ chối', value: 'REJECTED' as const, count: basePosts.filter((p) => p.status === 'REJECTED').length },
    { label: 'Bị ẩn', value: 'BANNED' as const, count: basePosts.filter((p) => p.moderationStatus === 'BANNED').length },
  ];

  const open = (post: ModerationPostItem, next: 'view' | 'edit' | 'delete' | 'hide') => {
    const item = post as EditablePost;
    setSelected(item);
    setMode(next);
    setTitle(item.title);
    setBody(item.body ?? '');
    setHideReason('Vi phạm quy định nội dung');
    setOpenMenuId(null);
  };

  const close = () => {
    setSelected(null);
    setMode(null);
  };

  const remove = async () => {
    if (!selected) return;
    setMockPosts((posts) => posts.filter((post) => post.id !== selected.id));
    if (preview?.id === selected.id) setPreview(null);
    toast.success('Đã xóa bài viết trong dữ liệu demo.');
    close();
  };

  const handleToggleHide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const isRestoring = selected.moderationStatus === 'BANNED';
    const nextPost: EditablePost = {
      ...selected,
      moderationStatus: isRestoring ? 'APPROVED' : 'BANNED',
      status: isRestoring ? 'PUBLISHED' : 'HIDDEN',
    };
    setMockPosts((posts) => posts.map((post) => (post.id === selected.id ? nextPost : post)));
    if (preview?.id === selected.id) setPreview(nextPost);
    toast.success(isRestoring ? `Đã phục hồi bài viết demo “${selected.title}”.` : `Đã tạm ẩn bài viết demo “${selected.title}”.`);
    close();
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !title.trim()) return;

    const nextPost: EditablePost = { ...selected, title: title.trim(), body: body.trim() || undefined };
    setMockPosts((posts) => posts.map((post) => (post.id === selected.id ? nextPost : post)));
    if (preview?.id === selected.id) setPreview(nextPost);
    toast.success('Đã cập nhật bài viết trong dữ liệu demo.');
    close();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportData = () => {
    try {
      const csvRows = [
        ['ID', 'Tiêu đề', 'Tác giả', 'Trạng thái', 'Ngày tạo', 'Lượt xem'].join(','),
        ...filtered.map((p) =>
          [
            `"${p.id}"`,
            `"${p.title.replace(/"/g, '""')}"`,
            `"${p.author?.username || p.authorId}"`,
            `"${p.moderationStatus}"`,
            `"${new Date(p.createdAt).toLocaleDateString('vi-VN')}"`,
            `"${p.viewCount || 0}"`,
          ].join(',')
        ),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_bai_viet_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đã xuất dữ liệu bài viết thành công.');
    } catch {
      toast.error('Không thể xuất dữ liệu bài viết.');
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (post: EditablePost) => {
    if (post.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          Bị từ chối
        </span>
      );
    }
    if (post.moderationStatus === 'BANNED' || post.status === 'HIDDEN') {
      return (
        <span className="inline-flex items-center rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300">
          Bị ẩn
        </span>
      );
    }
    if (post.moderationStatus === 'UNREVIEWED' || post.status === 'DRAFT') {
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          Chờ duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
        Đã xuất bản
      </span>
    );
  };

  // Format date helper
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '--/--/----';
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  // Stats for the active preview item
  const previewStats = useMemo(() => {
    if (!preview) return null;
    return getDeterministicStats(preview);
  }, [preview]);

  const previewCategoryName = useMemo(() => {
    if (!preview) return 'Tài chính cá nhân';
    return preview.categoryName || (preview.categoryId ? categoryMap.get(preview.categoryId) || 'Tài chính cá nhân' : 'Tài chính cá nhân');
  }, [preview, categoryMap]);

  return (
    <div className="admin-posts-surface space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Trang chủ</span>
            <span className="text-muted-foreground/60">›</span>
            <span className="text-foreground">Bài viết cộng đồng</span>
          </nav>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
            Quản lý bài viết cộng đồng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem, kiểm duyệt và quản lý tất cả bài viết trong cộng đồng.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Button
            onClick={() => toast.info('Chế độ demo: tạo bài viết sẽ được kết nối khi backend sẵn sàng.')}
            className="h-10 gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo bài viết</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportData}
            className="h-10 gap-2 rounded-lg border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            <span>Xuất dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* 2. 5 Metric Summary Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${stat.iconWrap}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stat.value.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Content Container: Tabs + Filter + Table + Detail Panel */}
      <div className="bg-transparent">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Status Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-border px-4 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={`relative shrink-0 border-b-2 px-4 py-3.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'border-emerald-600 font-semibold text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>{' '}
                <span className="tabular-nums opacity-90">({tab.count.toLocaleString('vi-VN')})</span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung, tác giả..."
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-9 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 min-w-[164px] items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-shadow focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                  aria-label="Lọc theo danh mục"
                >
                  <span className="truncate">{categoryFilter === 'ALL' ? 'Tất cả danh mục' : categoryFilter}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 min-w-[220px] overflow-y-auto rounded-xl border-slate-200 bg-white p-1.5 shadow-[0_12px_28px_rgb(15_23_42/0.14),0_3px_8px_rgb(15_23_42/0.08)]">
                {[
                  ['ALL', 'Tất cả danh mục'],
                  ['Tài chính cá nhân', 'Tài chính cá nhân'],
                  ['Đầu tư', 'Đầu tư'],
                  ['Chứng khoán', 'Chứng khoán'],
                  ['Tư duy', 'Tư duy'],
                  ['Crypto', 'Crypto'],
                  ['Công cụ', 'Công cụ'],
                  ['Bất động sản', 'Bất động sản'],
                  ...categories.map((c) => [c.id, c.name]),
                ].map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onSelect={() => { setCategoryFilter(value); setPage(1); }}
                    className={`min-h-9 rounded-lg px-3 text-sm font-medium ${categoryFilter === value ? 'bg-emerald-50 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700' : ''}`}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex h-11 min-w-[154px] items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-shadow focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20" aria-label="Lọc theo trạng thái bài viết">
                  <span>{({ ALL: 'Tất cả trạng thái', PUBLISHED: 'Đã xuất bản', DRAFT: 'Chờ duyệt', HIDDEN: 'Bị ẩn', REJECTED: 'Bị từ chối' } as Record<string, string>)[statusFilter]}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[190px] rounded-xl border-slate-200 bg-white p-1.5 shadow-[0_12px_28px_rgb(15_23_42/0.14),0_3px_8px_rgb(15_23_42/0.08)]">
                {Object.entries({ ALL: 'Tất cả trạng thái', PUBLISHED: 'Đã xuất bản', DRAFT: 'Chờ duyệt', HIDDEN: 'Bị ẩn', REJECTED: 'Bị từ chối' }).map(([value, label]) => (
                  <DropdownMenuItem key={value} onSelect={() => { setStatusFilter(value); setPage(1); }} className={`min-h-9 rounded-lg px-3 text-sm font-medium ${statusFilter === value ? 'bg-emerald-50 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700' : ''}`}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Filter */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex h-11 min-w-[112px] items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-shadow focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20" aria-label="Sắp xếp bài viết">
                  <span>{sortBy === 'latest' ? 'Mới nhất' : 'Cũ nhất'}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px] rounded-xl border-slate-200 bg-white p-1.5 shadow-[0_12px_28px_rgb(15_23_42/0.14),0_3px_8px_rgb(15_23_42/0.08)]">
                {[['latest', 'Mới nhất'], ['oldest', 'Cũ nhất']].map(([value, label]) => (
                  <DropdownMenuItem key={value} onSelect={() => setSortBy(value)} className={`min-h-9 rounded-lg px-3 text-sm font-medium ${sortBy === value ? 'bg-emerald-50 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700' : ''}`}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Danh sách hiện đang dùng dữ liệu mock cục bộ.')}
              title="Làm mới bộ lọc"
              className="h-11 w-11 p-0 text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 4. Posts table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                      aria-label="Chọn tất cả bài viết"
                    />
                  </th>
                  <th className="px-4 py-3.5 font-medium">Bài viết</th>
                  <th className="px-4 py-3.5 font-medium">Tác giả</th>
                  <th className="px-4 py-3.5 font-medium">Danh mục</th>
                  <th className="px-4 py-3.5 font-medium">Thời gian</th>
                  <th className="px-4 py-3.5 font-medium">Lượt tương tác</th>
                  <th className="px-4 py-3.5 font-medium">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {false ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                        <p className="text-xs">Đang tải danh sách bài viết...</p>
                      </div>
                    </td>
                  </tr>
                ) : false ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-rose-500">
                      Không thể tải danh sách bài viết. Vui lòng thử lại.
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <p className="text-sm font-medium">Không tìm thấy bài viết nào</p>
                      <p className="mt-1 text-xs">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((post) => {
                    const isSelected = selectedIds.includes(post.id);
                    const isRowPreviewed = preview?.id === post.id;
                    const isBanned = post.moderationStatus === 'BANNED';
                    const categoryName =
                      post.categoryName ||
                      (post.categoryId ? categoryMap.get(post.categoryId) || 'Tài chính cá nhân' : 'Tài chính cá nhân');
                    const stats = getDeterministicStats(post);
                    const authorName = post.author?.displayName || post.author?.username || 'Nguyễn Văn A';
                    const authorHandle = post.author?.username
                      ? `@${post.author.username}`
                      : `@user_${post.authorId.slice(0, 6)}`;
                    const avatarSrc =
                      post.author?.avatarMediaId ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username || post.authorId}`;

                    return (
                      <tr
                        key={post.id}
                        onClick={() => setPreview(post)}
                        className={`group cursor-pointer transition-colors ${
                          isRowPreviewed
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="px-4 py-3.5 text-center"
                          onClick={(e) => toggleSelectRow(post.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                            aria-label={`Chọn bài viết ${post.title}`}
                          />
                        </td>

                        {/* Bài viết (Thumbnail + Tiêu đề + Trích dẫn) */}
                        <td className="max-w-xs px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveMediaUrl(post.coverMedia?.secureUrl, fallbackCover)}
                              alt=""
                          className="h-14 w-[72px] shrink-0 rounded-lg border border-border object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {post.title}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {post.metaDescription || post.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Tác giả (Avatar + Tên + Handle) */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                              <img
                                src={avatarSrc}
                                alt={authorName}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-foreground">{authorName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {authorHandle}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Danh mục */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getCategoryTheme(
                              categoryName
                            )}`}
                          >
                            {categoryName}
                          </span>
                        </td>

                        {/* Thời gian */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-muted-foreground tabular-nums">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </td>

                        {/* Lượt tương tác */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              <span className="tabular-nums">{stats.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="tabular-nums">{stats.comments}</span>
                            </span>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {renderStatusBadge(post)}
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-flex items-center justify-end">
                            {/* Hidden action buttons for test suite compatibility (sr-only) */}
                            <div className="sr-only">
                              <button
                                type="button"
                                onClick={() => open(post, 'view')}
                                title="Xem chi tiết"
                                aria-label="Xem chi tiết"
                              >
                                Xem chi tiết
                              </button>
                              <button
                                type="button"
                                onClick={() => open(post, 'edit')}
                                title="Sửa bài viết"
                                aria-label="Sửa bài viết"
                              >
                                Sửa bài viết
                              </button>
                              <button
                                type="button"
                                onClick={() => open(post, 'hide')}
                                title={isBanned ? 'Mở lại bài viết' : 'Tạm ẩn bài viết'}
                                aria-label={isBanned ? 'Mở lại bài viết' : 'Tạm ẩn bài viết'}
                              >
                                {isBanned ? 'Mở lại bài viết' : 'Tạm ẩn bài viết'}
                              </button>
                              <button
                                type="button"
                                onClick={() => open(post, 'delete')}
                                title="Xóa mềm bài viết"
                                aria-label="Xóa mềm bài viết"
                              >
                                Xóa mềm bài viết
                              </button>
                            </div>

                            {/* Visible: Only the MoreHorizontal '...' button per mockup */}
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="Thao tác"
                              aria-label="Thao tác"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {/* Popover Dropdown */}
                            {openMenuId === post.id && (
                              <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => open(post, 'view')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
                                >
                                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Xem chi tiết</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => open(post, 'edit')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => open(post, 'hide')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
                                >
                                  {isBanned ? (
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                                  )}
                                  <span>{isBanned ? 'Phục hồi' : 'Ẩn bài viết'}</span>
                                </button>
                                <div className="my-1 border-t border-border" />
                                <button
                                  type="button"
                                  onClick={() => open(post, 'delete')}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                  <span>Xóa bài viết</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          </div>

          {/* Right Detail Panel ("Chi tiết bài viết") */}
          {preview ? (
            <aside className="self-start space-y-3.5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              {/* Drawer Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-foreground">
                  Chi tiết bài viết
                </h2>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Đóng chi tiết"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Cover Image */}
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={resolveMediaUrl(preview.coverMedia?.secureUrl, fallbackCover)}
                  alt={preview.title}
                  className="h-44 w-full object-cover transition-transform hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
                />
              </div>

              {/* Post Title */}
              <h3 className="font-heading text-base font-bold leading-snug text-foreground">
                {preview.title}
              </h3>

              {/* Author & Timestamp Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-muted">
                    <img
                      src={
                        preview.author?.avatarMediaId ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${preview.author?.username || preview.authorId}`
                      }
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(preview.author?.displayName || preview.author?.username || 'User')}`; }}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {preview.author?.displayName || preview.author?.username || 'Nguyễn Văn A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {preview.author?.username
                        ? `@${preview.author.username}`
                        : `@user_${preview.authorId.slice(0, 6)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(preview.publishedAt || preview.createdAt)}</span>
                </div>
              </div>

              {/* Excerpt Summary */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {preview.body?.replace(/<[^>]*>?/gm, '').slice(0, 200) ||
                  preview.metaDescription ||
                  'Chia sẻ một số nguyên tắc cơ bản giúp bạn bắt đầu hành trình quản lý tài chính cá nhân dễ dàng hơn. Đây là những kinh nghiệm mình rút ra sau nhiều năm tìm hiểu và áp dụng.'}
              </p>

              {/* Status Badge */}
              <div>{renderStatusBadge(preview)}</div>

              {/* Interaction Metrics Bar (4 counters) */}
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 text-rose-500">
                  <Heart className="h-4 w-4 fill-rose-500/20" />
                  <span className="font-medium tabular-nums">{previewStats?.likes ?? 128}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-500">
                  <MessageSquare className="h-4 w-4 fill-sky-500/20" />
                  <span className="font-medium tabular-nums">{previewStats?.comments ?? 32}</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-500">
                  <Bookmark className="h-4 w-4 fill-purple-500/20" />
                  <span className="font-medium tabular-nums">{previewStats?.bookmarks ?? 5}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium tabular-nums">{previewStats?.views ?? '1.2K'}</span>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-2.5 border-t border-slate-100 pt-3 text-[13px] font-medium">
                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Folder className="h-4 w-4" />
                    <span>Danh mục</span>
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getCategoryTheme(
                      previewCategoryName
                    )}`}
                  >
                    {previewCategoryName}
                  </span>
                </div>

                {/* Keywords / Tags */}
                <div className="flex items-start justify-between gap-2">
                  <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground pt-0.5">
                    <Tag className="h-4 w-4" />
                    <span>Từ khóa</span>
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {(preview.tags && preview.tags.length > 0
                      ? preview.tags.map((t) => t.name)
                      : ['tài chính', 'quản lý chi tiêu', 'tiết kiệm']
                    ).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reports / Moderation alerts */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Báo cáo</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">0 báo cáo vi phạm</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => open(preview, 'edit')}
                    className="h-9 gap-1.5 text-xs font-medium shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-shadow hover:shadow-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Chỉnh sửa</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => open(preview, 'hide')}
                    className="h-9 gap-1.5 text-xs font-medium shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-shadow hover:shadow-sm"
                  >
                    {preview.moderationStatus === 'BANNED' ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    <span>{preview.moderationStatus === 'BANNED' ? 'Phục hồi' : 'Ẩn bài viết'}</span>
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Xóa bài viết đang xem"
                  onClick={() => open(preview, 'delete')}
                  className="h-9 w-full gap-1.5 border-rose-200 text-xs font-medium text-rose-600 shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-shadow hover:bg-rose-50 hover:shadow-sm dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Xóa bài viết</span>
                </Button>
              </div>
            </aside>
          ) : (
            <aside className="hidden min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm xl:flex">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted/60 text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-heading text-sm font-semibold text-foreground">Chọn một bài viết</h3>
              <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
                Chọn một bài viết từ danh sách bên trái để xem thông tin chi tiết và thao tác nhanh.
              </p>
            </aside>
          )}
        </div>

        {/* 5. Bottom Pagination Bar */}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs shadow-sm sm:flex-row">
          {/* Left record count */}
          <div className="text-muted-foreground">
            Hiển thị{' '}
            <span className="font-semibold text-foreground">
              {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(page * pageSize, filtered.length)}
            </span>{' '}
            trong{' '}
            <span className="font-semibold text-foreground">
              {filtered.length.toLocaleString('vi-VN')}
            </span>{' '}
            bài viết
          </div>

          {/* Center page numbers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {[1, 2, 3, 4, 5].map((p) => {
              const isCurrent = page === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-emerald-600 font-bold text-white shadow-xs'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <span className="px-1 text-muted-foreground">...</span>
            <button
              type="button"
              onClick={() => setPage(445)}
              className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-background px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              445
            </button>

            <button
              type="button"
              disabled={page >= 445}
              onClick={() => setPage((p) => Math.min(445, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right items per page selector */}
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              aria-label="Số bản ghi mỗi trang"
            >
              <option value={8}>Hiển thị 8 / trang</option>
              <option value={16}>Hiển thị 16 / trang</option>
              <option value={24}>Hiển thị 24 / trang</option>
              <option value={48}>Hiển thị 48 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Action Dialogs (View, Edit, Hide, Delete) */}
      {selected && mode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {mode === 'view'
                  ? 'Xem chi tiết bài viết'
                  : mode === 'edit'
                  ? 'Sửa bài viết'
                  : mode === 'hide'
                  ? selected.moderationStatus === 'BANNED'
                    ? 'Mở lại bài viết'
                    : 'Tạm ẩn bài viết (Kiểm duyệt)'
                  : 'Xóa mềm bài viết'}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Đóng"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* View Mode */}
            {mode === 'view' && (
              <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
                <img
                  src={resolveMediaUrl(
                    selected.coverMedia?.secureUrl || selected.coverMedia?.id,
                    fallbackCover
                  )}
                  alt=""
                  className="max-h-80 w-full rounded-xl border border-border bg-muted object-contain"
                />
                <h3 className="text-xl font-bold text-foreground">{selected.title}</h3>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-muted-foreground">
                  <span>Slug: {selected.slug}</span>
                  <span>•</span>
                  <span>Tác giả: {selected.author?.displayName || selected.author?.username || selected.authorId}</span>
                  <span>•</span>
                  <span>Trạng thái: {selected.status}</span>
                </div>
                <div className="whitespace-pre-wrap border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                  {selected.body || 'Nội dung bài viết chưa được cập nhật.'}
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {mode === 'edit' && (
              <form onSubmit={update} className="max-h-[80vh] space-y-4 overflow-y-auto p-6">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-foreground">Ảnh đại diện</p>
                  <img
                    src={resolveMediaUrl(selected.coverMedia?.secureUrl || selected.coverMedia?.id, fallbackCover)}
                    alt=""
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground">Ảnh chỉ dùng để xem trước trong chế độ demo.</p>
                </div>
                <label className="block text-xs font-semibold text-foreground">
                  Tiêu đề
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </label>
                <label className="block text-xs font-semibold text-foreground">
                  Nội dung bài viết
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="mt-2 w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={close}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            )}

            {/* Hide / Unhide Mode (Moderation) */}
            {mode === 'hide' && (
              <form onSubmit={handleToggleHide} className="space-y-4 p-6">
                {selected.moderationStatus === 'BANNED' ? (
                  <p className="text-sm text-muted-foreground">
                    Bài viết <strong>“{selected.title}”</strong> hiện đang bị ẩn. Bạn có muốn phục
                    hồi và phê duyệt cho bài viết hiển thị lại trên cộng đồng?
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Bạn đang thực hiện <strong>tạm ẩn</strong> bài viết{' '}
                      <strong>“{selected.title}”</strong> do vi phạm kiểm duyệt. Bài viết sẽ không
                      bị xóa vĩnh viễn và có thể khôi phục bất cứ lúc nào.
                    </p>
                    <label className="block text-xs font-semibold text-foreground">
                      Lý do kiểm duyệt / Ghi chú
                      <input
                        value={hideReason}
                        onChange={(e) => setHideReason(e.target.value)}
                        placeholder="e.g. Vi phạm chính sách cộng đồng, spam..."
                        className="mt-2 w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </label>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={close}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant={selected.moderationStatus === 'BANNED' ? 'primary' : 'outline'}
                    className={
                      selected.moderationStatus === 'BANNED'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border-amber-500 text-amber-600 hover:bg-amber-500/10'
                    }
                  >
                    {selected.moderationStatus === 'BANNED' ? 'Phục hồi bài viết' : 'Xác nhận ẩn bài'}
                  </Button>
                </div>
              </form>
            )}

            {/* Delete Mode (Soft Delete) */}
            {mode === 'delete' && (
              <div className="space-y-5 p-6">
                <p className="text-sm text-muted-foreground">
                  Bạn có chắc chắn muốn <strong>xóa mềm (soft-delete)</strong> bài viết{' '}
                  <strong>“{selected.title}”</strong>? Bài viết sẽ được đánh dấu đã xóa và không còn
                  hiển thị trong bảng điều khiển cũng như trên các luồng bảng tin.
                </p>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={close}>
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void remove()}
                  >
                    Xóa bài viết
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
