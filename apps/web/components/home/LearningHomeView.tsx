"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  Flame,
  HeartPulse,
  Landmark,
  Lightbulb,
  Medal,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  UsersRound,
} from "lucide-react";
import { BRAND } from "@/lib/constants/brand";
import { postsService } from "@/lib/posts/posts-service";
import { seriesService } from "@/lib/series/series-service";

const DEFAULT_CATEGORIES = [
  [
    "Quản lý tài chính\ncá nhân",
    CircleDollarSign,
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    "tai-chinh-ca-nhan",
  ],
  [
    "Đầu tư\nchứng khoán",
    BarChart3,
    "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
    "chung-khoan",
  ],
  [
    "Đầu tư\ncrypto",
    CircleDollarSign,
    "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    "crypto",
  ],
  [
    "Kinh doanh\n& Khởi nghiệp",
    BriefcaseBusiness,
    "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400",
    "kinh-doanh",
  ],
  [
    "Kỹ năng\nmềm",
    Lightbulb,
    "bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400",
    "ky-nang-mem",
  ],
  [
    "Công cụ tài chính\n& Excel",
    FileSpreadsheet,
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    "cong-cu-tai-chinh",
  ],
  [
    "Pháp lý\n& Thuế",
    Landmark,
    "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    "phap-ly-thue",
  ],
  [
    "Công nghệ\n& AI",
    Lightbulb,
    "bg-orange-50 text-orange-500 dark:bg-orange-950/60 dark:text-orange-400",
    "cong-nghe-ai",
  ],
  [
    "Sức khỏe\n& Cuộc sống",
    HeartPulse,
    "bg-red-50 text-red-500 dark:bg-red-950/60 dark:text-red-400",
    "suc-khoe",
  ],
] as const;

const DEFAULT_SERIES = [
  [
    "Quản lý tài chính cá nhân\ncho người mới bắt đầu",
    "12 bài học",
    "Hoàng Huy",
    "from-emerald-100 via-lime-50 to-white dark:from-emerald-900/60 dark:via-slate-800 dark:to-slate-900",
    "quan-ly-tai-chinh-ca-nhan",
  ],
  [
    "Đầu tư chứng khoán\nthực chiến A-Z",
    "18 bài học",
    "Trần Minh",
    "from-slate-950 via-teal-900 to-slate-800",
    "dau-tu-chung-khoan-a-z",
  ],
  [
    "Crypto từ cơ bản\nđến nâng cao",
    "15 bài học",
    "Phạm Linh",
    "from-amber-900 via-amber-700 to-slate-900",
    "crypto-co-ban-den-nang-cao",
  ],
  [
    "Khởi nghiệp tinh gọn\nvới nguồn lực nhỏ",
    "10 bài học",
    "Lê Anh",
    "from-orange-50 via-rose-50 to-white dark:from-orange-950/60 dark:via-slate-800 dark:to-slate-900",
    "khoi-nghiep-tinh-gon",
  ],
  [
    "Excel tài chính\nứng dụng thực tế",
    "14 bài học",
    "Hoàng Huy",
    "from-cyan-100 via-slate-100 to-white dark:from-cyan-950/60 dark:via-slate-800 dark:to-slate-900",
    "excel-tai-chinh",
  ],
] as const;

const DEFAULT_COMMUNITY_ITEMS = [
  {
    title: "Kinh nghiệm xây dựng quỹ khẩn cấp 6 tháng thu nhập",
    author: "Nguyễn Văn A",
    views: 1240,
    comments: 32,
    likes: 128,
  },
  {
    title: "Có nên đầu tư vào bất động sản lúc này?",
    author: "Trần Thị B",
    views: 980,
    comments: 45,
    likes: 96,
  },
  {
    title: "Kinh nghiệm học phân tích kỹ thuật hiệu quả",
    author: "Lê Minh C",
    views: 850,
    comments: 28,
    likes: 78,
  },
];

const TINTS = [
  "from-emerald-100 via-lime-50 to-white dark:from-emerald-900/60 dark:via-slate-800 dark:to-slate-900",
  "from-slate-950 via-teal-900 to-slate-800",
  "from-amber-900 via-amber-700 to-slate-900",
  "from-orange-50 via-rose-50 to-white dark:from-orange-950/60 dark:via-slate-800 dark:to-slate-900",
  "from-cyan-100 via-slate-100 to-white dark:from-cyan-950/60 dark:via-slate-800 dark:to-slate-900",
];

function getCategoryIconAndTone(nameOrSlug: string): { icon: typeof CircleDollarSign; tone: string } {
  const normalized = (nameOrSlug || "").toLowerCase();
  if (normalized.includes("chứng khoán") || normalized.includes("chung-khoan") || normalized.includes("stock")) {
    return { icon: BarChart3, tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400" };
  }
  if (normalized.includes("crypto") || normalized.includes("tiền điện tử") || normalized.includes("coin")) {
    return { icon: CircleDollarSign, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" };
  }
  if (normalized.includes("kinh doanh") || normalized.includes("khởi nghiệp") || normalized.includes("business")) {
    return { icon: BriefcaseBusiness, tone: "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400" };
  }
  if (normalized.includes("kỹ năng") || normalized.includes("ky-nang") || normalized.includes("skill")) {
    return { icon: Lightbulb, tone: "bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400" };
  }
  if (normalized.includes("công cụ") || normalized.includes("excel") || normalized.includes("tool")) {
    return { icon: FileSpreadsheet, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" };
  }
  if (normalized.includes("pháp lý") || normalized.includes("thuế") || normalized.includes("tax")) {
    return { icon: Landmark, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" };
  }
  if (normalized.includes("công nghệ") || normalized.includes("ai") || normalized.includes("tech")) {
    return { icon: Lightbulb, tone: "bg-orange-50 text-orange-500 dark:bg-orange-950/60 dark:text-orange-400" };
  }
  if (normalized.includes("sức khỏe") || normalized.includes("đời sống") || normalized.includes("health")) {
    return { icon: HeartPulse, tone: "bg-red-50 text-red-500 dark:bg-red-950/60 dark:text-red-400" };
  }
  return { icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" };
}


function Heading({
  title,
  href,
  label,
}: {
  title: string;
  href: string;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function LearningHomeView() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // 1. Fetch categories from backend API
  const { data: remoteCategories } = useQuery({
    queryKey: ["home", "categories"],
    queryFn: () => postsService.getCategories(),
    staleTime: 60 * 1000,
  });

  // 2. Fetch series from backend API
  const { data: remoteSeries } = useQuery({
    queryKey: ["home", "series"],
    queryFn: () => seriesService.getAllSeries({ limit: 5 }),
    staleTime: 60 * 1000,
  });

  // 3. Fetch community posts from backend API
  const { data: remotePosts } = useQuery({
    queryKey: ["home", "community-posts"],
    queryFn: () => postsService.getFeed({ contentType: "COMMUNITY", limit: 3 }),
    staleTime: 60 * 1000,
  });

  // Resolve display categories with graceful fallback
  const displayCategories = useMemo(() => {
    if (remoteCategories && remoteCategories.length > 0) {
      return remoteCategories.slice(0, 9).map((cat) => {
        const { icon: Icon, tone } = getCategoryIconAndTone(cat.name || cat.slug);
        return {
          id: cat.id,
          label: cat.name,
          slug: cat.slug,
          href: `/danh-muc/${cat.slug}`,
          Icon,
          tone,
        };
      });
    }
    return DEFAULT_CATEGORIES.map(([label, Icon, tone, slug]) => ({
      id: slug,
      label,
      slug,
      href: `/danh-muc/${slug}`,
      Icon,
      tone,
    }));
  }, [remoteCategories]);

  // Resolve display series with graceful fallback
  const displaySeries = useMemo(() => {
    if (remoteSeries?.data && remoteSeries.data.length > 0) {
      return remoteSeries.data.slice(0, 5).map((item, index) => ({
        id: item.id,
        title: item.name,
        slug: item.slug,
        href: `/series/${item.slug}`,
        lessons: `${item.publishedArticleCount ?? 0} bài học`,
        author: "Chuyên gia",
        tint: TINTS[index % TINTS.length],
      }));
    }
    return DEFAULT_SERIES.map(([title, lessons, author, tint, slug]) => ({
      id: slug,
      title,
      slug,
      href: `/series/${slug}`,
      lessons,
      author,
      tint,
    }));
  }, [remoteSeries]);

  // Resolve community posts with graceful fallback
  const displayCommunityPosts = useMemo(() => {
    if (remotePosts?.data && remotePosts.data.length > 0) {
      return remotePosts.data.slice(0, 3).map((post) => ({
        id: post.id,
        title: post.title,
        href: `/bai-viet/cong-dong/${post.slug}`,
        author: post.author?.displayName || post.author?.username || "Thành viên",
        views: post.viewCount || 0,
      }));
    }
    return DEFAULT_COMMUNITY_ITEMS.map((item) => ({
      id: item.title,
      title: item.title,
      href: "/bai-viet/cong-dong",
      author: item.author,
      views: item.views,
      comments: item.comments,
      likes: item.likes,
    }));
  }, [remotePosts]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    router.push(
      query.trim()
        ? `/tim-kiem?q=${encodeURIComponent(query.trim())}`
        : "/tim-kiem",
    );
  };

  return (
    <main id="main-content" className="bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 xl:py-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1.03fr_1fr] lg:gap-12">
          <div className="max-w-[610px]">
            <h1 className="text-4xl font-extrabold leading-[1.3] tracking-tight text-foreground sm:text-[42px]">
              Học kiến thức tài chính
              <br />
              thực tiễn, phát triển mỗi ngày
            </h1>
            <p className="mt-5 max-w-[540px] text-base font-medium leading-7 text-muted-foreground">
              Khám phá các khóa học chất lượng, bài học thực tế và cộng đồng hỗ
              trợ bạn trên hành trình tự do tài chính.
            </p>
            <form
              onSubmit={search}
              className="mt-8 flex h-14 max-w-[540px] overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <Search className="my-auto ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Tìm kiếm bài học"
                placeholder="Tìm kiếm bài học, series, chủ đề..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:font-semibold placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="m-1 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-md bg-[#139950] text-[#e4e9e6] shadow-sm transition-[background-color,transform,box-shadow] duration-200 ease-out hover:bg-[#108747] hover:shadow-md active:translate-y-px active:bg-[#0d783e]"
              >
                <Search className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </form>
            <div className="mt-8 grid max-w-[560px] grid-cols-2 gap-5 sm:grid-cols-4">
              {[
                [BookOpen, "1,248", "Bài học", "text-emerald-600 dark:text-emerald-400"],
                [BriefcaseBusiness, "156", "Series", "text-blue-600 dark:text-blue-400"],
                [UsersRound, "12,589", "Thành viên", "text-violet-600 dark:text-violet-400"],
                [Star, "4.9/5", "Đánh giá", "text-amber-500 dark:text-amber-400"],
              ].map(([Icon, value, label, color]) => {
                const I = Icon as typeof BookOpen;
                return (
                  <div
                    key={label as string}
                    className="flex items-center gap-2.5"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card shadow-xs ${color as string}`}
                    >
                      <I className="h-5 w-5" />
                    </span>
                    <span>
                      <strong className="block text-sm font-bold text-foreground">
                        {value as string}
                      </strong>
                      <small className="block text-xs font-medium text-muted-foreground">
                        {label as string}
                      </small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative min-h-[340px] rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 via-[#f4fbf7] to-emerald-100/80 sm:min-h-[370px] lg:min-h-[385px] dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-800/80">
            <Image
              src="/images/home-hero-books.png"
              alt=""
              aria-hidden="true"
              width={1416}
              height={1111}
              sizes="(min-width: 1024px) 145px, 0px"
              className="pointer-events-none absolute bottom-[-4%] left-[-9.5%] z-20 hidden h-auto w-[22%] max-w-[145px] rotate-[-4deg] select-none lg:block"
            />
            <Image
              src="/images/home-hero-plant.png"
              alt=""
              aria-hidden="true"
              width={1215}
              height={1295}
              sizes="(min-width: 1024px) 125px, 0px"
              className="pointer-events-none absolute bottom-[-2%] right-[-7%] z-20 hidden h-auto w-[18%] max-w-[124px] select-none lg:block"
            />
            <div className="absolute left-[5%] top-[6%] z-10 flex h-[84%] w-[56%] max-w-[360px] flex-col rounded-xl border border-border/60 bg-card p-4 shadow-[0_8px_24px_rgba(15,23,42,0.10)] text-card-foreground">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Tiến độ học tập</span>
                <span>Tuần này⌄</span>
              </div>
              <div className="mt-3">
                <strong className="text-3xl font-extrabold text-foreground">
                  325
                </strong>
                <span className="ml-1 text-sm font-bold text-foreground">phút</span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Thời gian học
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="border-b-2 border-emerald-500 pb-1">
                  65% mục tiêu tuần
                </span>
              </p>
              <svg
                viewBox="0 0 320 120"
                className="mt-auto h-28 w-full"
                role="img"
                aria-label="Biểu đồ tiến độ"
              >
                <path
                  d="M6 100 C35 80,42 82,62 70 S95 86,120 55 S156 66,180 78 S211 49,235 34 S271 54,314 24"
                  fill="none"
                  stroke="#16a36a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <g fill="#16a36a">
                  {[
                    [6, 100],
                    [62, 70],
                    [120, 55],
                    [180, 78],
                    [235, 34],
                    [314, 24],
                  ].map(([cx, cy]) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
                  ))}
                </g>
              </svg>
              <div className="grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
            </div>
            <div className="absolute left-[65%] top-[15%] z-10 flex aspect-[1.38/1] w-[28%] max-w-[178px] flex-col rounded-xl border border-border/60 bg-card p-4 shadow-[0_8px_20px_rgba(15,23,42,0.10)] text-card-foreground">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Flame
                  className="h-3.5 w-3.5 text-orange-500"
                  aria-hidden="true"
                />
                Chuỗi ngày học
              </p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-foreground">
                <Flame
                  className="h-6 w-6 fill-orange-400 text-orange-500"
                  aria-hidden="true"
                />
                12<span className="-ml-1 text-sm font-bold">ngày</span>
              </p>
              <small className="font-medium text-muted-foreground">Tuyệt vời!</small>
            </div>
            <div className="absolute bottom-[11%] left-[65%] z-10 flex aspect-[1.38/1] w-[25%] max-w-[178px] flex-col rounded-xl border border-border/60 bg-card p-4 shadow-[0_8px_20px_rgba(15,23,42,0.10)] text-card-foreground">
              <p className="text-xs font-semibold text-muted-foreground">Hoàn thành</p>
              <p className="mt-2 text-3xl font-extrabold leading-none text-foreground">
                24
              </p>
              <small className="mt-1 text-sm font-medium text-muted-foreground">
                Bài học
              </small>
            </div>
          </div>
        </section>
        <section className="mt-14">
          <Heading
            title="Danh mục phổ biến"
            href="/danh-muc"
            label="Xem tất cả danh mục"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {displayCategories.map((cat) => {
              const Icon = cat.Icon;
              return (
                <Link
                  key={cat.id || cat.slug}
                  href={cat.href}
                  className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center rounded-xl border border-border bg-card px-2 text-center shadow-[0_2px_10px_rgba(15,23,42,0.025)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm active:translate-y-0 dark:hover:border-emerald-800/60"
                >
                  <span
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${cat.tone}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="whitespace-pre-line text-xs font-semibold leading-5 text-foreground">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="mt-16">
          <Heading
            title="Series nổi bật"
            href="/series"
            label="Xem tất cả series"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {displaySeries.map((item, index) => (
              <Link
                key={item.id || item.slug}
                href={item.href}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md active:translate-y-0 dark:hover:border-emerald-800/60"
              >
                <div
                  className={`relative h-32 bg-gradient-to-br ${item.tint}`}
                  aria-label="Ảnh bìa sẽ được cập nhật"
                >
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                    {index === 1 ? "HOT" : "MỚI"}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="whitespace-pre-line text-[13px] font-bold leading-5 text-foreground transition-colors duration-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" aria-hidden="true" />
                      {item.lessons}
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span className="inline-flex items-center gap-1">
                      <UsersRound className="h-3 w-3" aria-hidden="true" />
                      {item.author}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Star
                        className="h-3.5 w-3.5 fill-current text-amber-500"
                        aria-hidden="true"
                      />
                      4.9 (256)
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Cơ bản
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <HomeList
            title="Tiếp tục học tập"
            href="/bang-dieu-khien"
            items={[
              "Quản lý tài chính cá nhân cho người mới bắt đầu",
              "Đầu tư chứng khoán thực chiến A-Z",
              "Excel tài chính ứng dụng thực tế",
            ]}
            action="Tiếp tục"
          />
          <HomeList
            title="Bài viết cộng đồng nổi bật"
            href="/bai-viet/cong-dong"
            items={displayCommunityPosts}
            action="Xem bài"
          />
        </section>
        <section className="mt-16">
          <h2 className="text-lg font-bold text-foreground">
            Vì sao nên chọn {BRAND.name}?
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                ShieldCheck,
                "Nội dung chất lượng",
                "Được biên soạn bởi đội ngũ chuyên gia",
                "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
              ],
              [
                Medal,
                "Học thực tiễn",
                "Kiến thức áp dụng ngay vào cuộc sống",
                "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
              ],
              [
                UsersRound,
                "Cộng đồng hỗ trợ",
                "Học hỏi, chia sẻ và phát triển cùng nhau",
                "text-violet-600 bg-violet-50 dark:bg-violet-950/60 dark:text-violet-400",
              ],
              [
                BarChart3,
                "Cập nhật liên tục",
                "Nội dung mới theo xu hướng thị trường",
                "text-orange-500 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-400",
              ],
            ].map(([Icon, title, description, tone]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="flex gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone as string}`}
                  >
                    <I className="h-6 w-6" />
                  </span>
                  <span>
                    <strong className="text-sm font-bold text-foreground">
                      {title as string}
                    </strong>
                    <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
                      {description as string}
                    </p>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="mt-14 rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/60 p-6 sm:flex sm:items-center sm:gap-8 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:via-card dark:to-emerald-950/30">
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">
              Nhận bản tin kiến thức hàng tuần
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Cập nhật bài học mới và xu hướng tài chính hữu ích mỗi tuần.
            </p>
          </div>
          <form className="mt-5 flex h-11 max-w-[390px] overflow-hidden rounded-lg border border-border bg-card sm:mt-0 sm:w-full">
            <input
              aria-label="Email nhận bản tin"
              placeholder="Nhập email của bạn..."
              className="min-w-0 flex-1 bg-transparent px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button className="m-1 cursor-pointer rounded-md bg-emerald-600 px-4 text-xs font-bold text-white transition-[background-color,transform,box-shadow] duration-200 hover:bg-emerald-700 hover:shadow-sm active:translate-y-px">
              Đăng ký
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export type HomeListItem =
  | {
      id?: string;
      title: string;
      href?: string;
      author?: string;
      views?: number;
      time?: string;
      likes?: number;
      comments?: number;
    }
  | string;

function HomeList({
  title,
  href,
  items,
  action,
}: {
  title: string;
  href: string;
  items: HomeListItem[];
  action: string;
}) {
  const isLearning = title.startsWith("Tiếp");
  const progress = [65, 40, 20];
  const lessonLabels = [
    "Quỹ dự phòng là gì?",
    "Phân tích kỹ thuật cơ bản",
    "Hàm tài chính thông dụng",
  ];
  const authors = ["Nguyễn Văn A", "Trần Thị B", "Lê Minh C"];
  const times = ["2 giờ trước", "5 giờ trước", "1 ngày trước"];
  const likes = [128, 96, 78];
  const comments = [32, 45, 28];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] text-card-foreground">
      <Heading title={title} href={href} label="Xem tất cả" />
      <div>
        {items.map((item, index) => {
          const itemTitle = typeof item === "string" ? item : item.title;
          const itemHref = typeof item === "string" ? href : (item.href || href);
          const itemAuthor = typeof item === "string" ? authors[index] : (item.author || authors[index]);
          const itemTime = typeof item === "string" ? times[index] : (item.time || times[index]);
          const itemLikes = typeof item === "string" ? likes[index] : (item.likes ?? likes[index]);
          const itemComments = typeof item === "string" ? comments[index] : (item.comments ?? comments[index]);

          return (
            <Link
              key={typeof item === "string" ? item : item.id || item.title}
              href={itemHref}
              className="group flex min-h-[82px] cursor-pointer items-center gap-3 border-t border-border py-3 transition-colors duration-200 hover:bg-muted/50 first:border-t-0 first:pt-0"
            >
              {isLearning ? (
                <>
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${["from-amber-100 to-emerald-50 dark:from-amber-950/60 dark:to-emerald-950/40", "from-slate-800 to-blue-100 dark:from-slate-900 dark:to-blue-950/60", "from-slate-200 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/40"][index]}`}
                  >
                    <BookOpen
                      className="h-4 w-4 text-emerald-700/60 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-extrabold text-foreground">
                      {itemTitle}
                    </strong>
                    <small className="mt-1 block truncate text-xs font-medium text-muted-foreground">
                      Bài {index + 3}: {lessonLabels[index]}
                    </small>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-emerald-500"
                          style={{ width: `${progress[index]}%` }}
                        />
                      </span>
                      <small className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                        {progress[index]}%
                      </small>
                    </span>
                  </span>
                  <span className="shrink-0 rounded-[5px] border border-emerald-300 px-3 py-1.5 text-[13px] font-semibold text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:group-hover:bg-emerald-950/50">
                    {action}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-rose-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                    <UsersRound
                      className="h-5 w-5 text-slate-600 dark:text-slate-300"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs font-bold text-foreground">
                      {itemTitle}
                    </strong>
                    <small className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <UsersRound className="h-3 w-3" aria-hidden="true" />
                      {itemAuthor}
                      <span>·</span>
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {itemTime}
                    </small>
                  </span>
                  <span className="hidden shrink-0 items-center gap-4 text-xs font-semibold text-muted-foreground sm:flex">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                      {itemLikes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {itemComments}
                    </span>
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
