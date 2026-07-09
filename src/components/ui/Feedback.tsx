/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, X, HelpCircle } from 'lucide-react';

// 1. Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const styles = {
    primary: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    secondary: 'bg-slate-50 text-slate-600 ring-slate-600/10',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    info: 'bg-indigo-50 text-indigo-700 ring-indigo-600/10',
    dark: 'bg-slate-900 text-slate-100 ring-slate-800',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// 2. Chip / Tag Component
interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
  colorClass?: string;
}

export function Tag({ label, onRemove, className = '', colorClass = 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' }: TagProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors duration-150 ${colorClass} ${className}`}>
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full p-0.5 hover:bg-slate-300/50 hover:text-slate-900 focus:outline-hidden"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

// 3. Alerts & Inline/Floating Toast system
export interface ToastProps {
  message: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export function Toast({ message, description, type = 'info', onClose }: ToastProps) {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  return (
    <div className={`p-4 rounded-xl border flex gap-3 shadow-md max-w-sm pointer-events-auto font-sans ${colors[type]}`}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <h5 className="text-xs font-bold leading-none">{message}</h5>
        {description && <p className="text-[11px] mt-1 text-slate-600 leading-normal">{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 self-start">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// 4. Empty State
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-xl max-w-lg mx-auto font-sans shadow-xs">
      <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-4 text-slate-400 shrink-0">
        {icon || <HelpCircle className="h-6 w-6 text-slate-300" />}
      </div>
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-xs leading-normal">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// 5. Skeleton Loader
export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} {...props} />;
}

// 6. Spinner
export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin text-slate-400 ${className}`} />;
}

// 7. Progress Bar
export function ProgressBar({ value, max = 100, colorClass = 'bg-blue-600' }: { value: number; max?: number; colorClass?: string }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// 8. Loading Overlay
export function LoadingOverlay({ message = 'Processando...' }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center font-sans">
      <div className="bg-white px-5 py-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
        <Spinner className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-semibold text-slate-800">{message}</span>
      </div>
    </div>
  );
}

// 9. Tooltip component
interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-md whitespace-nowrap pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
