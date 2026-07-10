/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, AlertCircle, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Minus, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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
      borderClass: 'border-rose-250',
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

export interface FitHistoryItem {
  id: string;
  date: string;
  from: number;
  to: number;
  reason: string;
  trend: 'up' | 'down' | 'stable';
}

interface FitComercialProps {
  id?: string;
  score: number;
  variant?: 'card' | 'badge' | 'bar' | 'compact';
  title?: string;
  showIcon?: boolean;
  history?: FitHistoryItem[];
  lastUpdated?: string;
}

export default function FitComercial({
  id,
  score,
  variant = 'card',
  title = 'Fit Comercial',
  showIcon = true,
  history,
  lastUpdated
}: FitComercialProps) {
  const data = getFitComercialData(score);
  const [showHistory, setShowHistory] = useState(false);

  // Extract trend information dynamically from history
  let trendType: 'up' | 'down' | 'stable' = 'stable';
  let scoreDiff = 0;
  let lastUpdateStr = lastUpdated || 'Hoje';

  if (history && history.length > 0) {
    const latestEvent = history[0];
    scoreDiff = latestEvent.to - latestEvent.from;
    trendType = latestEvent.trend;
    if (latestEvent.date) {
      lastUpdateStr = latestEvent.date;
    }
  }

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
          {history && history.length > 0 && (
            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
              {trendType === 'up' ? (
                <span className="text-emerald-500 font-black">↑ evoluindo</span>
              ) : trendType === 'down' ? (
                <span className="text-rose-500 font-black">↓ reduzindo</span>
              ) : (
                <span className="text-slate-400 font-black">→ estável</span>
              )}
            </span>
          )}
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
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none flex items-center gap-1">
            Fit
            {trendType === 'up' ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : trendType === 'down' ? (
              <TrendingDown className="h-3 w-3 text-rose-500" />
            ) : (
              <Minus className="h-3 w-3 text-slate-400" />
            )}
          </span>
          <span className={`text-xs font-black ${data.colorClass}`}>{data.label}</span>
        </div>
      </div>
    );
  }

  // CS-inspired 'Saúde da Conta' visual layout (card)
  return (
    <div
      id={id}
      className={`flex flex-col p-4 rounded-xl border bg-white shadow-xs gap-3 font-sans w-full border-slate-200`}
    >
      {/* Current State / Score presentation */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">{title}</h5>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{data.score}</span>
            <span className="text-xs font-bold text-slate-400">/100</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${data.bgClass} ${data.colorClass} ${data.borderClass}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0 animate-pulse" />
          {data.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${data.barClass} transition-all duration-500`}
          style={{ width: `${data.score}%` }}
        />
      </div>

      {/* CS Health Subtitle Elements */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px] font-medium text-slate-500">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Última atualização</span>
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Clock className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{lastUpdateStr}</span>
          </div>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Tendência de Evolução</span>
          <div className="flex items-center gap-1">
            {trendType === 'up' ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 font-bold">{scoreDiff > 0 ? `+${scoreDiff}` : ''} Evoluindo</span>
              </>
            ) : trendType === 'down' ? (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-700 font-bold">{scoreDiff < 0 ? `${scoreDiff}` : ''} Reduzindo</span>
              </>
            ) : (
              <>
                <Minus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-bold">Estável</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Log Collapsible Section */}
      {history && history.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-[10px] text-blue-900 font-bold hover:text-blue-950 uppercase tracking-wider py-1 hover:bg-slate-50/50 rounded px-1 transition-colors"
          >
            <span>Histórico de Recálculos ({history.length})</span>
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1 border-l border-slate-100 pl-2 ml-1">
              {history.map((event, idx) => (
                <div key={event.id || idx} className="text-[10px] space-y-0.5 pb-1 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between font-bold text-slate-400">
                    <span>{event.date}</span>
                    <span className={event.trend === 'up' ? 'text-emerald-600' : event.trend === 'down' ? 'text-rose-600' : 'text-slate-500'}>
                      {event.from} → {event.to} pts
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium leading-normal">{event.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
