'use client';

import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Copy,
  Check,
} from 'lucide-react';
import { DeliveryAgent, PaginationMeta } from '../../types/agent';

interface AgentTableProps {
  agents: DeliveryAgent[];
  pagination?: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  sortBy: 'createdAt' | 'name' | 'status' | 'serviceArea';
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: 'createdAt' | 'name' | 'status' | 'serviceArea') => void;
  selectedAgentId?: string | null;
  onViewDetails: (agent: DeliveryAgent) => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
  onResetFilters?: () => void;
}

export function AgentTable({
  agents,
  pagination,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSortChange,
  selectedAgentId,
  onViewDetails,
  onEdit,
  onDelete,
  onResetFilters,
}: AgentTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSortIcon = (column: 'createdAt' | 'name' | 'status' | 'serviceArea') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-500 opacity-40 group-hover:opacity-100 transition" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-indigo-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-indigo-400 font-bold" />
    );
  };

  if (agents.length === 0) {
    return (
      <div className="bg-dark-850 rounded-2xl border border-dark-700/80 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-dark-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dark-700">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-white">No Delivery Agents Found</h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          No records match your active search terms or filter criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold rounded-xl transition"
          >
            Clear Filters & View All
          </button>
        )}
      </div>
    );
  }

  // Calculate row offset for numbering
  const pageOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;

  return (
    <div className="bg-dark-850 rounded-2xl border border-dark-700/80 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-dark-900/80 border-b border-dark-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th
                onClick={() => onSortChange('name')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center">
                  <span>Agent Info</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="py-3.5 px-6">Contact Details</th>
              <th
                onClick={() => onSortChange('serviceArea')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center">
                  <span>Service Area</span>
                  {renderSortIcon('serviceArea')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('createdAt')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center">
                  <span>Registered</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-750 text-xs font-normal">
            {agents.map((agent, index) => {
              const isSelected = selectedAgentId === agent.id;
              // Initials for avatar
              const initials = agent.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <tr
                  key={agent.id}
                  onClick={() => onViewDetails(agent)}
                  className={`hover:bg-dark-800/80 transition-colors duration-150 cursor-pointer group ${
                    isSelected ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  {/* Row Index */}
                  <td className="py-4 px-4 text-center text-slate-500 font-mono text-[11px]">
                    {pageOffset + index + 1}
                  </td>

                  {/* Agent Info: Avatar, Name, Shortened ID */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-400 transition">
                          {agent.name}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                            {agent.id.slice(0, 16)}...
                          </span>
                          <button
                            onClick={(e) => handleCopyId(e, agent.id)}
                            className="text-slate-500 hover:text-slate-300 transition"
                            title="Copy UUID"
                          >
                            {copiedId === agent.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Details: Phone, Email */}
                  <td className="py-4 px-6 space-y-1">
                    <div className="flex items-center text-slate-300 font-medium">
                      <Phone className="w-3 h-3 mr-1.5 text-slate-500 flex-shrink-0" />
                      <span>{agent.phone}</span>
                    </div>
                    <div className="flex items-center text-slate-400">
                      <Mail className="w-3 h-3 mr-1.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{agent.email}</span>
                    </div>
                  </td>

                  {/* Service Area Pill */}
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-dark-800 text-slate-300 border border-dark-700 font-medium">
                      <MapPin className="w-3 h-3 mr-1 text-indigo-400" />
                      <span>{agent.serviceArea}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6">
                    {agent.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Registered Timestamp */}
                  <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                    <div>
                      {new Date(agent.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(agent.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => onViewDetails(agent)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-dark-750 border border-transparent hover:border-dark-700 rounded-lg transition"
                        title="View Dossier"
                        aria-label={`View ${agent.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(agent)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-dark-750 border border-transparent hover:border-dark-700 rounded-lg transition"
                        title="Edit Details"
                        aria-label={`Edit ${agent.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(agent)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition"
                        title="Delete Agent"
                        aria-label={`Delete ${agent.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-6 py-4 bg-dark-900/60 border-t border-dark-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{pageOffset + 1}</span> to{' '}
            <span className="font-bold text-white">
              {Math.min(pagination.page * pagination.limit, pagination.totalRecords)}
            </span>{' '}
            of <span className="font-bold text-white">{pagination.totalRecords}</span> agents
          </div>

          <div className="flex items-center space-x-3">
            {/* Page Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-1.5 rounded-lg border border-dark-700 text-slate-400 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                const isCurrent = pagination.page === pageNumber;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-dark-800 border border-dark-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-1.5 rounded-lg border border-dark-700 text-slate-400 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rows Per Page Dropdown */}
            {onLimitChange && (
              <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-dark-700 text-slate-400">
                <span>Rows per page</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="bg-dark-800 border border-dark-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={5} className="bg-dark-900">5</option>
                  <option value={10} className="bg-dark-900">10</option>
                  <option value={20} className="bg-dark-900">20</option>
                  <option value={50} className="bg-dark-900">50</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
