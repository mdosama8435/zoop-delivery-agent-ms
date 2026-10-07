'use client';

import React from 'react';
import { Search, RefreshCw, X, Filter } from 'lucide-react';
import { AgentStatus } from '../../types/agent';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: AgentStatus | '';
  onStatusChange: (status: AgentStatus | '') => void;
  serviceAreaFilter: string;
  onServiceAreaChange: (area: string) => void;
  serviceAreas: string[];
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceAreaFilter,
  onServiceAreaChange,
  serviceAreas,
  onReset,
  onRefresh,
  isLoading,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery !== '' || statusFilter !== '' || serviceAreaFilter !== '';

  return (
    <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700/80 mb-6 shadow-sm space-y-3.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by agent name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Action: Refresh Data */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white border border-dark-700 rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dark-700/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as AgentStatus | '')}
              className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
            >
              <option value="" className="bg-dark-900 text-slate-200">All Status</option>
              <option value="ACTIVE" className="bg-dark-900 text-slate-200">Active Status</option>
              <option value="INACTIVE" className="bg-dark-900 text-slate-200">Inactive Status</option>
            </select>
          </div>

          {/* Quick Filter Pills */}
          <button
            onClick={() => onStatusChange(statusFilter === 'ACTIVE' ? '' : 'ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700'
            }`}
          >
            Active Only
          </button>

          <button
            onClick={() => onStatusChange(statusFilter === 'INACTIVE' ? '' : 'INACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'INACTIVE'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700'
            }`}
          >
            Inactive Only
          </button>

          {/* Service Area Dropdown */}
          <div className="relative">
            <select
              value={serviceAreaFilter}
              onChange={(e) => onServiceAreaChange(e.target.value)}
              className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition cursor-pointer max-w-[200px]"
            >
              <option value="" className="bg-dark-900 text-slate-200">All Service Areas</option>
              {serviceAreas.map((area) => (
                <option key={area} value={area} className="bg-dark-900 text-slate-200">
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition flex items-center space-x-1"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
