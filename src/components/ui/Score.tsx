/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface ScoreIndicatorProps {
  id?: string;
  score: number; // 0 - 100
  title?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreIndicator({
  id,
  score,
  title = 'Score de Fit Comercial',
  showIcon = true,
  size = 'md',
}: ScoreIndicatorProps) {
  // Bound score
  const boundedScore = Math.min(Math.max(score, 0), 100);

  // Define scale styling
  const getScaleColor = (val: number) => {
    if (val <= 40) {
      return {
        bg: 'bg-rose-50 border-rose-100',
        text: 'text-rose-700',
        ring: 'ring-rose-600/20',
        bar: 'bg-rose-500',
        radial: 'stroke-rose-500',
        label: 'Baixo Acoplamento',
        icon: <ShieldAlert className="h-4 w-4 text-rose-500" />,
      };
    } else if (val <= 70) {
      return {
        bg: 'bg-amber-50 border-amber-100',
        text: 'text-amber-700',
        ring: 'ring-amber-600/20',
        bar: 'bg-amber-500',
        radial: 'stroke-amber-500',
        label: 'Médio Acoplamento',
        icon: <Zap className="h-4 w-4 text-amber-500" />,
      };
    } else {
      return {
        bg: 'bg-emerald-50 border-emerald-100',
        text: 'text-emerald-700',
        ring: 'ring-emerald-600/20',
        bar: 'bg-emerald-500',
        radial: 'stroke-emerald-500',
        label: 'Excelente Fit Comercial',
        icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
      };
    }
  };

  const scale = getScaleColor(boundedScore);

  // Sizes for radial chart
  const sizing = {
    sm: { radius: 18, stroke: 3.5, sizeClass: 'h-10 w-10 text-xs' },
    md: { radius: 32, stroke: 6, sizeClass: 'h-20 w-20 text-lg' },
    lg: { radius: 44, stroke: 8, sizeClass: 'h-28 w-28 text-2xl' },
  };

  const currentSize = sizing[size];
  const circumference = 2 * Math.PI * currentSize.radius;
  const strokeDashoffset = circumference - (boundedScore / 100) * circumference;

  return (
    <div id={id} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-xs font-sans">
      {/* Circle Graph */}
      <div className={`relative flex items-center justify-center shrink-0 ${currentSize.sizeClass}`}>
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            className="text-slate-100 stroke-current"
            strokeWidth={currentSize.stroke}
            fill="transparent"
            r={currentSize.radius}
            cx="50%"
            cy="50%"
          />
          {/* Progress circle */}
          <circle
            className={`stroke-current ${scale.radial} transition-all duration-500`}
            strokeWidth={currentSize.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={currentSize.radius}
            cx="50%"
            cy="50%"
          />
        </svg>
        <span className="absolute font-extrabold text-slate-800 leading-none">
          {boundedScore}
        </span>
      </div>

      {/* Info labels */}
      <div className="flex-1 min-w-0">
        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </h5>
        <div className="flex items-center gap-1.5 mt-1">
          {showIcon && scale.icon}
          <span className={`text-xs font-bold ${scale.text}`}>
            {scale.label}
          </span>
        </div>
        
        {/* Underline progress meter helper */}
        <div className="mt-2.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${scale.bar}`} style={{ width: `${boundedScore}%` }} />
        </div>
      </div>
    </div>
  );
}
