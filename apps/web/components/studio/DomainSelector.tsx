'use client';
import { useQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/posts/posts-service';

export function DomainSelector({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const { data = [], isLoading } = useQuery({ queryKey: ['domains', 'learning'], queryFn: () => postsService.getDomains(), staleTime: 300000 });
  const learningCodes = new Set(['MONEY', 'TECH', 'CAREER', 'LIFE']);
  return <div className="space-y-1.5"><label htmlFor="post-domain-select" className="block text-xs font-medium text-foreground">Lĩnh vực học tập <span className="text-danger">*</span></label><select id="post-domain-select" value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={isLoading} className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"><option value="">Chọn lĩnh vực trước...</option>{data.filter((domain) => domain.isActive && learningCodes.has(domain.code)).map((domain) => <option key={domain.id} value={domain.id}>{domain.nameVi || domain.name}</option>)}</select></div>;
}
