'use client';

import React from 'react';
import {
  Truck,
  LayoutDashboard,
  Users,
  MapPin,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({
  isOpen = true,
  onClose,
  activeTab = 'dashboard',
  onTabChange,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'service-areas', label: 'Service Areas', icon: MapPin },
  ];

  const handleSelectTab = (tabId: string) => {
    if (onTabChange) onTabChange(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="h-20 px-6 flex items-center border-b border-dark-700/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">ZOOP</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded uppercase tracking-wider">
                  FLEET OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Delivery Agent Management</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity Badge at Bottom (Clearly Decorative & Non-Interactive) */}
        <div className="p-4 border-t border-dark-700/60 bg-dark-900/90 select-none">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
              MO
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Md Osama</div>
              <div className="text-[10px] text-slate-400">Operations Admin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
