import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, UsersRound, ChartNoAxesCombined, BadgeCheck, ShieldCheck } from 'lucide-react';

const benefits = [
  { icon: BookOpen, title: 'Học kiến thức tài chính thực tiễn', description: 'Các khóa học được biên soạn bởi chuyên gia', className: 'bg-emerald-50 text-emerald-600' },
  { icon: UsersRound, title: 'Cộng đồng trao đổi & chia sẻ', description: 'Kết nối, đặt câu hỏi và chia sẻ kinh nghiệm', className: 'bg-violet-50 text-violet-600' },
  { icon: ChartNoAxesCombined, title: 'Theo dõi tiến độ học tập', description: 'Hệ thống báo cáo và gợi ý cá nhân hóa', className: 'bg-orange-50 text-orange-500' },
  { icon: BadgeCheck, title: 'Học mọi lúc, mọi nơi', description: 'Trên mọi thiết bị, tối ưu trải nghiệm', className: 'bg-blue-50 text-blue-600' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        <section className="relative order-2 flex min-h-[560px] flex-col overflow-hidden px-6 pb-0 pt-8 sm:px-10 lg:order-1 lg:px-16 lg:pt-10 xl:px-20">
          <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-3" aria-label="Finance Community - Trang chủ">
            <Image src="/images/logo.png" alt="Finance Community" width={44} height={44} className="h-11 w-11 object-contain" priority />
            <span className="flex flex-col">
              <span className="font-heading text-xl font-bold tracking-tight text-foreground">Finance Community</span>
              <span className="text-sm font-medium text-primary">Học · Chia sẻ · Phát triển</span>
            </span>
          </Link>
          <div className="relative z-10 mt-14 max-w-xl lg:mt-16">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-4 py-2 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Nền tảng học tập & cộng đồng tài chính hàng đầu
            </div>
            <h2 className="font-heading text-4xl font-bold leading-[1.28] tracking-tight text-foreground sm:text-[42px]">
              Chào mừng bạn trở lại!
              <br /><span className="text-primary">Tiếp tục</span> hành trình học tập
              <br />và phát triển tài chính.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">Đăng nhập để truy cập khóa học, theo dõi tiến độ và tham gia cộng đồng cùng chúng tôi.</p>
            <div className="mt-7 max-w-[470px] space-y-1 rounded-xl border border-border bg-surface/80 p-4 shadow-xs backdrop-blur-sm">
              {benefits.map(({ icon: Icon, title, description, className }) => (
                <div key={title} className="flex items-center gap-4 rounded-lg px-1 py-2.5">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{description}</span></span>
                </div>
              ))}
            </div>
          </div>
          <Image src="/images/login-finance-illustration.png" alt="" width={1536} height={1024} priority aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-0 w-[min(100%,760px)] max-w-none object-contain object-left-bottom" />
        </section>
        <section className="order-1 flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-10 lg:order-2 lg:px-14 xl:px-20">
          <div className="w-full max-w-[540px] rounded-2xl border border-border bg-surface p-7 shadow-card sm:p-10">{children}</div>
          <p className="mt-8 max-w-md text-center text-xs leading-5 text-muted-foreground">Bằng cách đăng nhập, bạn đồng ý với <Link href="/terms" className="font-medium text-primary hover:underline">Điều khoản sử dụng</Link> và <Link href="/privacy" className="font-medium text-primary hover:underline">Chính sách bảo mật</Link></p>
        </section>
      </div>
    </div>
  );
}
