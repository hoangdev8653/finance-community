import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  AlertOctagon,
  Scale,
  Ban,
  Flag,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Quy tắc ứng xử cộng đồng',
  description: `Bộ quy chuẩn văn hóa thảo luận, chia sẻ tri thức và bảo vệ chất lượng cộng đồng trên ${BRAND.name}.`,
};

const rules = [
  {
    number: '01',
    icon: Users,
    title: 'Tôn trọng & Tranh luận xây dựng',
    summary:
      'Tập trung phản biện quan điểm và số liệu, tuyệt đối không công kích cá nhân hay xúc phạm lẫn nhau.',
    details: [
      'Chào đón mọi góc nhìn đa chiều trên tinh thần khách quan, lịch thiệp và tôn trọng sự khác biệt.',
      'Nghiêm cấm ngôn từ thù hận, phân biệt đối xử về vùng miền, giới tính, tôn giáo hoặc đời tư cá nhân.',
      'Khi phản biện luận điểm đầu tư hoặc bài học, hãy dùng lý lẽ, dẫn chứng và số liệu cụ thể.',
    ],
  },
  {
    number: '02',
    icon: AlertOctagon,
    title: 'Nghiêm cấm "Phím hàng", Thao túng & Cam kết lợi nhuận',
    summary:
      'Nền tảng phục vụ mục đích học tập và nghiên cứu, không phải nơi môi giới hay lôi kéo giao dịch.',
    details: [
      'Nghiêm cấm mọi hành vi hô hào, "lùa gà", tạo hiệu ứng FOMO hoặc lan truyền tin đồn thất thiệt về cổ phiếu, tiền tệ hay dự án đầu tư.',
      'Tuyệt đối không đưa ra cam kết lợi nhuận chắc chắn hoặc kêu gọi ủy thác tài sản dưới mọi hình thức.',
      'Mọi bài phân tích mang tính cá nhân bắt buộc phải có tuyên bố miễn trừ trách nhiệm (Disclaimer).',
    ],
  },
  {
    number: '03',
    icon: Scale,
    title: 'Minh bạch số liệu & Tôn trọng bản quyền',
    summary:
      'Đề cao tính chính xác của tri thức và quyền sở hữu trí tuệ của tác giả.',
    details: [
      'Khi sử dụng biểu đồ, trích xuất báo cáo tài chính hoặc nghiên cứu của bên thứ ba, bắt buộc phải ghi rõ nguồn gốc (Citations/Attributions).',
      'Không sao chép nguyên văn (copy-paste) bài viết của người khác mà không có sự đồng ý hoặc không ghi tác giả gốc.',
      'Khuyến khích nội dung tự viết (Original Insights), đúc kết từ trải nghiệm và quan sát thực tế.',
    ],
  },
  {
    number: '04',
    icon: Ban,
    title: 'Chống Spam, Quảng cáo & Chèo kéo nhóm riêng',
    summary:
      'Giữ cho bảng tin và khu vực thảo luận luôn sạch sẽ, không bị làm phiền.',
    details: [
      'Nghiêm cấm chèn link nhóm Zalo, Telegram, Facebook VIP hoặc các dịch vụ tư vấn có thu phí vào bài viết và bình luận.',
      'Không đăng lặp đi lặp lại cùng một nội dung (Spamming) trên nhiều bài viết.',
      'Không sử dụng các thủ thuật kéo tương tác ảo hoặc quảng cáo đa cấp/cờ bạc.',
    ],
  },
  {
    number: '05',
    icon: Flag,
    title: 'Cơ chế Giám sát & Xử lý vi phạm',
    summary:
      'Quy trình bảo vệ cộng đồng được thực hiện công bằng, minh bạch bởi hệ thống và đội ngũ kiểm duyệt.',
    details: [
      'Cảnh cáo lần 1: Ẩn nội dung vi phạm và gửi cảnh báo đến tài khoản.',
      'Vi phạm lần 2: Tạm khóa quyền đăng bài và bình luận trong thời hạn 7 - 30 ngày.',
      'Vi phạm nghiêm trọng hoặc tái phạm nhiều lần: Khóa tài khoản vĩnh viễn và chặn truy cập hệ thống.',
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <AppShell mainClassName="max-w-4xl">
      <div className="space-y-8">
        <PageHeader
          icon={ShieldCheck}
          label="Văn hóa & Tiêu chuẩn"
          title="Quy tắc ứng xử cộng đồng"
          subtitle={`Những nguyên tắc cốt lõi giúp ${BRAND.name} duy trì môi trường trao đổi tri thức khách quan, văn minh và thực tiễn cho mọi người.`}
        />

        {/* Intro Highlight Banner */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 dark:border-emerald-950 dark:bg-emerald-950/20 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading text-base font-bold text-foreground">
                Tuyên ngôn văn hóa {BRAND.name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Chúng tôi tin rằng tri thức tài chính chỉ thực sự có giá trị khi được chia sẻ trên nền tảng của sự chân thành, dữ liệu khách quan và tinh thần học hỏi trọn đời. Khi tham gia thảo luận, bạn cùng chúng tôi xây dựng một sân chơi tri thức chuẩn mực cho cộng đồng người Việt.
              </p>
            </div>
          </div>
        </div>

        {/* Guidelines List */}
        <div className="space-y-5">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.number}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-7"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {rule.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-foreground">
                        {rule.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {rule.summary}
                      </p>
                    </div>

                    <ul className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {rule.details.map((point, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reporting Action Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-foreground">
                Nhìn thấy nội dung hoặc hành vi vi phạm?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Hãy nhấn vào biểu tượng <span className="font-semibold text-foreground">Báo cáo (Report)</span> ở góc dưới mỗi bài viết hoặc bình luận để Ban kiểm duyệt xử lý ngay.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/tro-giup"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Tìm hiểu thêm tại FAQ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
