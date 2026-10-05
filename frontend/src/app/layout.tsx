import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { Truck, ShieldCheck, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zoop Delivery Agent Management System',
  description: 'Production-ready logistics fleet dashboard with Redis caching, PostgreSQL persistence, and real-time operations telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased flex flex-col">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black tracking-tight text-slate-900">ZOOP</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wider">
                    Fleet Ops
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Delivery Agent Management</p>
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Prisma PostgreSQL</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-50 text-xs font-semibold text-amber-800 border border-amber-200/60">
                <Activity className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Redis Accelerated</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4">
            Zoop Delivery Agent Management System &bull; Production Backend & Full-Stack Submission
          </div>
        </footer>
      </body>
    </html>
  );
}
