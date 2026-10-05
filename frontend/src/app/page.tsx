'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, ApiError } from '../services/api';
import { DeliveryAgent, AgentStatus, PaginationMeta } from '../types/agent';
import { MetricCards } from '../components/dashboard/MetricCards';
import { FilterBar } from '../components/dashboard/FilterBar';
import { AgentTable } from '../components/dashboard/AgentTable';
import { AgentModal } from '../components/dashboard/AgentModal';
import { DeleteDialog } from '../components/dashboard/DeleteDialog';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and Query State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | ''>('');
  const [serviceAreaFilter, setServiceAreaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'status' | 'serviceArea'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals & Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<DeliveryAgent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<DeliveryAgent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch agents from API
  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiService.listAgents({
        page,
        limit: 10,
        status: statusFilter,
        serviceArea: serviceAreaFilter,
        q: debouncedSearch,
        sortBy,
        sortOrder,
      });

      setAgents(res.data);
      setPagination(res.meta.pagination);
      setIsCached(res.meta.cached ?? false);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to connect to backend server';
      setError(msg);
      addToast('error', 'Error Fetching Fleet Data', msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, serviceAreaFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Extract distinct service areas for the dropdown
  const distinctServiceAreas = useMemo(() => {
    const areas = new Set<string>();
    agents.forEach((a) => {
      if (a.serviceArea) areas.add(a.serviceArea);
    });
    return Array.from(areas).sort();
  }, [agents]);

  // Aggregate counts
  const activeCount = useMemo(() => agents.filter((a) => a.status === 'ACTIVE').length, [agents]);
  const inactiveCount = useMemo(() => agents.filter((a) => a.status === 'INACTIVE').length, [agents]);

  // Column sort toggle handler
  const handleSortChange = (column: 'createdAt' | 'name' | 'status' | 'serviceArea') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('');
    setServiceAreaFilter('');
    setPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Handle Create & Update submit
  const handleFormSubmit = async (formData: {
    name: string;
    phone: string;
    email: string;
    serviceArea: string;
    status: AgentStatus;
  }) => {
    if (agentToEdit) {
      await apiService.updateAgent(agentToEdit.id, formData);
      addToast('success', 'Agent Updated Successfully', `${formData.name}'s details were updated.`);
    } else {
      await apiService.createAgent(formData);
      addToast('success', 'Agent Registered', `${formData.name} was added to the active fleet.`);
    }
    await fetchAgents();
  };

  // Handle Delete confirm
  const handleDeleteConfirm = async (agentId: string) => {
    try {
      await apiService.deleteAgent(agentId);
      addToast('info', 'Agent Removed', 'The delivery agent was deleted from the system.');
      await fetchAgents();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete agent';
      addToast('error', 'Delete Failed', msg);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fleet Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time delivery personnel tracking, cache management, and zone assignments.
          </p>
        </div>

        <button
          onClick={() => fetchAgents()}
          disabled={isLoading}
          className="flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Tiles */}
      {isLoading && agents.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <MetricCards
          totalRecords={pagination?.totalRecords ?? agents.length}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          isCached={isCached}
        />
      )}

      {/* Search and Filters Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        serviceAreaFilter={serviceAreaFilter}
        onServiceAreaChange={(area) => {
          setServiceAreaFilter(area);
          setPage(1);
        }}
        serviceAreas={distinctServiceAreas}
        onReset={handleResetFilters}
        onOpenCreate={() => {
          setAgentToEdit(null);
          setIsModalOpen(true);
        }}
        isLoading={isLoading}
      />

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAgents()}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Agent Table / Loading Skeletons */}
      {isLoading && agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-2">
          <TableSkeleton rows={8} />
        </div>
      ) : (
        <AgentTable
          agents={agents}
          pagination={pagination}
          onPageChange={setPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onEdit={(agent) => {
            setAgentToEdit(agent);
            setIsModalOpen(true);
          }}
          onDelete={(agent) => {
            setAgentToDelete(agent);
            setIsDeleteDialogOpen(true);
          }}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Create / Edit Modal */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAgentToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        agentToEdit={agentToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        agent={agentToDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setAgentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
