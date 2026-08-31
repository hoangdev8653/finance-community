'use client';
import { useQuery } from '@tanstack/react-query';
import { learningSeriesService } from '@/lib/learning/learning-series-service';
export function SeriesSelector({ value, lessonOrder, onChange, onOrderChange, domainId }: { value?: string; lessonOrder: number; onChange: (id: string) => void; onOrderChange: (value: number) => void; domainId?: string }) {
  const { data = [], isLoading } = useQuery({ queryKey: ['learning-series', domainId], queryFn: learningSeriesService.list, staleTime: 60000 });
  const filtered = domainId ? data.filter((series) => series.domainId === domainId) : [];
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_150px]"><label className="space-y-1.5 text-sm font-medium">Series học tập<select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={!domainId || isLoading} className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Chọn Series...</option>{filtered.map((series) => <option key={series.id} value={series.id}>{series.title}</option>)}</select>{domainId && !isLoading && filtered.length === 0 && <span className="block text-xs font-normal text-muted-foreground">Chưa có Series cho lĩnh vực này.</span>}</label><label className="space-y-1.5 text-sm font-medium">Số thứ tự bài<input type="number" min={1} value={lessonOrder} onChange={(e) => onOrderChange(Math.max(1, Number(e.target.value) || 1))} className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label></div>;
}
