import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const decorativeCloudClass =
  "absolute h-7 rounded-full bg-emerald-100/55 before:absolute before:bottom-0 before:left-3 before:h-11 before:w-11 before:rounded-full before:bg-emerald-100/55 before:content-[''] after:absolute after:bottom-0 after:right-3 after:h-9 after:w-9 after:rounded-full after:bg-emerald-100/55 after:content-['']";

export const metadata: Metadata = {
  title: '404 - Không tìm thấy trang',
  description: 'Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.',
};

export default function NotFound() {
  return (
    <main data-not-found-page="true" className="fixed inset-0 z-[60] isolate overflow-hidden bg-[#f8fbfa] px-5 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_top,_rgba(16,145,116,0.16),_transparent_62%)]"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 z-0 hidden sm:block" aria-hidden="true">
        <div className={`${decorativeCloudClass} left-[7%] top-[18%] w-28`} />
        <div className={`${decorativeCloudClass} right-[8%] top-[23%] w-24 opacity-80`} />
        <div className={`${decorativeCloudClass} bottom-[23%] left-[13%] w-24 opacity-70`} />
        <div className={`${decorativeCloudClass} bottom-[17%] right-[12%] w-32 opacity-75`} />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center text-center">
        <div className="relative -mb-16 w-full max-w-[min(23rem,40vh)]">
          <Image
            src="/images/error-404-clock.png"
            alt=""
            width={744}
            height={540}
            priority
            className="mx-auto h-auto w-full"
          />
        </div>

        <h1 className="mt-2 max-w-2xl text-balance font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Oops! Trang bạn tìm kiếm không tồn tại.
        </h1>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="min-h-11 gap-2 bg-[#12b76a] px-6 text-white hover:bg-[#0fa45f] hover:opacity-100 focus-visible:ring-[#12b76a]"
          >
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden="true" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-11 gap-2 border-slate-300 bg-white px-6 text-slate-800 hover:bg-slate-50">
            <Link href="/bai-viet-cong-dong">
              Khám phá bài viết
              <Compass className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="pointer-events-none mt-7 w-full max-w-[min(48rem,72vh)] -translate-y-14">
          <Image
            src="/images/error-404-scene.png"
            alt=""
            width={1200}
            height={760}
            className="mx-auto h-auto w-full"
          />
        </div>

      </div>
    </main>
  );
}
