'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { Status } from '../../types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center px-2.5 py-0.5
          text-xs font-medium rounded-full
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Helper para converter status em variant de badge
export function getStatusBadgeVariant(status: Status): BadgeVariant {
  switch (status) {
    case 'ativo':
      return 'success';
    case 'rascunho':
      return 'warning';
    case 'arquivado':
      return 'default';
    case 'cancelado':
      return 'danger';
    default:
      return 'default';
  }
}

export function getStatusLabel(status: Status): string {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'rascunho':
      return 'Rascunho';
    case 'arquivado':
      return 'Arquivado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
}
