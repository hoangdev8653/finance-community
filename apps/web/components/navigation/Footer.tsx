"use client";
import Link from "next/link";
import { BookOpen, Layers3 } from "lucide-react";
const columns = [
  [
    "Khóa học",
    [
      ["Tất cả khóa học", "/series"],
      ["Series nổi bật", "/series"],
      ["Học miễn phí", "/series"],
      ["Lộ trình học tập", "/lo-trinh-hoc"],
    ],
  ],
  [
    "Cộng đồng",
    [
      ["Bài viết", "/bai-viet"],
      ["Thảo luận", "/bai-viet"],
      ["Hỏi đáp", "/bai-viet"],
      ["Quy tắc cộng đồng", "/dieu-khoan"],
    ],
  ],
  [
    "Về chúng tôi",
    [
      ["Giới thiệu", "/gioi-thieu"],
      ["Sứ mệnh", "/gioi-thieu"],
      ["Liên hệ", "/lien-he"],
      ["Đóng góp nội dung", "/lien-he"],
    ],
  ],
  [
    "Hỗ trợ",
    [
      ["Trung tâm hỗ trợ", "/lien-he"],
      ["Hướng dẫn sử dụng", "/lien-he"],
      ["Điều khoản sử dụng", "/dieu-khoan"],
      ["Chính sách bảo mật", "/chinh-sach-bao-mat"],
    ],
  ],
] as const;
export function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-100 bg-white text-slate-600">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Layers3 className="h-5 w-5" />
              </span>
              <span className="text-[17px] font-extrabold tracking-tight text-slate-900">
                MorningView
              </span>
            </Link>
            <p className="mt-3 max-w-[230px] text-[13px] font-medium leading-5 text-slate-500">
              Nền tảng kiến thức tài chính hàng đầu cho người Việt.
            </p>
            <div className="mt-4 flex gap-3.5">
              {[["f", "Facebook"], ["▶", "YouTube"], ["♪", "TikTok"], ["in", "LinkedIn"]].map(([symbol, label]) => {
                return (
                  <a
                    key={label as string}
                    href="#"
                    aria-label={label as string}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-500 text-[11px] font-extrabold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-emerald-600"
                  >
                    {symbol}
                  </a>
                );
              })}
            </div>
          </div>
          {columns.map(([title, links]) => (
            <nav key={title}>
              <h3 className="text-[13px] font-extrabold text-slate-900">
                {title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="cursor-pointer text-[13px] font-medium text-slate-500 transition-colors hover:text-emerald-600"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-4 text-[13px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>
            © {new Date().getFullYear()} MorningView. All rights reserved.
          </span>
          <span className="inline-flex items-center gap-1">
            Made with <BookOpen className="h-3.5 w-3.5 text-emerald-600" /> for
            your financial freedom
          </span>
        </div>
      </div>
    </footer>
  );
}
