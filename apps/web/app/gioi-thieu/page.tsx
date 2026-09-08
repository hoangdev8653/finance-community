import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Coffee,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Target,
  Compass,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Giới thiệu & Sứ mệnh',
  description: `Tìm hiểu về sứ mệnh, triết lý và câu chuyện kiến tạo nền tảng học tập tri thức thực tiễn ${BRAND.name}.`,
};

const SEVEN_PILLARS = [
  { step: '01', title: 'Tài chính vững vàng', desc: 'Quản trị dòng tiền, lập quỹ khẩn cấp và đầu tư tăng trưởng tài sản bền vững.', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' },
  { step: '02', title: 'Thể lực bền bỉ', desc: 'Xây dựng thói quen vận động, thể thao và chăm sóc năng lượng thể chất mỗi ngày.', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
  { step: '03', title: 'Trí tuệ sáng suốt', desc: 'Tư duy phản biện, học tập trọn đời và cập nhật tri thức kinh tế vĩ mô liên tục.', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
  { step: '04', title: 'Kỷ luật thép', desc: 'Làm chủ thói quen, kiên định với mục tiêu dài hạn và vượt qua sự trì hoãn.', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50' },
  { step: '05', title: 'Kỹ năng thực chiến', desc: 'Kỹ năng giải quyết vấn đề, đàm phán, giao tiếp và làm chủ công nghệ mới.', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50' },
  { step: '06', title: 'Tâm trí an yên', desc: 'Cân bằng áp lực cuộc sống, rèn luyện sự bình tĩnh trước mọi biến động thị trường.', color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50' },
  { step: '07', title: 'Tự do đích thực', desc: 'Đạt tới tự do tài chính và tự do thời gian để sống cuộc đời ý nghĩa nhất.', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' },
];

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Độc lập & Khách quan',
    desc: 'Không nhận tài trợ điều hướng ý kiến, không phím hàng lôi kéo đầu cơ. Mọi bài phân tích đều dựa trên dữ liệu thật và báo cáo tài chính kiểm chứng.',
  },
  {
    icon: TrendingUp,
    title: 'Thực tiễn & Ứng dụng cao',
    desc: 'Tri thức không nằm trên trang giấy lý thuyết suông mà được chuyển hóa thành các công cụ tính toán, bảng biểu và case study cụ thể.',
  },
  {
    icon: Award,
    title: 'Biên soạn & Thẩm định chuyên sâu',
    desc: `Mỗi bài học trong Series đều được kiểm duyệt bởi ${BRAND.editorialDesk} và tham vấn ý kiến từ các chuyên gia tài chính giàu kinh nghiệm.`,
  },
  {
    icon: HeartHandshake,
    title: 'Cộng đồng học hỏi văn minh',
    desc: 'Tạo dựng môi trường trao đổi tôn trọng, tương trợ lẫn nhau, nơi người mới bắt đầu không ngần ngại đặt câu hỏi và người đi trước sẵn sàng chia sẻ.',
  },
];

export default function AboutPage() {
  return (
    <AppShell mainClassName="max-w-5xl">
      <div className="space-y-10">
        <PageHeader
          icon={Coffee}
          label="Về chúng tôi"
          title={`Câu chuyện thương hiệu ${BRAND.name}`}
          subtitle="Chưng cất tri thức, nâng tầm cuộc sống — Đồng hành cùng bạn trên 7 nấc thang làm chủ cuộc đời."
        />

        {/* Hero Narrative Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 shadow-xs dark:border-slate-800 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-2xs dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Triết lý thương hiệu</span>
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Mỗi ngày một tách tri thức hảo hạng
            </h2>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
              Cái tên <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{BRAND.name}</strong> bắt nguồn từ chữ <em>&quot;Brew&quot;</em> — tượng trưng cho sự chưng cất, ủ lọc những giọt tinh hoa nhất như cách người ta kiên nhẫn pha một tách cà phê thơm nồng mỗi sớm mai.
            </p>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
              Số <strong>7</strong> đại diện cho 7 ngày trong tuần không ngừng học hỏi, và là <strong>7 nấc thang hoàn thiện bản thân</strong>: bắt đầu từ nền móng quản trị tài chính cá nhân vững vàng, rèn luyện thể lực bền bỉ, mài sắc tư duy để cuối cùng chạm tới sự tự do đích thực.
            </p>
          </div>
        </section>

        {/* Mission & Vision Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              Sứ mệnh của chúng tôi
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Phổ cập kiến thức tài chính và kỹ năng sống thực tế cho hàng triệu người Việt. Giúp mọi người xóa bỏ rào cản thuật ngữ phức tạp, tránh xa các cạm bẫy lừa đảo đầu tư và tự tin làm chủ tương lai tài chính của gia đình mình.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              Tầm nhìn phát triển
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Trở thành nền tảng tri thức & cộng đồng học tập Micro-learning tin cậy hàng đầu, nơi hội tụ các bài giảng có cấu trúc sư phạm cao cấp kết hợp với công cụ mô phỏng tài chính trực quan và môi trường thảo luận đa chiều.
            </p>
          </div>
        </section>

        {/* 7 Pillars of BrewSeven */}
        <section className="space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              The Seven Steps
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              7 Nấc thang hoàn thiện bản thân
            </h2>
            <p className="text-sm text-muted-foreground">
              Khung lộ trình phát triển toàn diện mà {BRAND.name} cùng bạn hướng tới mỗi ngày.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SEVEN_PILLARS.map((pillar) => (
              <div
                key={pillar.step}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${pillar.color}`}>
                    {pillar.step}
                  </span>
                </div>
                <h4 className="mt-3 font-heading text-base font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {pillar.title}
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Core Principles
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Giá trị cốt lõi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {CORE_VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-7"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-heading text-base font-bold text-foreground">
                    {val.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Explore */}
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-extrabold sm:text-3xl">
                Bắt đầu hành trình cùng chúng tôi hôm nay
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-emerald-50/90 sm:text-base">
                Tham gia các series bài học tài chính thực chiến hoặc gia nhập cộng đồng thảo luận cùng hàng nghìn độc giả.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild size="lg" className="bg-white text-emerald-800 font-bold hover:bg-emerald-50 shadow-md">
                <Link href="/series" className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Khám phá Series</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                <Link href="/bai-viet/cong-dong" className="inline-flex items-center gap-2">
                  <span>Cộng đồng</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
