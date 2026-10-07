'use client';

import React from 'react';
import {
  MapPin,
  Users,
  UserCheck,
  ArrowRight,
  RefreshCw,
  Shield,
} from 'lucide-react';

export interface ZoneData {
  area: string;
  total: number;
  active: number;
  inactive: number;
}

interface ServiceAreasViewProps {
  zones: ZoneData[];
  onSelectArea: (area: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ServiceAreasView({
  zones,
  onSelectArea,
  onRefresh,
  isLoading,
}: ServiceAreasViewProps) {
  // Real calculations
  const totalZones = zones.length;
  const totalAgents = zones.reduce((sum, z) => sum + z.total, 0);
  const totalActive = zones.reduce((sum, z) => sum + z.active, 0);
  const activeRate = totalAgents > 0 ? ((totalActive / totalAgents) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <MapPin className="w-6 h-6 text-indigo-400" />
            <span>Service Area Territories</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live deployment and capacity distribution across registered delivery zones in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-dark-700/80 rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            title="Refresh Territories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh Territories</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Configured Territories</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalZones}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Metropolitan service zones</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Stationed Personnel</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalAgents}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to active territories</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Deployment Rate</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{activeRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{totalActive} of {totalAgents} on duty</div>
        </div>
      </div>

      {/* Territory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const zoneActiveRate = ((zone.active / zone.total) * 100).toFixed(0);

          return (
            <div
              key={zone.area}
              className="p-5 rounded-2xl bg-dark-850 border border-dark-700/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
                        {zone.area}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {zone.total} {zone.total === 1 ? 'agent assigned' : 'agents assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-dark-700/60">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    {zone.active} Active
                  </span>

                  {zone.inactive > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1" />
                      {zone.inactive} Standby
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono ml-auto">
                    {zoneActiveRate}% on duty
                  </span>
                </div>
              </div>

              {/* Action Button: Filter Main Table to this Zone */}
              <button
                onClick={() => onSelectArea(zone.area)}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-dark-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-dark-700 hover:border-indigo-500/40 text-xs font-semibold flex items-center justify-between transition group/btn"
              >
                <span>Filter Fleet by This Zone</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 group-hover/btn:text-indigo-300 transition" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
