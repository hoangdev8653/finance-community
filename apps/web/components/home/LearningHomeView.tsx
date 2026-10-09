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
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Flame,
  GraduationCap,
  Heart,
  HeartPulse,
  Landmark,
  Lightbulb,
  Medal,
  MessageCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { BRAND } from "@/lib/constants/brand";
import { useAuth } from "@/lib/auth/AuthContext";
import { postsService } from "@/lib/posts/posts-service";
import { courseService } from "@/lib/courses/course-service";

const SERIES_TINTS = [
  "from-emerald-950 via-emerald-800 to-teal-900",
  "from-slate-950 via-cyan-950 to-slate-900",
  "from-violet-950 via-purple-900 to-slate-950",
  "from-amber-950 via-orange-900 to-slate-950",
  "from-teal-950 via-emerald-900 to-slate-950",
];

function getCategoryBadgeClass(category: string): string {
  const normalized = category.toLocaleLowerCase("vi-VN");
  if (normalized.includes("tài chính") || normalized.includes("đầu tư") || normalized.includes("chứng khoán")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
  }
  if (normalized.includes("kinh doanh") || normalized.includes("quản lý") || normalized.includes("chi tiêu")) {
    return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
  }
  return "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300";
}

function getDomainIconAndTone(codeOrSlugOrName: string): {
  icon: typeof CircleDollarSign;
  tone: string;
  badge: string;
} {
  const norm = (codeOrSlugOrName || "").toLowerCase();
  if (norm.includes("money") || norm.includes("tai-chinh") || norm.includes("tài chính") || norm.includes("đầu tư")) {
    return {
      icon: CircleDollarSign,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      badge: "Quản lý & Đầu tư",
    };
  }
  if (norm.includes("business") || norm.includes("kinh doanh") || norm.includes("khởi nghiệp")) {
    return {
      icon: BriefcaseBusiness,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
      badge: "Khởi nghiệp & Quản trị",
    };
  }
  if (norm.includes("tech") || norm.includes("công nghệ") || norm.includes("ai") || norm.includes("trí tuệ")) {
    return {
      icon: Sparkles,
      tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
      badge: "AI & Kỹ năng số",
    };
  }
  if (norm.includes("career") || norm.includes("nghề nghiệp") || norm.includes("học tập") || norm.includes("kỹ năng")) {
    return {
      icon: GraduationCap,
      tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      badge: "Phương pháp & Kỹ năng",
    };
  }
  if (norm.includes("life") || norm.includes("đời sống") || norm.includes("sức khỏe") || norm.includes("doi-song")) {
    return {
      icon: HeartPulse,
      tone: "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400",
      badge: "Thói quen & Thể chất",
    };
  }
  if (norm.includes("sport") || norm.includes("thể thao")) {
    return {
      icon: Medal,
      tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
      badge: "Rèn luyện & Thể lực",
    };
  }
  return {
    icon: Compass,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    badge: "Kiến thức chuyên sâu",
  };
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      <Link
        href={href}
        className="group/hlink inline-flex cursor-pointer items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 transition-colors duration-200 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-400"
      >
        <span>{label}</span>
        <ArrowRight className="h-4 w-4 stroke-[2.25] text-slate-600 transition-transform duration-200 group-hover/hlink:translate-x-0.5 group-hover/hlink:text-emerald-700 dark:text-slate-300 dark:group-hover/hlink:text-emerald-400" />
      </Link>
    </div>
  );
}

export function LearningHomeView() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");

  // 1. Fetch domains directly from database API (/domains)
  const { data: remoteDomains } = useQuery({
    queryKey: ["home", "domains"],
    queryFn: () => postsService.getDomains({ includeInactive: false }),
    staleTime: 60 * 1000,
  });

  // Keep categories query for fallback / tests
  const { data: remoteCategories } = useQuery({
    queryKey: ["home", "categories"],
    queryFn: () => postsService.getCategories(),
    staleTime: 60 * 1000,
  });

  // 2. Fetch series from backend API
  const { data: remoteSeries } = useQuery({
    queryKey: ["home", "series"],
    queryFn: () => courseService.getAllCourses({ limit: 5 }),
    staleTime: 60 * 1000,
  });

  // 3. Fetch community posts from backend API
  const { data: remotePosts } = useQuery({
    queryKey: ["home", "community-posts"],
    queryFn: () => postsService.getFeed({ contentType: "COMMUNITY", limit: 3 }),
    staleTime: 60 * 1000,
  });

  const { data: latestLessons } = useQuery({
    queryKey: ["home", "latest-lessons"],
    queryFn: () => postsService.getFeed({ contentType: "SERIES", limit: 4, sortBy: "publishedAt", order: "DESC" }),
    staleTime: 60 * 1000,
  });

  // Resolve display domains from database with graceful fallback
  const displayDomains = useMemo(() => {
    const activeDomains = remoteDomains?.filter((d) => d.code !== "GENERAL") || [];
    if (activeDomains.length > 0) {
      return activeDomains.slice(0, 6).map((d) => {
        const { icon: Icon, tone } = getDomainIconAndTone(d.code || d.slug || d.name);
        const courseCount = d.courseCount ?? 0;
        return {
          id: d.id,
          label: d.nameVi || d.name,
          slug: d.slug,
          href: `/${d.slug}`,
          Icon,
          tone,
          subtitle: `${courseCount} khóa học`,
        };
      });
    }

    // Fallback if test or legacy setup passes remoteCategories
    if (remoteCategories && remoteCategories.length > 0) {
      return remoteCategories.slice(0, 6).map((cat) => {
        const { icon: Icon, tone } = getDomainIconAndTone(cat.name || cat.slug);
        return {
          id: cat.id,
          label: cat.name,
          slug: cat.slug,
          href: `/${cat.slug}`,
          Icon,
          tone,
          subtitle: `${cat.courseCount ?? 0} khóa học`,
        };
      });
    }

    // Default core domains matching the database
    return [
      { id: "MONEY", label: "Tài chính", slug: "tai-chinh", href: "/tai-chinh", Icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400", subtitle: "4 khóa học" },
      { id: "BUSINESS", label: "Kinh doanh", slug: "business", href: "/business", Icon: BriefcaseBusiness, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400", subtitle: "0 khóa học" },
      { id: "TECH", label: "Công nghệ", slug: "technology", href: "/technology", Icon: Sparkles, tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400", subtitle: "0 khóa học" },
      { id: "CAREER", label: "Nghề nghiệp và Học tập", slug: "career", href: "/career", Icon: GraduationCap, tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400", subtitle: "0 khóa học" },
      { id: "LIFE", label: "Đời sống và Sức khỏe", slug: "doi-song-suc-khoe", href: "/doi-song-suc-khoe", Icon: HeartPulse, tone: "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400", subtitle: "0 khóa học" },
      { id: "SPORTS", label: "Thể thao", slug: "sports", href: "/sports", Icon: Medal, tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400", subtitle: "0 khóa học" },
    ];
  }, [remoteDomains, remoteCategories]);

  // Resolve display series with graceful fallback
  const displaySeries = useMemo(() => {
    return (remoteSeries?.data ?? []).slice(0, 5).map((item, index) => ({
      id: item.id,
      title: item.name,
      slug: item.slug,
      href: `/khoa-hoc/${item.slug}`,
      lessons: `${item.publishedArticleCount ?? 0} bài học`,
      tint: SERIES_TINTS[index % SERIES_TINTS.length],
    }));
  }, [remoteSeries]);

  const publishedLessonCount = (remoteSeries?.data ?? []).reduce(
    (total, series) => total + (series.publishedArticleCount ?? 0),
    0,
  );

  const latestLessonItems = (latestLessons?.data ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    href: `/bai-viet/khoa-hoc/${post.slug}`,
    category: post.topics?.[0]?.name || "Bài học",
    time: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Vừa cập nhật",
  }));

  // Resolve community posts with graceful fallback
  const displayCommunityPosts = useMemo(() => {
    if (remotePosts?.data && remotePosts.data.length > 0) {
      return remotePosts.data.slice(0, 3).map((post) => ({
        id: post.id,
        title: post.title,
        href: `/bai-viet/cong-dong/${post.slug}`,
        author: post.author?.displayName || post.author?.username || "Thành viên cộng đồng",
        category: (post.topics && post.topics[0]?.name) || "Thảo luận",
        views: post.viewCount || 0,
        likes: post.reactionCount ?? 0,
        comments: post.commentCount ?? 0,
        time: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "",
      }));
    }
    return [];
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
    <main id="main-content" className="learning-area bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 xl:py-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1.03fr_1fr] lg:gap-12">
          <div className="max-w-[610px]">
            <h1 className="text-4xl font-extrabold leading-[1.3] tracking-tight text-foreground sm:text-[42px]">
              Học kiến thức tài chính
              <br />
              thực tiễn, phát triển mỗi ngày
            </h1>
            <p className="mt-5 max-w-[540px] text-base font-normal leading-7 text-slate-800 dark:text-slate-200">
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
                placeholder="Tìm kiếm bài học, khóa học, chủ đề..."
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
            <div className="mt-8 grid max-w-[560px] grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-x-3">
              {[
                [BookOpen, String(publishedLessonCount), "Bài học", "text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 border-emerald-200"],
                [Compass, "6", "Lĩnh vực", "text-blue-700 dark:text-blue-400 bg-blue-100/80 border-blue-200"],
                [Calculator, "3", "Công cụ", "text-violet-700 dark:text-violet-400 bg-violet-100/80 border-violet-200"],
                [ShieldCheck, "100%", "Kiểm chứng", "text-amber-700 dark:text-amber-400 bg-amber-100/80 border-amber-200"],
              ].map(([Icon, value, label, tone]) => {
                const I = Icon as typeof BookOpen;
                return (
                  <div
                    key={label as string}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] border shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 ${tone as string}`}
                    >
                      <I className="h-5 w-5 shrink-0 stroke-[2.2]" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm font-bold text-slate-900 dark:text-white">
                        {value as string}
                      </strong>
                      <small className="block whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {label as string}
                      </small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative min-h-[340px] rounded-[10px] border border-emerald-100/80 bg-gradient-to-br from-emerald-50 via-[#f4fbf7] to-emerald-100/80 sm:min-h-[370px] lg:min-h-[385px] dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-800/80">
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
            <div className="absolute left-[5%] top-[6%] z-10 flex h-[84%] w-[56%] max-w-[360px] flex-col rounded-[10px] border border-border/60 bg-card p-4 shadow-[0_8px_24px_rgba(15,23,42,0.10)] text-card-foreground">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Tiến độ học tập</span>
                <span>Tuần này ▾</span>
              </div>
              <div className="mt-2.5">
                <strong className="text-3xl font-extrabold text-foreground">
                  180
                </strong>
                <span className="ml-1 text-sm font-bold text-foreground">phút</span>
                <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Thời gian học tuần
                </p>
              </div>
              <p className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span className="border-b-2 border-emerald-500 pb-0.5">
                  75% mục tiêu tuần
                </span>
              </p>
              <svg
                viewBox="0 0 320 120"
                className="mt-auto h-24 w-full"
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
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-slate-700 dark:text-slate-300">
                <span className="truncate font-semibold">Đang học: Quản lý tài chính</span>
                <span className="shrink-0 font-bold text-emerald-700 dark:text-emerald-400">Bài 3/12</span>
              </div>
            </div>
            <div className="absolute left-[65%] top-[15%] z-10 flex aspect-[1.38/1] w-[28%] max-w-[178px] flex-col rounded-[10px] border border-border/60 bg-card p-4 shadow-[0_8px_20px_rgba(15,23,42,0.10)] text-card-foreground">
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
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
                7<span className="-ml-1 text-sm font-bold">ngày</span>
              </p>
              <small className="font-semibold text-slate-600 dark:text-slate-300">Kỷ luật bền bỉ!</small>
            </div>
            <div className="absolute bottom-[11%] left-[65%] z-10 flex aspect-[1.38/1] w-[25%] max-w-[178px] flex-col rounded-[10px] border border-border/60 bg-card p-4 shadow-[0_8px_20px_rgba(15,23,42,0.10)] text-card-foreground">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Hoàn thành</p>
              <p className="mt-2 text-3xl font-extrabold leading-none text-foreground">
                6
              </p>
              <small className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Bài học
              </small>
            </div>
          </div>
        </section>
        <section className="mt-12 sm:mt-14">
          <Heading
            title="Khám phá chủ đề"
            href="/the"
            label="Xem tất cả chủ đề"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {displayDomains.map((domain) => {
              const Icon = domain.Icon;
              return (
                <Link
                  key={domain.id || domain.slug}
                  href={domain.href}
                  className="group flex min-h-[124px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-card px-3 py-4 text-center shadow-[0_3px_12px_-3px_rgba(15,23,42,0.07)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:translate-y-0 dark:border-slate-800/80 dark:hover:border-emerald-700/60 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950"
                >
                  <span
                    className={`mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-transform duration-200 group-hover:scale-105 ${domain.tone}`}
                  >
                    <Icon className="h-5 w-5 stroke-[2.2]" />
                  </span>
                  <span className="text-balance text-sm font-bold leading-5 text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                    {domain.label}
                  </span>
                  {domain.subtitle && (
                    <span className="mt-1.5 text-xs font-medium leading-4 text-slate-600 dark:text-slate-400">
                      {domain.subtitle}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
        <section className="mt-16">
          <Heading
            title="Khám phá khóa học"
            href="/khoa-hoc"
            label="Xem tất cả khóa học"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {displaySeries.map((item) => (
              <Link
                key={item.id || item.slug}
                href={item.href}
                className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200/70 bg-card shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_14px_28px_-4px_rgba(15,23,42,0.12)] active:translate-y-0 dark:border-slate-800/80 dark:hover:border-emerald-700/60"
              >
                <div
                  className={`relative h-32 bg-gradient-to-br ${item.tint}`}
                  aria-label={item.title}
                >
                </div>
                <div className="p-3.5">
                  <h3 className="whitespace-pre-line text-sm sm:text-base font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                    <BookOpen className="h-4 w-4 stroke-[2.2] text-slate-700 dark:text-slate-300" aria-hidden="true" />
                    <span>{item.lessons}</span>
                  </div>
                  {item.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Financial Tools Section */}
        <section className="mt-14">
          <Heading
            title="Công cụ tài chính thực chiến"
            href="/cong-cu"
            label="Xem tất cả công cụ"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/cong-cu/lai-kep"
              className="group flex flex-col justify-between rounded-xl border border-slate-200/70 bg-card p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_14px_28px_-4px_rgba(15,23,42,0.12)] dark:border-slate-800/80 dark:hover:border-emerald-700/60"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <Calculator className="h-6 w-6 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                  Bảng tính Lãi kép & Hưu trí
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                  Mô phỏng sức mạnh kỳ diệu của lãi kép, lập kế hoạch tích lũy tài chính và tự do nghỉ hưu an nhàn.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                <span>Tính toán ngay</span>
                <ArrowRight className="h-4 w-4 stroke-[2.25] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/cong-cu/dinh-gia-co-phieu"
              className="group flex flex-col justify-between rounded-xl border border-slate-200/70 bg-card p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_14px_28px_-4px_rgba(15,23,42,0.12)] dark:border-slate-800/80 dark:hover:border-violet-700/60"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                  <BarChart3 className="h-6 w-6 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                  Định giá nhanh Cổ phiếu
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                  Áp dụng mô hình định giá P/E Multiples & Chiết khấu cổ tức Gordon, tính toán biên an toàn chiết khấu 20%.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-violet-700 dark:text-violet-400">
                <span>Định giá mã cổ phiếu</span>
                <ArrowRight className="h-4 w-4 stroke-[2.25] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/cong-cu/tinh-khoan-vay"
              className="group flex flex-col justify-between rounded-xl border border-slate-200/70 bg-card p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_14px_28px_-4px_rgba(15,23,42,0.12)] dark:border-slate-800/80 dark:hover:border-blue-700/60"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                  <Landmark className="h-6 w-6 stroke-[2.2]" />
                </div>
                <h3 className="mt-3 text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  Tính Khoản vay Trả góp
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                  Lập lịch trả nợ vay mua nhà, xe theo phương pháp dư nợ giảm dần hoặc cố định gốc hàng tháng.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-400">
                <span>Lập kế hoạch vay</span>
                <ArrowRight className="h-4 w-4 stroke-[2.25] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <Heading title="Bài học mới nhất" href="/bai-viet/khoa-hoc" label="Xem tất cả bài học" />
          {latestLessonItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {latestLessonItems.map((lesson) => (
                <Link key={lesson.id} href={lesson.href} className="group rounded-xl border border-slate-200/80 bg-card p-5 shadow-[0_3px_12px_-3px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"><BookOpen className="h-3.5 w-3.5" />{lesson.category}</span>
                  <h3 className="mt-4 line-clamp-3 min-h-[4.5rem] text-base font-bold leading-6 text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{lesson.title}</h3>
                  <span className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span>{lesson.time}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">Các bài học mới sẽ xuất hiện tại đây khi được xuất bản.</p>
          )}
        </section>

        <section className="mt-16">
          <Heading title="Thảo luận cộng đồng gần đây" href="/bai-viet/cong-dong" label="Vào cộng đồng" />
          {displayCommunityPosts.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {displayCommunityPosts.map((post) => (
                <Link key={post.id} href={post.href} className="group flex min-h-48 flex-col rounded-xl border border-slate-200/80 bg-card p-5 shadow-[0_3px_12px_-3px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800">
                  <span className={`w-fit rounded-md border px-2.5 py-1 text-[11px] font-bold ${getCategoryBadgeClass(post.category)}`}>{post.category}</span>
                  <h3 className="mt-3 line-clamp-3 text-base font-bold leading-6 text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{post.title}</h3>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-slate-500 dark:text-slate-400"><span className="truncate">{post.author}</span><span className="flex shrink-0 items-center gap-3"><span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{post.likes}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comments}</span></span></div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">Chưa có thảo luận nào. Hãy là người bắt đầu chia sẻ.</p>
          )}
        </section>
        <section className="mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
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
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] ${tone as string}`}
                  >
                    <I className="h-6 w-6 stroke-[2.2]" />
                  </span>
                  <span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      {title as string}
                    </strong>
                    <p className="mt-1 text-xs sm:text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">
                      {description as string}
                    </p>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="mt-16 overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-7 shadow-sm sm:p-10 dark:border-emerald-800/50 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/40">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300"><UsersRound className="h-6 w-6" /></span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">Cùng cộng đồng xây dựng tương lai tài chính vững vàng</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base dark:text-slate-300">Đặt câu hỏi, chia sẻ kinh nghiệm và học từ những góc nhìn thực tế của cộng đồng.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/bai-viet/cong-dong" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"><UsersRound className="h-4 w-4" />Khám phá cộng đồng</Link>
              {!isAuthenticated && <Link href="/dang-ky" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-300 bg-white/80 px-5 text-sm font-bold text-emerald-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-700 dark:bg-slate-900/70 dark:text-emerald-200 dark:hover:bg-slate-900"><UserPlus className="h-4 w-4" />Tạo tài khoản miễn phí</Link>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
