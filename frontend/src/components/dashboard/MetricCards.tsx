'use client';

import React from 'react';
import { Users, UserCheck, UserX, Zap } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Agents */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Fleet
          </span>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalRecords}
          </h3>
          <p className="mt-1 text-xs text-slate-500">Registered delivery personnel</p>
        </div>
      </div>

      {/* Active Agents */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active on Duty
          </span>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {activeCount}
          </h3>
          <p className="mt-1 text-xs text-slate-500">Available for live order dispatch</p>
        </div>
      </div>

      {/* Inactive Agents */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Inactive / Off Duty
          </span>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-3xl font-extrabold text-slate-700 tracking-tight">
            {inactiveCount}
          </h3>
          <p className="mt-1 text-xs text-slate-500">Standby or suspended</p>
        </div>
      </div>

      {/* Redis Cache Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cache Acceleration
          </span>
          <div className={`p-2.5 rounded-xl ${isCached ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <Zap className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isCached ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isCached ? 'Redis HIT' : 'Direct DB'}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isCached ? 'Served in < 5ms via Redis Cache-Aside' : 'Queried directly from PostgreSQL'}
          </p>
        </div>
      </div>
    </div>
  );
}
