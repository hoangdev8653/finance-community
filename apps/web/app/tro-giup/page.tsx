'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Search,
  ChevronDown,
  UserCheck,
  BookOpen,
  MessageSquare,
  Calculator,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';

interface FAQItem {
  id: string;
  category: 'auth' | 'series' | 'community' | 'tools';
  question: string;
  answer: string;
}

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: Sparkles },
  { id: 'auth', label: 'Tài khoản & Bảo mật', icon: UserCheck },
  { id: 'series', label: 'Khóa học & Lộ trình', icon: BookOpen },
  { id: 'community', label: 'Cộng đồng & Đăng bài', icon: MessageSquare },
  { id: 'tools', label: 'Công cụ tài chính', icon: Calculator },
] as const;

const FAQ_DATA: FAQItem[] = [
  // 1. Tài khoản & Bảo mật
  {
    id: 'auth-1',
    category: 'auth',
    question: 'Tôi có thể đăng ký tài khoản bằng những phương thức nào?',
    answer:
      `Bạn có thể đăng ký nhanh chóng bằng địa chỉ Email hoặc đăng nhập 1-chạm thông qua Google và Facebook. Việc đăng ký tài khoản là hoàn toàn miễn phí và giúp bạn mở khóa quyền lưu bài viết, theo dõi tiến độ học tập và tham gia thảo luận.`,
  },
  {
    id: 'auth-2',
    category: 'auth',
    question: 'Làm thế nào để khôi phục mật khẩu nếu tôi bị quên?',
    answer:
      `Bạn chỉ cần truy cập trang Đăng nhập và bấm vào "Quên mật khẩu?" hoặc vào trực tiếp trang /quen-mat-khau, sau đó nhập địa chỉ email đã đăng ký. Hệ thống sẽ tự động gửi cho bạn một đường dẫn an toàn để tạo mật khẩu mới.`,
  },
  {
    id: 'auth-3',
    category: 'auth',
    question: 'Tại sao tôi cần xác thực địa chỉ email?',
    answer:
      `Xác thực email giúp bảo vệ quyền sở hữu tài khoản, chống spam và đảm bảo bạn nhận được các thông báo cập nhật bài học quan trọng cũng như khôi phục tài khoản khi cần thiết.`,
  },
  {
    id: 'auth-4',
    category: 'auth',
    question: 'Thông tin cá nhân của tôi có được bảo mật không?',
    answer:
      `Tại ${BRAND.name}, mọi mật khẩu đều được băm bằng thuật toán Bcrypt một chiều và thông tin kết nối qua giao thức mã hóa HTTPS/SSL. Chúng tôi cam kết tuyệt đối không chia sẻ hay bán thông tin thành viên cho bên thứ ba.`,
  },

  // 2. Khóa học & Lộ trình
  {
    id: 'series-1',
    category: 'series',
    question: 'Các series bài học trên nền tảng có mất phí không?',
    answer:
      `Hiện tại phần lớn các series bài học kiến thức nền tảng (như Quản lý tài chính cá nhân, Lập quỹ khẩn cấp, Đọc báo cáo tài chính căn bản) đều được phát hành hoàn toàn miễn phí cho cộng đồng.`,
  },
  {
    id: 'series-2',
    category: 'series',
    question: 'Làm thế nào để lưu tiến độ và đánh dấu bài đã học?',
    answer:
      `Khi bạn đăng nhập tài khoản và học theo các Lộ trình học (/lo-trinh-hoc), hệ thống sẽ tự động ghi nhận bài học bạn vừa hoàn thành, tính toán % tiến độ và đề xuất bài học kế tiếp cho bạn.`,
  },
  {
    id: 'series-3',
    category: 'series',
    question: 'Nội dung bài học do ai biên soạn và thẩm định?',
    answer:
      `Tất cả các series bài học học thuật được biên soạn và kiểm chứng nghiêm ngặt bởi ${BRAND.editorialDesk} cùng các chuyên gia có chứng chỉ chuyên môn tài chính (CFA, CPA hoặc kinh nghiệm thực chiến trên thị trường).`,
  },

  // 3. Cộng đồng & Đăng bài
  {
    id: 'community-1',
    category: 'community',
    question: 'Ai có quyền viết và xuất bản bài viết trên Cộng đồng?',
    answer:
      `Mọi thành viên đã đăng nhập và xác thực email đều có quyền sử dụng Post Studio để soạn thảo nhận định, phân tích hoặc câu hỏi thảo luận.`,
  },
  {
    id: 'community-2',
    category: 'community',
    question: 'Bài viết của tôi có được kiểm duyệt trước khi hiển thị không?',
    answer:
      `Để đảm bảo chất lượng tri thức và bảo vệ độc giả khỏi các hành vi lừa đảo/phím hàng thao túng, bài viết mới sẽ qua bộ lọc chống spam tự động và được Đội ngũ Kiểm duyệt (Moderation Desk) duyệt nhanh trong vòng 1-4 giờ làm việc.`,
  },
  {
    id: 'community-3',
    category: 'community',
    question: 'Tính năng tự động lưu nháp (Autosave) hoạt động như thế nào?',
    answer:
      `Khi bạn soạn bài tại Post Studio, nội dung sẽ được tự động lưu tạm thời vào trình duyệt sau mỗi 30 giây. Ngay cả khi mất kết nối mạng hoặc đóng tab nhầm, bạn vẫn có thể khôi phục lại toàn bộ bài viết khi mở lại.`,
  },

  // 4. Công cụ tài chính
  {
    id: 'tools-1',
    category: 'tools',
    question: 'Bảng tính Lãi kép và Khoản vay áp dụng công thức nào?',
    answer:
      `Các công cụ tính toán tại mục /cong-cu áp dụng công thức Toán tài chính chuẩn quốc tế về dòng tiền đều (Annuity), lãi kép liên tục và lịch thanh toán nợ gốc/lãi theo dư nợ thực tế giảm dần.`,
  },
  {
    id: 'tools-2',
    category: 'tools',
    question: 'Dữ liệu chỉ số thị trường (Market Ticker) cập nhật từ đâu?',
    answer:
      `Dữ liệu chỉ số VN-Index, Crypto (BTC, ETH) và tỷ giá vàng được tổng hợp và đồng bộ thời gian thực từ các nguồn dữ liệu tài chính tin cậy để độc giả có góc nhìn thị trường bao quát nhất.`,
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'auth-1': true,
    'series-1': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <AppShell mainClassName="max-w-5xl">
      <div className="space-y-8">
        <PageHeader
          icon={HelpCircle}
          label="Hỗ trợ & Hướng dẫn"
          title="Trung tâm trợ giúp & Hỏi đáp (FAQ)"
          subtitle={`Giải đáp chi tiết các thắc mắc về khóa học, tài khoản, quy trình viết bài và sử dụng các công cụ tài chính trên ${BRAND.name}.`}
        />

        {/* Search Hero Box */}
        <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 shadow-xs dark:border-slate-800 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-8">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
              Bạn đang cần tìm thông tin gì?
            </h2>
            <div className="relative">
              <Input
                type="search"
                placeholder="Nhập từ khóa cần tìm (vd: đổi mật khẩu, tiến độ học, đăng bài, lãi kép...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border-slate-300/80 bg-white pl-11 pr-4 text-sm shadow-xs dark:border-slate-700 dark:bg-slate-950"
              />
              <Search
                className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 border border-border'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => {
              const isOpen = !!openItems[item.id];
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50/70 sm:p-5 dark:hover:bg-slate-800/50"
                  >
                    <span className="font-heading text-sm sm:text-base font-semibold text-slate-950 dark:text-slate-100">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-transform duration-200 dark:bg-slate-800 dark:text-slate-400',
                        isOpen && 'rotate-180 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 pb-5 pt-3.5 sm:px-5 dark:border-slate-800">
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">
                Không tìm thấy kết quả phù hợp cho &quot;{searchQuery}&quot;
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hãy thử tìm với các từ khóa thông dụng khác hoặc duyệt theo danh mục phía trên.
              </p>
            </div>
          )}
        </div>

        {/* Contact Support Callout */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 dark:border-emerald-950 dark:bg-emerald-950/20 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Mail className="h-4 w-4" />
                <span>Bạn vẫn cần trợ giúp?</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Chưa tìm thấy câu trả lời cho tình huống của bạn?
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Đội ngũ hỗ trợ và biên tập viên của {BRAND.name} luôn sẵn sàng lắng nghe và giải đáp mọi vấn đề của bạn trong vòng 24 giờ.
              </p>
            </div>

            <Button asChild className="shrink-0 bg-primary font-semibold text-primary-foreground shadow-xs">
              <Link href="/lien-he" className="inline-flex items-center gap-2">
                <span>Liên hệ Tòa soạn</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
