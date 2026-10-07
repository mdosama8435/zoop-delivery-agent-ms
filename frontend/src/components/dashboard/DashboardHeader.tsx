'use client';

import React from 'react';
import { Calendar, UserPlus, BarChart3 } from 'lucide-react';

interface DashboardHeaderProps {
  totalCount: number;
  onOpenCreate: () => void;
}

export function DashboardHeader({ totalCount, onOpenCreate }: DashboardHeaderProps) {
  // Compute truthful dynamic current date
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8">
      {/* Left Greeting & Titles */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1.5">
          <span>Hello, Osama</span>
          <span className="inline-block animate-wave">👋</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-gradient-brand">Fleet Operations Dashboard</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
          Delivery personnel management, fleet availability, and service-area operations.
        </p>
      </div>

      {/* Right Controls: Mini Total Stat, Date Card, and Add Button */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        {/* Total Agents Quick Tile */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-dark-850 border border-dark-700/80 shadow-sm">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-black text-white leading-none">{totalCount}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Agents
            </div>
          </div>
        </div>

        {/* Dynamic Date Indicator */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-dark-850 border border-dark-700/80 shadow-sm select-none">
          <div className="p-2 rounded-xl bg-dark-750 text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white leading-none">{dateFormatted}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{dayOfWeek}</div>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onOpenCreate}
          className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Delivery Agent</span>
        </button>
      </div>
    </div>
  );
}
