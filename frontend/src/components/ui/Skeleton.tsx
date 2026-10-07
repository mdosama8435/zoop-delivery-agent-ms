'use client';

import React from 'react';

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="h-10 bg-dark-800 rounded-xl w-full" />

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-dark-800/60 rounded-xl w-full flex items-center px-4 space-x-4">
          <div className="w-6 h-4 bg-dark-750 rounded" />
          <div className="w-8 h-8 rounded-full bg-dark-750" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-750 rounded w-1/3" />
            <div className="h-3 bg-dark-750/70 rounded w-1/4" />
          </div>
          <div className="w-24 h-4 bg-dark-750 rounded hidden sm:block" />
          <div className="w-20 h-6 bg-dark-750 rounded-full" />
          <div className="w-16 h-8 bg-dark-750 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700/80 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-dark-800" />
        <div className="w-20 h-4 bg-dark-800 rounded" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="w-16 h-8 bg-dark-800 rounded" />
        <div className="w-32 h-3 bg-dark-800 rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-dark-700/60 w-full h-4 bg-dark-800/60 rounded" />
    </div>
  );
}
