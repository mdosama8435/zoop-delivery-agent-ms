'use client';

import React from 'react';
import { Users, UserCheck, UserX, Zap, TrendingUp } from 'lucide-react';

interface MetricCardsProps {
  totalRecords: number;
  activeCount: number;
  inactiveCount: number;
  isCached: boolean;
}

export function MetricCards({
  totalRecords,
  activeCount,
  inactiveCount,
  isCached,
}: MetricCardsProps) {
  // Safe real calculations
  const totalSafe = Math.max(totalRecords, 1);
  const activePercent = ((activeCount / totalSafe) * 100).toFixed(1);
  const inactivePercent = ((inactiveCount / totalSafe) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* 1. TOTAL FLEET */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700/80 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            TOTAL FLEET
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-white tracking-tight">{totalRecords}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Registered delivery personnel</p>
        </div>

        {/* Real Dynamic Indicator */}
        <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center text-xs text-indigo-400 font-semibold space-x-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active fleet directory</span>
        </div>
      </div>

      {/* 2. ACTIVE ON DUTY */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ACTIVE ON DUTY
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-emerald-400 tracking-tight">{activeCount}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Currently active delivery personnel</p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mt-4 pt-3 border-t border-dark-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Fleet Utilization</span>
            <span className="text-emerald-400 font-bold">{activePercent}% of total</span>
          </div>
          <div className="w-full h-1.5 bg-dark-750 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(activePercent), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. INACTIVE / OFF DUTY */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700/80 relative overflow-hidden group hover:border-rose-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400">
            <UserX className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            INACTIVE / OFF DUTY
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-rose-400 tracking-tight">{inactiveCount}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Currently inactive delivery personnel</p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mt-4 pt-3 border-t border-dark-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Standby Share</span>
            <span className="text-rose-400 font-bold">{inactivePercent}% of total</span>
          </div>
          <div className="w-full h-1.5 bg-dark-750 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(inactivePercent), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. CACHE ACCELERATION */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700/80 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
              isCached
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-dark-750 text-slate-400 border border-dark-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCached ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{isCached ? 'Cache Hit' : 'Cache Miss'}</span>
          </span>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>{isCached ? 'Redis HIT' : 'Direct DB (MISS)'}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {isCached ? 'Served in < 5ms via Redis Cache-Aside' : 'Queried directly from PostgreSQL'}
          </p>
        </div>

        {/* Mini Performance Bar Graphic */}
        <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs text-slate-400">
          <span>Latency Pipeline</span>
          <div className="flex items-end space-x-1 h-3.5">
            <span className={`w-1 rounded-xs h-1.5 ${isCached ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span className={`w-1 rounded-xs h-2.5 ${isCached ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span className={`w-1 rounded-xs h-3.5 ${isCached ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className={`w-1 rounded-xs h-2 ${isCached ? 'bg-emerald-500' : 'bg-slate-600'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
