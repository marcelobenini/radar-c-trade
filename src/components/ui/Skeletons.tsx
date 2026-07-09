/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skeleton } from './Feedback';

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="p-4 space-y-4">
        {/* Table Header */}
        <div className="flex gap-4 pb-2 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, idx) => (
            <Skeleton key={`head-${idx}`} className="h-3 flex-1" />
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={`row-${rIdx}`} className="flex gap-4 py-1 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div key={`cell-${rIdx}-${cIdx}`} className="flex-1 space-y-1">
                <Skeleton className="h-4 w-4/5" />
                {cIdx === 0 && <Skeleton className="h-3 w-1/2" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="h-48 flex items-end gap-3 pt-6 px-2">
        {Array.from({ length: 12 }).map((_, idx) => {
          const heights = ['h-1/4', 'h-1/2', 'h-2/3', 'h-1/3', 'h-3/4', 'h-5/6', 'h-1/2', 'h-2/5', 'h-4/5', 'h-1/3', 'h-2/3', 'h-full'];
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <Skeleton className={`w-full ${heights[idx]} rounded-t-md`} />
              <Skeleton className="h-2 w-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VisaoGeralSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-wrap gap-3 items-center justify-between shadow-2xs">
        <div className="flex gap-3 flex-wrap flex-1">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      {/* Grid KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ChartSkeleton />
          <TableSkeleton rows={4} cols={4} />
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientesSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4 flex gap-3 flex-wrap">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

export function ProdutosSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RelatoriosSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="h-64 flex items-end justify-between px-4 pt-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="w-12 h-2/3 rounded-t-lg" style={{ height: `${20 + idx * 10}%` }} />
              ))}
            </div>
          </div>
          <TableSkeleton rows={4} cols={4} />
        </div>
      </div>
    </div>
  );
}

export function InteligenciaSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
