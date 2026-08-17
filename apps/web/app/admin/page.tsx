import React from 'react';
import Link from 'next/link';
import {
  Users,
  Flag,
  Sliders,
  FileSearch,
  FolderTree,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const ADMIN_MODULES = [
  {
    href: '/admin/users',
    title: 'User Account Governance',
    description: 'Manage user lifecycle states, suspend policy-violating accounts, and assign RBAC roles.',
    icon: Users,
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
  {
    href: '/admin/audit-logs',
    title: 'Security & Compliance Logs',
    description: 'Inspect immutable audit logs of all security events, role changes, and administrative actions.',
    icon: FileSearch,
  },
  {
    href: '/admin/categories',
    title: 'Content Category Management',
    description: 'Configure and maintain categories for curriculum series and community discussions.',
    icon: FolderTree,
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Platform Administration Console
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            System configuration, RBAC security governance, and operational controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {ADMIN_MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-lg border border-border bg-surface p-5 space-y-3 transition-all hover:border-primary/50 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-5 w-5" />
                  <h2 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {m.title}
                  </h2>
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
