'use client';

import React from 'react';
import {
  Menu,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  systemStatus?: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'connecting';
    database: string;
    redis: string;
  };
}

export function TopBar({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  systemStatus = {
    status: 'healthy',
    database: 'connected',
    redis: 'connected',
  },
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-20 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-dark-800 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search agents, email, phone number, or service area..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-dark-800/80 border border-dark-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-dark-700 border border-dark-600 rounded">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-dark-700 border border-dark-600 rounded">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Live Telemetry Badges & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* System Online Badge */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {systemStatus.status === 'healthy'
              ? 'System Online'
              : systemStatus.status === 'degraded'
              ? 'System Degraded'
              : 'System Checking'}
          </span>
        </div>

        {/* PostgreSQL Status */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Prisma PostgreSQL</span>
        </div>

        {/* Redis Status */}
        <div
          className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            systemStatus.redis === 'connected'
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>
            {systemStatus.redis === 'connected'
              ? 'Redis Connected'
              : systemStatus.redis === 'connecting'
              ? 'Redis Connecting'
              : 'Redis Disconnected'}
          </span>
        </div>

        {/* User Identity Avatar (Decorative, Non-Interactive) */}
        <div 
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-500/20 select-none cursor-default"
          title="Md Osama (Operations Admin)"
        >
          MO
        </div>
      </div>
    </header>
  );
}
