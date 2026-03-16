'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-slate-700 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-slate-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
