"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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

const categories = [
  [
    "Quản lý tài chính\ncá nhân",
    CircleDollarSign,
    "bg-emerald-50 text-emerald-600",
  ],
  ["Đầu tư\nchứng khoán", BarChart3, "bg-violet-50 text-violet-600"],
  ["Đầu tư\ncrypto", CircleDollarSign, "bg-blue-50 text-blue-600"],
  ["Kinh doanh\n& Khởi nghiệp", BriefcaseBusiness, "bg-rose-50 text-rose-500"],
  ["Kỹ năng\nmềm", Lightbulb, "bg-amber-50 text-amber-500"],
  [
    "Công cụ tài chính\n& Excel",
    FileSpreadsheet,
    "bg-emerald-50 text-emerald-600",
  ],
  ["Pháp lý\n& Thuế", Landmark, "bg-blue-50 text-blue-600"],
  ["Công nghệ\n& AI", Lightbulb, "bg-orange-50 text-orange-500"],
  ["Sức khỏe\n& Cuộc sống", HeartPulse, "bg-red-50 text-red-500"],
] as const;

const series = [
  [
    "Quản lý tài chính cá nhân\ncho người mới bắt đầu",
    "12 bài học",
    "Hoàng Huy",
    "from-emerald-100 via-lime-50 to-white",
  ],
  [
    "Đầu tư chứng khoán\nthực chiến A-Z",
    "18 bài học",
    "Trần Minh",
    "from-slate-950 via-teal-900 to-slate-800",
  ],
  [
    "Crypto từ cơ bản\nđến nâng cao",
    "15 bài học",
    "Phạm Linh",
    "from-amber-900 via-amber-700 to-slate-900",
  ],
  [
    "Khởi nghiệp tinh gọn\nvới nguồn lực nhỏ",
    "10 bài học",
    "Lê Anh",
    "from-orange-50 via-rose-50 to-white",
  ],
  [
    "Excel tài chính\nứng dụng thực tế",
    "14 bài học",
    "Hoàng Huy",
    "from-cyan-100 via-slate-100 to-white",
  ],
] as const;

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
      <h2 className="text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-600 transition-colors duration-200 hover:text-emerald-700"
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
            <h1 className="text-[38px] font-extrabold leading-[1.3] tracking-tight text-slate-900 sm:text-[42px]">
              Học kiến thức tài chính
              <br />
              thực tiễn, phát triển mỗi ngày
            </h1>
            <p className="mt-5 max-w-[540px] text-base font-medium leading-7 text-slate-600">
              Khám phá các khóa học chất lượng, bài học thực tế và cộng đồng hỗ
              trợ bạn trên hành trình tự do tài chính.
            </p>
            <form
              onSubmit={search}
              className="mt-8 flex h-14 max-w-[540px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <Search className="my-auto ml-4 h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Tìm kiếm bài học"
                placeholder="Tìm kiếm bài học, series, chủ đề..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:font-semibold placeholder:text-slate-400"
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
                [BookOpen, "1,248", "Bài học", "text-emerald-600"],
                [BriefcaseBusiness, "156", "Series", "text-blue-600"],
                [UsersRound, "12,589", "Thành viên", "text-violet-600"],
                [Star, "4.9/5", "Đánh giá", "text-amber-500"],
              ].map(([Icon, value, label, color]) => {
                const I = Icon as typeof BookOpen;
                return (
                  <div
                    key={label as string}
                    className="flex items-center gap-2.5"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs ${color as string}`}
                    >
                      <I className="h-5 w-5" />
                    </span>
                    <span>
                      <strong className="block text-sm font-bold text-slate-800">
                        {value as string}
                      </strong>
                      <small className="block text-xs font-medium text-slate-600">
                        {label as string}
                      </small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative min-h-[340px] rounded-2xl bg-gradient-to-br from-emerald-50 via-[#f4fbf7] to-emerald-100/80 sm:min-h-[370px] lg:min-h-[385px]">
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
            <div className="absolute left-[5%] top-[6%] z-10 flex h-[84%] w-[56%] max-w-[360px] flex-col rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Tiến độ học tập</span>
                <span>Tuần này⌄</span>
              </div>
              <div className="mt-3">
                <strong className="text-3xl font-extrabold text-slate-900">
                  325
                </strong>
                <span className="ml-1 text-sm font-bold">phút</span>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Thời gian học
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-emerald-700">
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
              <div className="grid grid-cols-7 text-center text-[10px] font-medium text-slate-500">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
            </div>
            <div className="absolute left-[65%] top-[15%] z-10 flex aspect-[1.38/1] w-[28%] max-w-[178px] flex-col rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.10)]">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <Flame
                  className="h-3.5 w-3.5 text-orange-500"
                  aria-hidden="true"
                />
                Chuỗi ngày học
              </p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
                <Flame
                  className="h-6 w-6 fill-orange-400 text-orange-500"
                  aria-hidden="true"
                />
                12<span className="-ml-1 text-sm font-bold">ngày</span>
              </p>
              <small className="font-medium text-slate-500">Tuyệt vời!</small>
            </div>
            <div className="absolute bottom-[11%] left-[65%] z-10 flex aspect-[1.38/1] w-[25%] max-w-[178px] flex-col rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.10)]">
              <p className="text-xs font-semibold text-slate-600">Hoàn thành</p>
              <p className="mt-2 text-3xl font-extrabold leading-none text-slate-900">
                24
              </p>
              <small className="mt-1 text-sm font-medium text-slate-600">
                Bài học
              </small>
            </div>
          </div>
        </section>
        <section className="mt-14">
          <Heading
            title="Danh mục phổ biến"
            href="/categories"
            label="Xem tất cả danh mục"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {categories.map(([label, Icon, tone]) => (
              <Link
                key={label}
                href="/categories"
                className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-2 text-center shadow-[0_2px_10px_rgba(15,23,42,0.025)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-sm active:translate-y-0"
              >
                <span
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="whitespace-pre-line text-xs font-semibold leading-5 text-slate-700">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-16">
          <Heading
            title="Series nổi bật"
            href="/series"
            label="Xem tất cả series"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {series.map(([title, lessons, author, tint], index) => (
              <Link
                key={title}
                href="/series"
                className="group cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md active:translate-y-0"
              >
                <div
                  className={`relative h-32 bg-gradient-to-br ${tint}`}
                  aria-label="Ảnh bìa sẽ được cập nhật"
                >
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                    {index === 1 ? "HOT" : "MỚI"}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="whitespace-pre-line text-[13px] font-bold leading-5 text-slate-800 transition-colors duration-200 group-hover:text-emerald-800">
                    {title}
                  </h3>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" aria-hidden="true" />
                      {lessons}
                    </span>
                    <span className="h-3 w-px bg-slate-200" />
                    <span className="inline-flex items-center gap-1">
                      <UsersRound className="h-3 w-3" aria-hidden="true" />
                      {author}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
                    <span className="inline-flex items-center gap-1 text-slate-800">
                      <Star
                        className="h-3.5 w-3.5 fill-current text-amber-500"
                        aria-hidden="true"
                      />
                      4.9 (256)
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
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
            href="/dashboard"
            items={[
              "Quản lý tài chính cá nhân cho người mới bắt đầu",
              "Đầu tư chứng khoán thực chiến A-Z",
              "Excel tài chính ứng dụng thực tế",
            ]}
            action="Tiếp tục"
          />
          <HomeList
            title="Bài viết cộng đồng nổi bật"
            href="/posts"
            items={[
              "Kinh nghiệm xây dựng quỹ khẩn cấp 6 tháng thu nhập",
              "Có nên đầu tư vào bất động sản lúc này?",
              "Kinh nghiệm học phân tích kỹ thuật hiệu quả",
            ]}
            action="Xem bài"
          />
        </section>
        <section className="mt-16">
          <h2 className="text-lg font-bold text-slate-900">
            Vì sao nên chọn {BRAND.name}?
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                ShieldCheck,
                "Nội dung chất lượng",
                "Được biên soạn bởi đội ngũ chuyên gia",
                "text-emerald-600 bg-emerald-50",
              ],
              [
                Medal,
                "Học thực tiễn",
                "Kiến thức áp dụng ngay vào cuộc sống",
                "text-blue-600 bg-blue-50",
              ],
              [
                UsersRound,
                "Cộng đồng hỗ trợ",
                "Học hỏi, chia sẻ và phát triển cùng nhau",
                "text-violet-600 bg-violet-50",
              ],
              [
                BarChart3,
                "Cập nhật liên tục",
                "Nội dung mới theo xu hướng thị trường",
                "text-orange-500 bg-orange-50",
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
                    <strong className="text-sm font-bold text-slate-800">
                      {title as string}
                    </strong>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                      {description as string}
                    </p>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="mt-14 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/60 p-6 sm:flex sm:items-center sm:gap-8">
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">
              Nhận bản tin kiến thức hàng tuần
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Cập nhật bài học mới và xu hướng tài chính hữu ích mỗi tuần.
            </p>
          </div>
          <form className="mt-5 flex h-11 max-w-[390px] overflow-hidden rounded-lg border border-slate-200 bg-white sm:mt-0 sm:w-full">
            <input
              aria-label="Email nhận bản tin"
              placeholder="Nhập email của bạn..."
              className="min-w-0 flex-1 px-3 text-xs outline-none"
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

function HomeList({
  title,
  href,
  items,
  action,
}: {
  title: string;
  href: string;
  items: string[];
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
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <Heading title={title} href={href} label="Xem tất cả" />
      <div>
        {items.map((item, index) => (
          <Link
            key={item}
            href={href}
            className="group flex min-h-[82px] cursor-pointer items-center gap-3 border-t border-slate-100 py-3 transition-colors duration-200 hover:bg-slate-50 first:border-t-0 first:pt-0"
          >
            {isLearning ? (
              <>
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${["from-amber-100 to-emerald-50", "from-slate-800 to-blue-100", "from-slate-200 to-emerald-50"][index]}`}
                >
                  <BookOpen
                    className="h-4 w-4 text-emerald-700/60"
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-extrabold text-slate-800">
                    {item}
                  </strong>
                  <small className="mt-1 block truncate text-xs font-medium text-slate-500">
                    Bài {index + 3}: {lessonLabels[index]}
                  </small>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full bg-emerald-500"
                        style={{ width: `${progress[index]}%` }}
                      />
                    </span>
                    <small className="shrink-0 text-[10px] font-semibold text-slate-500">
                      {progress[index]}%
                    </small>
                  </span>
                </span>
                <span className="shrink-0 rounded-[5px] border border-emerald-200 px-3 py-1.5 text-[13px] font-semibold text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-50">
                  {action}
                </span>
              </>
            ) : (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-rose-100 to-slate-200">
                  <UsersRound
                    className="h-5 w-5 text-slate-600"
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs font-bold text-slate-800">
                    {item}
                  </strong>
                  <small className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <UsersRound className="h-3 w-3" aria-hidden="true" />
                    {authors[index]}
                    <span>·</span>
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    {times[index]}
                  </small>
                </span>
                <span className="hidden shrink-0 items-center gap-4 text-xs font-semibold text-slate-500 sm:flex">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                    {likes[index]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {comments[index]}
                  </span>
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
