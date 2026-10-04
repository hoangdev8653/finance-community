"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bookmark,
  ChevronDown,
  Eye,
  Flame,
  Heart,
  MessageCircle,
  PenLine,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound,
} from "lucide-react";

const text = {
  all: "T\u1ea5t c\u1ea3",
  personalFinance: "T\u00e0i ch\u00ednh c\u00e1 nh\u00e2n",
  investing: "\u0110\u1ea7u t\u01b0",
  securities: "Ch\u1ee9ng kho\u00e1n",
  business: "Kinh doanh",
  technology: "C\u00f4ng ngh\u1ec7",
  lifeSkills: "K\u1ef9 n\u0103ng s\u1ed1ng",
  community: "C\u1ed8NG \u0110\u1ed2NG BREWSEVEN",
  heroTitle:
    "Chia s\u1ebb g\u00f3c nh\u00ecn, c\u00f9ng nhau ti\u1ebfn b\u1ed9",
  heroDescription:
    "N\u01a1i m\u1ecdi ng\u01b0\u1eddi chia s\u1ebb kinh nghi\u1ec7m, \u0111\u1eb7t c\u00e2u h\u1ecfi v\u00e0 c\u00f9ng nhau x\u00e2y d\u1ef1ng th\u00f3i quen t\u00e0i ch\u00ednh v\u1eefng v\u00e0ng cho m\u1ed9t cu\u1ed9c s\u1ed1ng t\u1ed1t \u0111\u1eb9p h\u01a1n.",
  writePost: "Vi\u1ebft b\u00e0i",
  featured: "B\u00e0i vi\u1ebft n\u1ed5i b\u1eadt",
  allPosts: "T\u1ea5t c\u1ea3 b\u00e0i vi\u1ebft",
  latest: "M\u1edbi nh\u1ea5t",
  search: "T\u00ecm ki\u1ebfm b\u00e0i vi\u1ebft...",
  viewAll: "Xem t\u1ea5t c\u1ea3 \u2192",
  featuredDescription:
    "T\u1eeb vi\u1ec7c chi ti\u00eau theo c\u1ea3m x\u00fac \u0111\u1ebfn x\u00e2y d\u1ef1ng qu\u1ef9 kh\u1ea9n c\u1ea5p, \u0111\u00e2y l\u00e0 nh\u1eefng b\u00e0i h\u1ecdc th\u1ef1c t\u1ebf.",
  investor: "Nh\u00e0 \u0111\u1ea7u t\u01b0 c\u00e1 nh\u00e2n",
  popularTitle: "\u0110ang \u0111\u01b0\u1ee3c quan t\u00e2m",
  membersTitle: "Th\u00e0nh vi\u00ean n\u1ed5i b\u1eadt",
  membersDescription:
    "K\u1ebft n\u1ed1i v\u1edbi nh\u1eefng th\u00e0nh vi\u00ean t\u00edch c\u1ef1c trong c\u1ed9ng \u0111\u1ed3ng BrewSeven.",
  joinCommunity: "Tham gia c\u1ed9ng \u0111\u1ed3ng \u2192",
};

const topics = [
  text.all,
  text.personalFinance,
  text.investing,
  text.securities,
  text.business,
  text.technology,
  text.lifeSkills,
];
const featuredPosts = [
  {
    title:
      "5 b\u00e0i h\u1ecdc t\u00e0i ch\u00ednh gi\u00fap t\u00f4i thay \u0111\u1ed5i cu\u1ed9c s\u1ed1ng trong 1 n\u0103m",
    category: text.personalFinance,
    author: "Nguy\u1ec5n Ho\u00e0ng Minh",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&auto=format&fit=crop&q=85",
    likes: "1.2K",
    comments: "132",
  },
  {
    title:
      "Th\u1ecb tr\u01b0\u1eddng sideway: C\u01a1 h\u1ed9i hay r\u1ee7i ro?",
    category: text.investing,
    author: "Tr\u1ea7n Mai Anh",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=85",
    likes: "423",
    comments: "56",
  },
  {
    title:
      "L\u00e0m th\u1ebf n\u00e0o \u0111\u1ec3 duy tr\u00ec \u0111\u1ed9ng l\u1ef1c m\u1ed7i ng\u00e0y?",
    category: text.lifeSkills,
    author: "L\u00ea Quang Huy",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=500&auto=format&fit=crop&q=85",
    likes: "312",
    comments: "28",
  },
];
const popular = [
  "N\u00ean d\u00f9ng \u1ee9ng d\u1ee5ng n\u00e0o \u0111\u1ec3 theo d\u00f5i ng\u00e2n s\u00e1ch?",
  "C\u00f3 n\u00ean \u0111\u1ea7u t\u01b0 v\u00e0o ETF l\u00fac n\u00e0y?",
  "L\u00e0m sao \u0111\u1ec3 v\u01b0\u1ee3t qua n\u1ed7i s\u1ee3 m\u1ea5t ti\u1ec1n khi \u0111\u1ea7u t\u01b0?",
  "Thu nh\u1eadp 20 tri\u1ec7u/th\u00e1ng n\u00ean ph\u00e2n b\u1ed5 th\u1ebf n\u00e0o?",
  "Kinh doanh online n\u0103m 2025 c\u00f2n c\u01a1 h\u1ed9i kh\u00f4ng?",
];
const communityPosts = [
  {
    author: "Ph\u1ea1m Th\u1ea3o Vy",
    level: "Lv.3",
    time: "2 gi\u1edd tr\u01b0\u1edbc",
    category: text.business,
    title:
      "Nh\u1eefng b\u00e0i h\u1ecdc \u0111\u1eaft gi\u00e1 sau 1 n\u0103m kh\u1edfi nghi\u1ec7p",
    excerpt:
      "Kh\u1edfi nghi\u1ec7p kh\u00f4ng h\u1ec1 m\u00e0u h\u1ed3ng, nh\u01b0ng l\u00e0m ch\u1ee7 \u0111\u01b0\u1ee3c n\u1ed7i lo l\u00e0 nh\u1eefng th\u1ee9 \u0111\u00e1ng gi\u00e1.",
    avatar: "https://i.pravatar.cc/96?img=47",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=280&auto=format&fit=crop&q=85",
    likes: "286",
    comments: "42",
    views: "5.1K",
  },
  {
    author: "Tr\u1ea7n Qu\u1ed1c B\u1ea3o",
    level: "Lv.4",
    time: "5 gi\u1edd tr\u01b0\u1edbc",
    category: text.securities,
    title:
      "3 sai l\u1ea7m ph\u1ed5 bi\u1ebfn c\u1ee7a nh\u00e0 \u0111\u1ea7u t\u01b0 m\u1edbi",
    excerpt:
      "Sau 5 n\u0103m tham gia th\u1ecb tr\u01b0\u1eddng, m\u00ecnh nh\u1eadn ra c\u00f3 nhi\u1ec1u sai l\u1ea7m ai c\u0169ng t\u1eebng g\u1eb7p.",
    avatar: "https://i.pravatar.cc/96?img=12",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=280&auto=format&fit=crop&q=85",
    likes: "412",
    comments: "68",
    views: "8.7K",
  },
  {
    author: "Kh\u00e1nh Linh",
    level: "Lv.2",
    time: "1 ng\u00e0y tr\u01b0\u1edbc",
    category: text.technology,
    title:
      "Top 5 c\u00f4ng c\u1ee5 gi\u00fap qu\u1ea3n l\u00fd t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n hi\u1ec7u qu\u1ea3",
    excerpt:
      "C\u00f4ng ngh\u1ec7 \u0111ang gi\u00fap cu\u1ed9c s\u1ed1ng c\u1ee7a ch\u00fang ta tr\u1edf n\u00ean d\u1ec5 d\u00e0ng h\u01a1n bao gi\u1edd h\u1ebft.",
    avatar: "https://i.pravatar.cc/96?img=32",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=280&auto=format&fit=crop&q=85",
    likes: "528",
    comments: "93",
    views: "12.4K",
  },
  {
    author: "Minh Anh",
    level: "Lv.5",
    time: "1 ng\u00e0y tr\u01b0\u1edbc",
    category: text.personalFinance,
    title:
      "L\u1eadp qu\u1ef9 d\u1ef1 ph\u00f2ng: B\u1eaft \u0111\u1ea7u t\u1eeb \u0111\u00e2u?",
    excerpt:
      "M\u1ed9t l\u1ed9 tr\u00ecnh nh\u1ecf gi\u00fap b\u1ea1n t\u1ea1o n\u1ec1n t\u1ea3ng an t\u00e2m cho c\u00e1c m\u1ee5c ti\u00eau d\u00e0i h\u1ea1n.",
    avatar: "https://i.pravatar.cc/96?img=25",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=280&auto=format&fit=crop&q=85",
    likes: "351",
    comments: "46",
    views: "6.2K",
  },
  {
    author: "Ho\u00e0ng Gia B\u1ea3o",
    level: "Lv.3",
    time: "2 ng\u00e0y tr\u01b0\u1edbc",
    category: text.investing,
    title:
      "Chi\u1ebfn l\u01b0\u1ee3c \u0111\u1ea7u t\u01b0 d\u00e0i h\u1ea1n cho ng\u01b0\u1eddi b\u1eadn r\u1ed9n",
    excerpt:
      "Kh\u00f4ng c\u1ea7n theo d\u00f5i b\u1ea3ng gi\u00e1 m\u1ed7i ng\u00e0y, v\u1eabn c\u00f3 th\u1ec3 x\u00e2y d\u1ef1ng danh m\u1ee5c b\u1ec1n v\u1eefng.",
    avatar: "https://i.pravatar.cc/96?img=15",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=280&auto=format&fit=crop&q=85",
    likes: "667",
    comments: "115",
    views: "14.9K",
  },
  {
    author: "Thu H\u00e0",
    level: "Lv.2",
    time: "3 ng\u00e0y tr\u01b0\u1edbc",
    category: text.lifeSkills,
    title:
      "T\u1ed1i gi\u1ea3n chi ti\u00eau \u0111\u1ec3 s\u1ed1ng nh\u1eb9 nh\u00e0ng h\u01a1n",
    excerpt:
      "Ba nguy\u00ean t\u1eafc \u0111\u01a1n gi\u1ea3n gi\u00fap m\u00ecnh c\u00e2n b\u1eb1ng gi\u1eefa chi ti\u00eau v\u00e0 ni\u1ec1m vui m\u1ed7i ng\u00e0y.",
    avatar: "https://i.pravatar.cc/96?img=44",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=280&auto=format&fit=crop&q=85",
    likes: "298",
    comments: "39",
    views: "4.8K",
  },
];

export function CommunityPostsView() {
  const [activeTopic, setActiveTopic] = useState(text.all);
  const [search, setSearch] = useState("");
  const [visiblePostCount, setVisiblePostCount] = useState(5);
  return (
    <main className="community-area min-h-screen bg-slate-50 dark:bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-3.5 pb-8 pt-0 sm:px-6 lg:px-8">
        <header className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden border-y border-emerald-100 shadow-sm">
          <img
            src="/images/community-hero-banner.png"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="relative mx-auto flex min-h-[360px] w-full max-w-[1440px] flex-col justify-center px-3.5 py-10 sm:min-h-[460px] sm:px-6 sm:py-12 lg:min-h-[520px] lg:px-8">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <UsersRound className="h-3.5 w-3.5" /> {text.community}
              </p>
              <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {text.heroTitle}
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                {text.heroDescription}
              </p>
              <Link
                href="/bai-viet/tao-moi"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <PenLine className="h-4 w-4" /> {text.writePost}
              </Link>
            </div>
          </div>
        </header>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setActiveTopic(topic)}
                className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition ${activeTopic === topic ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
              >
                {topic}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <label className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={text.search}
                className="h-10 w-52 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </label>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {text.latest} <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-slate-950">
                  <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />{" "}
                  {text.featured}
                </h2>
                <Link
                  href="/bai-viet"
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700"
                >
                  {text.viewAll}
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(250px,1fr)]">
                <article className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
                  <div className="grid sm:grid-cols-2">
                    <img
                      src={featuredPosts[0].image}
                      alt=""
                      className="h-52 w-full object-cover sm:h-full sm:min-h-[272px]"
                    />
                    <div className="flex flex-col p-5">
                      <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {featuredPosts[0].category}
                      </span>
                      <h3 className="mt-3 font-heading text-xl font-bold leading-snug text-slate-950">
                        {featuredPosts[0].title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                        {text.featuredDescription}
                      </p>
                      <div className="mt-auto flex items-end justify-between pt-5">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {featuredPosts[0].author}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {text.investor}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />{" "}
                            {featuredPosts[0].likes}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />{" "}
                            {featuredPosts[0].comments}
                          </span>
                          <Bookmark className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
                <div className="space-y-3">
                  {featuredPosts.slice(1).map((post) => (
                    <article
                      key={post.title}
                      className="flex min-h-[130px] gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition hover:shadow-md"
                    >
                      <img
                        src={post.image}
                        alt=""
                        className="h-[104px] w-24 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-700">
                          {post.category}
                        </span>
                        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-5 text-slate-900">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                          {post.author}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {post.likes}
                          </span>
                          <span className="ml-3 inline-flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />{" "}
                            {post.comments}
                          </span>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-slate-950">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />{" "}
                  {text.allPosts}
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {activeTopic === text.all ? text.latest : activeTopic}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
                {communityPosts
                  .slice(0, visiblePostCount)
                  .map((post, index) => (
                    <article
                      key={post.title}
                      className={`grid min-h-[120px] gap-4 px-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_300px] sm:items-center ${index > 0 ? "border-t border-slate-100" : ""}`}
                    >
                      <div className="flex min-w-0 gap-3">
                        <img
                          src={post.avatar}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className="font-bold text-slate-800">
                              {post.author}
                            </span>
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700">
                              {post.level}
                            </span>
                            <span className="text-slate-400">
                              • {post.time}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="mt-1 line-clamp-1 text-[17px] font-bold leading-6 text-slate-950">
                            {post.title}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-sm leading-5 text-slate-600">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <img
                          src={post.image}
                          alt=""
                          className="h-20 w-28 rounded-md object-cover sm:h-[88px] sm:w-[140px]"
                        />
                        <div className="hidden items-center gap-2 text-sm font-medium text-slate-600 xl:flex">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {post.likes}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {post.comments}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {post.views}
                          </span>
                        </div>
                        <Bookmark className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                      </div>
                    </article>
                  ))}
              </div>
              {visiblePostCount < communityPosts.length && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisiblePostCount((count) =>
                        Math.min(count + 3, communityPosts.length),
                      )
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
                  >
                    Xem thêm bài viết
                  </button>
                </div>
              )}
            </section>
          </div>
          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Flame className="h-4 w-4 text-rose-500" /> {text.popularTitle}
              </h2>
              <ol className="mt-4 space-y-3">
                {popular.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-5 text-slate-600"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{item}</span>
                    <MessageCircle className="mt-1 h-3.5 w-3.5 text-slate-400" />
                  </li>
                ))}
              </ol>
            </section>
            <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="h-4 w-4 text-amber-500" />{" "}
                {text.membersTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {text.membersDescription}
              </p>
              <Link
                href="/dang-nhap"
                className="mt-4 inline-flex text-sm font-bold text-emerald-700 hover:underline"
              >
                {text.joinCommunity}
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
