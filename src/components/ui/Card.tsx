/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function Card({ children, id, className = '', ...props }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow duration-300 font-sans ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
  };
  comparisonText?: string;
  className?: string;
}

export function MetricCard({
  id,
  title,
  value,
  icon,
  trend,
  comparisonText,
  className = '',
}: MetricCardProps) {
  return (
    <Card id={id} className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && <div className="text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 shrink-0">{icon}</div>}
      </div>

      <div className="mt-3.5">
        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {value}
        </h3>
      </div>

      {(trend || comparisonText) && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                trend.type === 'up'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10'
                  : trend.type === 'down'
                  ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10'
                  : 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-600/10'
              }`}
            >
              {trend.type === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend.type === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
          {comparisonText && (
            <span className="text-xs text-slate-400 font-medium">
              {comparisonText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

interface InsightCardProps {
  id?: string;
  title: string;
  content: string;
  category?: string;
  className?: string;
}

export function InsightCard({
  id,
  title,
  content,
  category = 'Insight de IA',
  className = '',
}: InsightCardProps) {
  return (
    <div
      id={id}
      className={`relative rounded-xl border border-blue-100 bg-blue-50/30 p-5 shadow-xs hover:border-blue-200 transition-all font-sans overflow-hidden ${className}`}
    >
      {/* Sparkles background effect */}
      <div className="absolute top-0 right-0 p-3 text-blue-500/20 pointer-events-none">
        <Lightbulb className="h-16 w-16 rotate-12" />
      </div>

      <div className="relative">
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-700/10 mb-3">
          <Lightbulb className="h-3 w-3 mr-1 text-blue-600" />
          {category}
        </span>
        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1.5">
          {title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

interface AlertCardProps {
  id?: string;
  title: string;
  content: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  className?: string;
}

export function AlertCard({
  id,
  title,
  content,
  type = 'warning',
  className = '',
}: AlertCardProps) {
  const styles = {
    warning: {
      bg: 'bg-amber-50/50 border-amber-100 text-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      titleColor: 'text-amber-900',
    },
    danger: {
      bg: 'bg-rose-50/50 border-rose-100 text-rose-800',
      icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
      titleColor: 'text-rose-900',
    },
    info: {
      bg: 'bg-blue-50/50 border-blue-100 text-blue-800',
      icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
      titleColor: 'text-blue-900',
    },
    success: {
      bg: 'bg-emerald-50/50 border-emerald-100 text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      titleColor: 'text-emerald-900',
    },
  };

  return (
    <div
      id={id}
      className={`flex gap-3.5 rounded-xl border p-4 font-sans ${styles[type].bg} ${className}`}
    >
      <div className="shrink-0 mt-0.5">
        {styles[type].icon}
      </div>
      <div>
        <h4 className={`text-sm font-bold leading-tight ${styles[type].titleColor}`}>
          {title}
        </h4>
        <p className="text-xs mt-1 text-slate-600 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
