'use client';

import React from 'react';
import { Search, Filter, RotateCcw, UserPlus } from 'lucide-react';
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
  onOpenCreate: () => void;
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
  onOpenCreate,
  isLoading,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery !== '' || statusFilter !== '' || serviceAreaFilter !== '';

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by agent name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Primary Create Action */}
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Delivery Agent
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center text-xs font-semibold text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Filters:
          </div>

          {/* Status Pills */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => onStatusChange('')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                statusFilter === ''
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => onStatusChange('ACTIVE')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => onStatusChange('INACTIVE')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                statusFilter === 'INACTIVE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Inactive Only
            </button>
          </div>

          {/* Service Area Dropdown */}
          <select
            value={serviceAreaFilter}
            onChange={(e) => onServiceAreaChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="">All Service Areas</option>
            {serviceAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center text-xs text-rose-600 hover:text-rose-700 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );
}
