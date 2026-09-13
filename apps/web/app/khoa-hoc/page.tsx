"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Grid2X2,
  HeartPulse,
  Laptop,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";

type Topic =
  | "Tất cả"
  | "Tài chính"
  | "Đầu tư"
  | "Sức khỏe"
  | "Công nghệ"
  | "Kỹ năng sống"
  | "Sự nghiệp";
type Course = {
  slug: string;
  title: string;
  description: string;
  topic: Exclude<Topic, "Tất cả">;
  level: "Cơ bản" | "Trung cấp";
  lessons: number;
  duration: string;
  students: string;
  accent: string;
  featured?: boolean;
};

const topics: Array<{ name: Topic; icon: typeof Grid2X2 }> = [
  { name: "Tất cả", icon: Grid2X2 },
  { name: "Tài chính", icon: BookOpen },
  { name: "Đầu tư", icon: BarChart3 },
  { name: "Sức khỏe", icon: HeartPulse },
  { name: "Công nghệ", icon: Laptop },
  { name: "Kỹ năng sống", icon: Sparkles },
  { name: "Sự nghiệp", icon: BriefcaseBusiness },
];
const courses: Course[] = [
  {
    slug: "quan-ly-tai-chinh-ca-nhan",
    title: "Quản lý tài chính cá nhân cho người mới bắt đầu",
    description:
      "Xây nền tảng chi tiêu, tiết kiệm và đầu tư một cách chủ động.",
    topic: "Tài chính",
    level: "Cơ bản",
    lessons: 12,
    duration: "2 giờ 30 phút",
    students: "1.2k",
    accent: "from-emerald-950 via-emerald-700 to-lime-300",
    featured: true,
  },
  {
    slug: "dau-tu-chung-khoan-tu-nen-tang",
    title: "Đầu tư chứng khoán từ nền tảng",
    description:
      "Hiểu thị trường, quản trị rủi ro và xây dựng chiến lược dài hạn.",
    topic: "Đầu tư",
    level: "Cơ bản",
    lessons: 10,
    duration: "2 giờ",
    students: "980",
    accent: "from-slate-950 via-cyan-900 to-cyan-400",
    featured: true,
  },
  {
    slug: "lam-viec-hieu-qua-trong-thoi-dai-so",
    title: "Làm việc hiệu quả trong thời đại số",
    description:
      "Thiết kế hệ thống tập trung, ưu tiên đúng và làm việc bền vững.",
    topic: "Kỹ năng sống",
    level: "Cơ bản",
    lessons: 8,
    duration: "1 giờ 40 phút",
    students: "760",
    accent: "from-violet-950 via-violet-700 to-fuchsia-300",
    featured: true,
  },
  {
    slug: "quy-du-phong-va-bao-hiem",
    title: "Quỹ dự phòng và bảo hiểm cá nhân",
    description:
      "Lập kế hoạch bảo vệ tài chính trước những tình huống bất ngờ.",
    topic: "Tài chính",
    level: "Cơ bản",
    lessons: 7,
    duration: "1 giờ 20 phút",
    students: "640",
    accent: "from-teal-950 via-teal-700 to-emerald-300",
  },
  {
    slug: "doc-hieu-bao-cao-tai-chinh",
    title: "Đọc hiểu báo cáo tài chính",
    description:
      "Đọc đúng ba báo cáo cốt lõi trước khi đưa ra quyết định đầu tư.",
    topic: "Đầu tư",
    level: "Trung cấp",
    lessons: 14,
    duration: "3 giờ 10 phút",
    students: "520",
    accent: "from-blue-950 via-blue-700 to-sky-300",
  },
  {
    slug: "suc-khoe-tai-chinh-va-the-chat",
    title: "Sức khỏe tài chính và thể chất",
    description: "Tạo nhịp sống lành mạnh để duy trì hiệu suất và sự an tâm.",
    topic: "Sức khỏe",
    level: "Cơ bản",
    lessons: 7,
    duration: "1 giờ 15 phút",
    students: "430",
    accent: "from-rose-950 via-rose-700 to-orange-300",
  },
  {
    slug: "ung-dung-ai-trong-cong-viec",
    title: "Ứng dụng AI trong công việc",
    description:
      "Tận dụng AI để nghiên cứu, viết và tối ưu các tác vụ lặp lại.",
    topic: "Công nghệ",
    level: "Trung cấp",
    lessons: 9,
    duration: "2 giờ 15 phút",
    students: "810",
    accent: "from-indigo-950 via-indigo-700 to-cyan-300",
  },
  {
    slug: "giao-tiep-va-dam-phan",
    title: "Giao tiếp và đàm phán tự tin",
    description:
      "Rèn kỹ năng trình bày, lắng nghe và xử lý các cuộc trao đổi khó.",
    topic: "Kỹ năng sống",
    level: "Trung cấp",
    lessons: 9,
    duration: "1 giờ 50 phút",
    students: "390",
    accent: "from-amber-950 via-amber-700 to-yellow-300",
  },
  {
    slug: "xay-dung-su-nghiep-ben-vung",
    title: "Xây dựng sự nghiệp bền vững",
    description:
      "Làm rõ định hướng, năng lực cốt lõi và những bước đi tiếp theo.",
    topic: "Sự nghiệp",
    level: "Cơ bản",
    lessons: 11,
    duration: "2 giờ 20 phút",
    students: "560",
    accent: "from-slate-900 via-slate-700 to-slate-300",
  },
];
const tone = {
  "Cơ bản":
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
  "Trung cấp":
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
};

export default function CoursesPage() {
  const [topic, setTopic] = useState<Topic>("Tất cả");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"popular" | "lessons">("popular");
  const filtered = useMemo(
    () =>
      courses
        .filter(
          (c) =>
            (topic === "Tất cả" || c.topic === topic) &&
            `${c.title} ${c.description} ${c.topic}`
              .toLocaleLowerCase("vi-VN")
              .includes(query.toLocaleLowerCase("vi-VN")),
        )
        .sort((a, b) =>
          sort === "popular"
            ? Number.parseFloat(b.students) - Number.parseFloat(a.students)
            : b.lessons - a.lessons,
        ),
    [topic, query, sort],
  );
  return (
    <main className="min-h-screen bg-slate-50 pb-16 dark:bg-background">
      <section className="relative isolate min-h-[490px] overflow-hidden border-b border-emerald-100 dark:border-emerald-950/60 sm:min-h-[430px]">
        <Image
          src="/images/courses-hero-banner.png"
          alt="Không gian học tập BrewSeven với sách, cây xanh và bàn làm việc"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[66%_center] sm:object-center"
        />
        <div className="relative mx-auto flex min-h-[490px] w-full max-w-[1440px] items-center px-3.5 py-12 sm:min-h-[430px] sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="max-w-2xl rounded-3xl bg-white/85 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-sm dark:bg-slate-950/80 sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-800 shadow-sm backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> KHÓA HỌC BREWSEVEN
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Học đúng nền tảng.
              <br />
              <span className="text-emerald-700 dark:text-emerald-400">
                Tiến bộ từng bước.
              </span>
            </h1>
            <div className="mt-5 max-w-xl">
              <p className="text-base font-semibold leading-7 text-slate-900 [text-shadow:0_1px_1px_rgba(255,255,255,0.8)] dark:text-white dark:[text-shadow:none] sm:text-lg">
                Các khóa học ngắn gọn, thực tế, giúp bạn xây kiến thức tài chính
                và kỹ năng cần thiết cho cuộc sống tốt hơn.
              </p>
            </div>
            <form
              className="relative mt-5 max-w-2xl"
              onSubmit={(event) => {
                event.preventDefault();
                document
                  .getElementById("all-courses")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <label htmlFor="course-search" className="sr-only">
                Tìm kiếm khóa học
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-800" />
              <input
                id="course-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm khóa học, chủ đề hoặc kỹ năng..."
                className="h-13 w-full rounded-lg border border-white/80 bg-white/95 pl-12 pr-16 text-sm text-slate-900 shadow-lg shadow-slate-950/10 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950/90 dark:text-white dark:placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm khóa học"
                className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-800 text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[1440px] px-3.5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section aria-label="Lọc khóa học">
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Chủ đề khóa học"
          >
            {topics.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={topic === name}
                onClick={() => setTopic(name)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${topic === name ? "bg-emerald-800 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </button>
            ))}
          </div>
        </section>
        <section className="mt-12" aria-labelledby="featured-courses">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                BẮT ĐẦU TỪ ĐÂY
              </p>
              <h2
                id="featured-courses"
                className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white"
              >
                Khóa học nổi bật
              </h2>
            </div>
            <span className="hidden text-sm font-semibold text-slate-500 sm:block">
              Được nhiều người học lựa chọn
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {courses
              .filter((c) => c.featured)
              .map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
          </div>
        </section>
        <section className="mt-14" aria-labelledby="all-courses">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                THƯ VIỆN HỌC TẬP
              </p>
              <h2
                id="all-courses"
                className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white"
              >
                Tất cả khóa học
              </h2>
              <p
                aria-live="polite"
                className="mt-1 text-sm text-slate-500 dark:text-slate-400"
              >
                {filtered.length} khóa học phù hợp
              </p>
            </div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sắp xếp{" "}
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "popular" | "lessons")
                }
                className="ml-2 h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="lessons">Nhiều bài học</option>
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <Search className="mx-auto h-7 w-7 text-slate-400" />
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                Chưa tìm thấy khóa học phù hợp
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTopic("Tất cả");
                  setQuery("");
                }}
                className="mt-4 min-h-11 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/khoa-hoc/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        className={`relative min-h-36 overflow-hidden bg-gradient-to-br p-5 text-white ${course.accent}`}
      >
        <div
          aria-hidden
          className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/20"
        />
        <span className="relative inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
          {course.topic}
        </span>
        <BookOpen className="absolute bottom-5 right-5 h-9 w-9 text-white/85" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${tone[course.level]}`}
          >
            {course.level}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <UsersRound className="h-3.5 w-3.5" />
            {course.students}
          </span>
        </div>
        <h3 className="mt-4 font-heading text-lg font-extrabold leading-6 tracking-tight text-slate-950 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <span className="inline-flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.lessons} bài
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4" />
              {course.duration}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-emerald-700 transition-transform group-hover:translate-x-1 dark:text-emerald-400" />
        </div>
      </div>
    </Link>
  );
}
