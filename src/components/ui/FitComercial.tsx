/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, AlertCircle, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface FitComercialData {
  score: number;
  label: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Bom' | 'Excelente';
  colorClass: string; // text and background classes
  bgClass: string;
  borderClass: string;
  barClass: string;
  icon: React.ReactNode;
}

export function getFitComercialData(score: number): FitComercialData {
  const boundedScore = Math.min(Math.max(Math.round(score), 0), 100);

  if (boundedScore <= 20) {
    return {
      score: boundedScore,
      label: 'Muito Baixo',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
      barClass: 'bg-rose-500',
      icon: <ShieldAlert className="h-4 w-4 text-rose-500" />
    };
  } else if (boundedScore <= 40) {
    return {
      score: boundedScore,
      label: 'Baixo',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-200',
      barClass: 'bg-orange-500',
      icon: <AlertCircle className="h-4 w-4 text-orange-500" />
    };
  } else if (boundedScore <= 60) {
    return {
      score: boundedScore,
      label: 'Médio',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-250',
      barClass: 'bg-amber-500',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
    };
  } else if (boundedScore <= 80) {
    return {
      score: boundedScore,
      label: 'Bom',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      barClass: 'bg-blue-500',
      icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />
    };
  } else {
    return {
      score: boundedScore,
      label: 'Excelente',
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-250',
      barClass: 'bg-emerald-500',
      icon: <Sparkles className="h-4 w-4 text-emerald-600" />
    };
  }
}

interface FitComercialProps {
  id?: string;
  score: number;
  variant?: 'card' | 'badge' | 'bar' | 'compact';
  title?: string;
  showIcon?: boolean;
}

export default function FitComercial({
  id,
  score,
  variant = 'card',
  title = 'Fit Comercial',
  showIcon = true
}: FitComercialProps) {
  const data = getFitComercialData(score);

  if (variant === 'badge') {
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${data.bgClass} ${data.colorClass} ${data.borderClass}`}
      >
        {showIcon && data.icon}
        <span>{data.score} pts • {data.label}</span>
      </span>
    );
  }

  if (variant === 'bar') {
    return (
      <div id={id} className="flex flex-col gap-1 w-full font-sans">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className={`px-1.5 py-0.5 rounded border font-black ${data.bgClass} ${data.colorClass} ${data.borderClass}`}>
            {data.score} pts • {data.label}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${data.barClass} transition-all duration-500`}
            style={{ width: `${data.score}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div id={id} className="flex items-center gap-2 font-sans">
        <div className={`flex items-center justify-center h-8 w-8 rounded-full border font-black text-xs ${data.bgClass} ${data.colorClass} ${data.borderClass}`}>
          {data.score}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Fit</span>
          <span className={`text-xs font-black ${data.colorClass}`}>{data.label}</span>
        </div>
      </div>
    );
  }

  // Default: detailed 'card' layout
  return (
    <div
      id={id}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border bg-white shadow-xs gap-4 font-sans ${data.borderClass}`}
    >
      <div className="flex items-center gap-4">
        {/* Score Circular badge */}
        <div className={`flex items-center justify-center h-14 w-14 rounded-full border-2 font-black text-lg shadow-sm shrink-0 ${data.bgClass} ${data.colorClass} ${data.borderClass}`}>
          {data.score}
        </div>

        <div className="space-y-0.5">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</h5>
          <div className="flex items-center gap-1.5">
            {showIcon && data.icon}
            <span className={`text-sm font-black ${data.colorClass}`}>
              {data.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Aderência do cardápio e perfil do cliente ao portfólio C-Trade
          </p>
        </div>
      </div>

      {/* Progress Bar and mini stats */}
      <div className="flex-1 max-w-xs space-y-2 shrink-0">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100/50">
          <div
            className={`h-full ${data.barClass} transition-all duration-500`}
            style={{ width: `${data.score}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <span>Muito Baixo</span>
          <span>Excelente</span>
        </div>
      </div>
    </div>
  );
}
