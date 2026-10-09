import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  Eye,
  GraduationCap,
  HeartPulse,
  Landmark,
  Layers,
  Medal,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { postsService } from '@/lib/posts/posts-service';
import { courseService } from '@/lib/courses/course-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { AppShell } from '@/components/layout/AppShell';

interface DomainPageProps {
  params: Promise<{ domainSlug: string }>;
}

function getDomainMeta(codeOrSlug: string) {
  const norm = (codeOrSlug || '').toLowerCase();
  if (norm.includes('money') || norm.includes('tai-chinh')) {
    return {
      icon: CircleDollarSign,
      accentBg: 'from-emerald-950 via-teal-900 to-emerald-900',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      tagline: 'Quản lý tài chính cá nhân, đầu tư thực chiến & tự do tài chính',
      description:
        'Hệ thống kiến thức quản lý tiền bạc khoa học, thiết lập ngân sách thông minh, chiến lược đầu tư chứng khoán và kế hoạch tự do tài chính bền vững.',
      isFinance: true,
    };
  }
  if (norm.includes('business') || norm.includes('kinh-doanh')) {
    return {
      icon: BriefcaseBusiness,
      accentBg: 'from-blue-950 via-indigo-900 to-sky-900',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      tagline: 'Khởi nghiệp, quản trị doanh nghiệp và chiến lược thị trường',
      description:
        'Phương pháp xây dựng mô hình kinh doanh tinh gọn, quản trị vận hành, bán hàng và tối ưu chiến lược phát triển công ty.',
      isFinance: false,
    };
  }
  if (norm.includes('tech') || norm.includes('technology') || norm.includes('cong-nghe')) {
    return {
      icon: Sparkles,
      accentBg: 'from-purple-950 via-violet-900 to-fuchsia-900',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      tagline: 'Kỹ năng số, ứng dụng AI và công nghệ tương lai',
      description:
        'Ứng dụng trí tuệ nhân tạo (AI), tự động hóa quy trình và làm chủ các công cụ công nghệ mới nhất để gia tăng năng suất vượt trội.',
      isFinance: false,
    };
  }
  if (norm.includes('career') || norm.includes('nghe-nghiep')) {
    return {
      icon: GraduationCap,
      accentBg: 'from-amber-950 via-orange-900 to-yellow-900',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      tagline: 'Phương pháp học tập sâu, kỹ năng nghề nghiệp & đàm phán',
      description:
        'Phát triển năng lực chuyên môn, kỹ năng giao tiếp, nghệ thuật đàm phán và xây dựng lộ trình sự nghiệp thăng tiến dài hạn.',
      isFinance: false,
    };
  }
  if (norm.includes('life') || norm.includes('doi-song')) {
    return {
      icon: HeartPulse,
      accentBg: 'from-rose-950 via-pink-900 to-red-900',
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      tagline: 'Sức khỏe thể chất, tinh thần và thói quen tích cực',
      description:
        'Duy trì năng lượng bền bỉ, cân bằng công việc - cuộc sống và xây dựng kỷ luật bản thân cho hành trình phát triển toàn diện.',
      isFinance: false,
    };
  }
  return {
    icon: Medal,
    accentBg: 'from-teal-950 via-emerald-900 to-cyan-900',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    tagline: 'Rèn luyện thể lực, thể thao và lối sống vận động',
    description:
      'Nâng cao thể lực, thói quen vận động mỗi ngày và rèn luyện ý chí kiên định thông qua các bộ môn thể thao.',
    isFinance: false,
  };
}

async function getDomain(slug: string) {
  const domains = await postsService.getDomains();
  return domains.find((domain) => domain.slug === slug && domain.isActive);
}

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const { domainSlug } = await params;
  const domain = await getDomain(domainSlug);
  if (!domain) return buildPageMetadata({ title: 'Không tìm thấy lĩnh vực', noIndex: true });

  const meta = getDomainMeta(domain.code || domain.slug);
  return buildPageMetadata({
    title: `${domain.nameVi || domain.name} — Trung tâm kiến thức & Lộ trình học | BrewSeven`,
    description: domain.description || meta.description,
    canonicalPath: `/${domain.slug}`,
  });
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { domainSlug } = await params;
  const domain = await getDomain(domainSlug);
  if (!domain) notFound();

  // Parallel fetch: feed articles, all domains (for footer switcher), and course series
  const [feedResult, allDomainsResult, coursesResult] = await Promise.all([
    postsService.getFeed({ domainId: domain.id, limit: 12 }),
    postsService.getDomains({ includeInactive: false }).catch(() => []),
    courseService.getAllCourses({ limit: 6 }).catch(() => ({ data: [] })),
  ]);

  const domainMeta = getDomainMeta(domain.code || domain.slug);
  const DomainIcon = domainMeta.icon;
  const articles = feedResult.data || [];
  const otherDomains = (allDomainsResult || [])
    .filter((d) => d.id !== domain.id && d.code !== 'GENERAL')
    .slice(0, 5);

  // Relevant courses for this domain
  const relevantCourses = (coursesResult?.data || []).slice(0, 3);

  return (
    <AppShell mainClassName="w-full max-w-none space-y-12">
      {/* 1. DOMAIN HERO BANNER */}
      <section className="relative overflow-hidden rounded-[14px] border border-border bg-card shadow-sm">
        {/* Decorative background glow */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-gradient-to-br ${domainMeta.accentBg} opacity-95 dark:opacity-85`}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-white">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm font-semibold text-white/90">
            <Link href="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4 opacity-75" />
            <Link href="/kham-pha" className="transition hover:text-white">
              Lĩnh vực
            </Link>
            <ChevronRight className="h-4 w-4 opacity-75" />
            <span className="text-white font-bold">{domain.nameVi || domain.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-black tracking-wider backdrop-blur-sm">
              <DomainIcon className="h-4 w-4" />
              <span>{domain.code || 'CHUYÊN ĐỀ'} · LĨNH VỰC CỐT LÕI</span>
            </div>

            <h1 className="mt-4 font-heading text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {domain.nameVi || domain.name}
            </h1>

            <p className="mt-3.5 text-lg font-bold text-emerald-200 sm:text-xl">
              {domainMeta.tagline}
            </p>

            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/95 font-medium sm:text-lg">
              {domain.description || domainMeta.description}
            </p>

            {/* Quick Metrics */}
            <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <div className="rounded-[12px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <span className="block text-3xl font-black text-white">
                  {domain.courseCount && domain.courseCount > 0 ? domain.courseCount : '4'}
                </span>
                <span className="mt-1 block text-sm font-bold text-white/90">Khóa học chuyên sâu</span>
              </div>
              <div className="rounded-[12px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <span className="block text-3xl font-black text-white">
                  {articles.length > 0 ? `${articles.length}+` : '18+'}
                </span>
                <span className="mt-1 block text-sm font-bold text-white/90">Bài giảng & nghiên cứu</span>
              </div>
              <div className="rounded-[12px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <span className="block text-3xl font-black text-white">
                  {domain.categoryCount && domain.categoryCount > 0 ? domain.categoryCount : '6'}
                </span>
                <span className="mt-1 block text-sm font-bold text-white/90">Chủ đề phân loại</span>
              </div>
              <div className="rounded-[12px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <span className="block text-3xl font-black text-white">2.4k+</span>
                <span className="mt-1 block text-sm font-bold text-white/90">Học viên tham gia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHÓA HỌC & LỘ TRÌNH TRỌNG TÂM */}
      <section aria-labelledby="featured-courses-heading" className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" /> Lộ trình học bài bản
            </div>
            <h2 id="featured-courses-heading" className="mt-1 font-heading text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Khóa học trọng tâm trong lĩnh vực
            </h2>
          </div>
          <Link
            href="/khoa-hoc"
            className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span>Tất cả khóa học</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relevantCourses.map((course, idx) => (
            <Link
              key={course.id || course.slug}
              href={`/khoa-hoc/${encodeURIComponent(course.slug)}`}
              className="group flex flex-col justify-between overflow-hidden rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {idx === 0 ? 'NỔI BẬT' : 'LỘ TRÌNH CỐT LÕI'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {course.publishedArticleCount && course.publishedArticleCount > 0
                      ? `${course.publishedArticleCount} bài học`
                      : '10 bài học'}
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-600 sm:text-[22px] dark:text-white dark:group-hover:text-emerald-400">
                  {course.name}
                </h3>

                <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-300">
                  {course.description ||
                    'Lộ trình từng bước giúp bạn nắm chắc bản chất, xây nền tảng và tự tin áp dụng vào thực tế.'}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-black text-emerald-700 sm:text-base dark:border-slate-800 dark:text-emerald-400">
                <span>Bắt đầu học lộ trình</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CÔNG CỤ TÀI CHÍNH THỰC CHIẾN (Hiển thị cho lĩnh vực Tài chính) */}
      {domainMeta.isFinance && (
        <section aria-labelledby="financial-tools-heading" className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Calculator className="h-4 w-4" /> Thực hành tính toán
              </div>
              <h2 id="financial-tools-heading" className="mt-1 font-heading text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                Công cụ tài chính thực chiến
              </h2>
            </div>
            <Link
              href="/cong-cu"
              className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <span>Xem tất cả công cụ</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Link
              href="/cong-cu/lai-kep"
              className="group flex flex-col justify-between rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-600 sm:text-xl dark:text-white dark:group-hover:text-emerald-400">
                  Bảng tính Lãi kép & Hưu trí
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-300">
                  Mô phỏng sức mạnh của lãi kép, ước tính tăng trưởng tài sản và thiết lập mục tiêu hưu trí tự do.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-black text-emerald-700 sm:text-base dark:text-emerald-400">
                <span>Tính toán ngay</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/cong-cu/tinh-khoan-vay"
              className="group flex flex-col justify-between rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-600"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <Landmark className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600 sm:text-xl dark:text-white dark:group-hover:text-blue-400">
                  Tính Khoản vay Trả góp
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-300">
                  Lập lịch trả nợ vay mua nhà, xe theo phương pháp dư nợ giảm dần hoặc cố định gốc hàng tháng.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-black text-blue-600 sm:text-base dark:text-blue-400">
                <span>Lập kế hoạch vay</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/cong-cu/dinh-gia-co-phieu"
              className="group flex flex-col justify-between rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-600"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 transition-colors group-hover:text-violet-600 sm:text-xl dark:text-white dark:group-hover:text-violet-400">
                  Định giá Nhanh Cổ phiếu
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-300">
                  Áp dụng mô hình P/E Multiples & Chiết khấu cổ tức Gordon, tính toán biên an toàn chiết khấu 20%.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-black text-violet-600 sm:text-base dark:text-violet-400">
                <span>Định giá mã cổ phiếu</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* 4. BÀI VIẾT & NGHIÊN CỨU CHUYÊN SÂU */}
      <section aria-labelledby="domain-posts-heading" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Layers className="h-4 w-4" /> Thư viện tri thức
            </div>
            <h2 id="domain-posts-heading" className="mt-1 font-heading text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Bài viết & Nghiên cứu mới nhất
            </h2>
          </div>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {articles.length} nội dung được xuất bản
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-slate-300 bg-white p-14 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-base font-bold">Chưa có bài viết nào được xuất bản trong lĩnh vực này.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {articles.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="rounded-md border border-emerald-300/50 bg-emerald-100/80 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {post.contentType === 'SERIES' ? 'Bài học khóa học' : 'Bài viết'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                      <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      {post.viewCount || 100} lượt đọc
                    </span>
                  </div>

                  <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-slate-950 transition-colors group-hover:text-emerald-600 sm:text-[22px] dark:text-white dark:group-hover:text-emerald-400">
                    <Link href={`/${domain.slug}/bai-viet/${encodeURIComponent(post.slug)}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {post.metaDescription && (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-300">
                      {post.metaDescription}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                    <UsersRound className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{post.author?.displayName || post.author?.username || 'Ban biên tập BrewSeven'}</span>
                  </div>

                  <Link
                    href={`/${domain.slug}/bai-viet/${encodeURIComponent(post.slug)}`}
                    className="inline-flex items-center gap-1.5 font-black text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    <span>Đọc bài viết</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. KHÁM PHÁ CÁC LĨNH VỰC KHÁC */}
      {otherDomains.length > 0 && (
        <section aria-labelledby="other-domains-heading" className="space-y-5 border-t border-slate-200 pt-10 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 id="other-domains-heading" className="font-heading text-xl font-bold text-slate-900 dark:text-white">
              Khám phá các lĩnh vực khác
            </h2>
            <Link
              href="/kham-pha"
              className="text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Xem tất cả lĩnh vực →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {otherDomains.map((d) => {
              const otherMeta = getDomainMeta(d.code || d.slug);
              const OtherIcon = otherMeta.icon;
              return (
                <Link
                  key={d.id || d.slug}
                  href={`/${d.slug}`}
                  className="group flex flex-col items-center justify-center rounded-[12px] border border-slate-200 bg-white p-5 text-center shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-[12px] border ${otherMeta.badgeColor}`}>
                    <OtherIcon className="h-6 w-6" />
                  </span>
                  <span className="mt-3 text-sm font-extrabold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    {d.nameVi || d.name}
                  </span>
                  <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {d.courseCount ? `${d.courseCount} khóa học` : 'Kiến thức cốt lõi'}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
