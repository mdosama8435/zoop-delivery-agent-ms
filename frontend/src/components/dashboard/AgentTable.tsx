'use client';

import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { DeliveryAgent, PaginationMeta } from '../../types/agent';

interface AgentTableProps {
  agents: DeliveryAgent[];
  pagination?: PaginationMeta;
  onPageChange: (newPage: number) => void;
  sortBy: 'createdAt' | 'name' | 'status' | 'serviceArea';
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: 'createdAt' | 'name' | 'status' | 'serviceArea') => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
  onResetFilters?: () => void;
}

export function AgentTable({
  agents,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  onResetFilters,
}: AgentTableProps) {
  const renderSortIcon = (column: 'createdAt' | 'name' | 'status' | 'serviceArea') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-400 opacity-0 group-hover:opacity-100 transition" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-indigo-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-indigo-600 font-bold" />
    );
  };

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-slate-800">No Delivery Agents Found</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No records match your active search terms or filter criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition"
          >
            Clear Filters & View All
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th
                onClick={() => onSortChange('name')}
                className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/60 transition group select-none"
              >
                <div className="flex items-center">
                  <span>Agent Info</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="py-3.5 px-6 select-none">Contact Details</th>
              <th
                onClick={() => onSortChange('serviceArea')}
                className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/60 transition group select-none"
              >
                <div className="flex items-center">
                  <span>Service Area</span>
                  {renderSortIcon('serviceArea')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/60 transition group select-none"
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('createdAt')}
                className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/60 transition group select-none"
              >
                <div className="flex items-center">
                  <span>Registered</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th className="py-3.5 px-6 text-right select-none">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-normal">
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-slate-50/70 transition duration-150 group"
              >
                {/* Agent Name & ID */}
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {agent.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                    {agent.id}
                  </div>
                </td>

                {/* Contact (Phone & Email) */}
                <td className="py-4 px-6 space-y-1">
                  <div className="flex items-center text-xs text-slate-700 font-medium">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                    <span>{agent.phone}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{agent.email}</span>
                  </div>
                </td>

                {/* Service Area */}
                <td className="py-4 px-6">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                    {agent.serviceArea}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-4 px-6">
                  {agent.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                      Inactive
                    </span>
                  )}
                </td>

                {/* Registered Date */}
                <td className="py-4 px-6 text-xs text-slate-500">
                  {new Date(agent.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center space-x-1.5">
                    <button
                      onClick={() => onEdit(agent)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Agent Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(agent)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.totalRecords)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">
              {pagination.totalRecords}
            </span>{' '}
            agents
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className={`p-1.5 rounded-lg border flex items-center transition ${
                pagination.hasPrevPage
                  ? 'border-slate-300 text-slate-700 hover:bg-white'
                  : 'border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`p-1.5 rounded-lg border flex items-center transition ${
                pagination.hasNextPage
                  ? 'border-slate-300 text-slate-700 hover:bg-white'
                  : 'border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
