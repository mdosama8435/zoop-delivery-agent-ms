import type { Metadata } from 'next';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'ZOOP Fleet Ops — Delivery Agent Management System',
  description: 'Enterprise fleet operations dashboard with Redis caching, PostgreSQL persistence, and real-time operations telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
