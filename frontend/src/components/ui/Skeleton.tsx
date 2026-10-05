'use client';

import React from 'react';

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full divide-y divide-slate-200">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center px-6 py-4 animate-pulse">
          <div className="w-1/4 pr-4">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div className="w-1/4 pr-4">
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
          </div>
          <div className="w-1/5 pr-4">
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          </div>
          <div className="w-1/6 pr-4">
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          </div>
          <div className="w-1/12 flex justify-end space-x-2">
            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
  );
}
