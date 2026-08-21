import React from 'react';
import Link from 'next/link';
import {
  Users,
  Flag,
  Sliders,
  FileSearch,
  FolderTree,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';

const ADMIN_MODULES = [
  {
    href: '/admin/posts',
    title: 'Post Moderation Queue',
    description: 'Review newly published articles, approve compliant posts, or ban policy-violating publications.',
    icon: FileCheck2,
    badge: 'Core Feature',
  },
  {
    href: '/admin/users',
    title: 'User Account Governance',
    description: 'Manage user lifecycle states, suspend policy-violating accounts, and assign RBAC roles.',
    icon: Users,
  },
  {
    href: '/moderation',
    title: 'Community Report Queue',
    description: 'Handle user-submitted reports for financial spam, misinformation, and toxic discussions.',
    icon: ShieldAlert,
  },
  {
    href: '/admin/categories',
    title: 'Content Category Management',
    description: 'Configure and maintain categories for curriculum series and community discussions.',
    icon: FolderTree,
  },
  {
    href: '/admin/audit-logs',
    title: 'Security & Compliance Logs',
    description: 'Inspect immutable audit logs of all security events, role changes, and administrative actions.',
    icon: FileSearch,
  },
  {
    href: '/admin/feature-flags',
    title: 'System Feature Flags',
    description: 'Enable or disable platform features and experimental UI components in real time.',
    icon: Flag,
  },
  {
    href: '/admin/settings',
    title: 'Runtime System Settings',
    description: 'Adjust operational parameters, system rate limits, and configuration values.',
    icon: Sliders,
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Platform Administration Console
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              System configuration, content moderation, RBAC governance, and operational controls.
            </p>
          </div>
        </div>

        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold shadow-xs hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Clock className="h-4 w-4" />
          <span>Mở Hàng đợi Duyệt bài</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {ADMIN_MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-xl border border-border bg-surface p-5 space-y-3 transition-all hover:border-primary/50 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Icon className="h-5 w-5" />
                    <h2 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {m.title}
                    </h2>
                  </div>
                  {m.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-2xs font-semibold">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-2xs font-mono text-primary font-semibold pt-2">
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
