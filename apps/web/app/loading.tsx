import { Spinner } from '@/components/ui/Spinner';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Đang tải nội dung...
        </p>
      </div>
    </div>
  );
}
