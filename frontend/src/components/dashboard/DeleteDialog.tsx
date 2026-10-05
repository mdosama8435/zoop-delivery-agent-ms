'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { DeliveryAgent } from '../../types/agent';

interface DeleteDialogProps {
  isOpen: boolean;
  agent: DeliveryAgent | null;
  onClose: () => void;
  onConfirm: (agentId: string) => Promise<void>;
}

export function DeleteDialog({
  isOpen,
  agent,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !agent) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(agent.id);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6">
        <div className="flex items-center space-x-3 text-rose-600 mb-3">
          <div className="p-3 bg-rose-50 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Remove Delivery Agent?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="my-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700">
          You are about to remove <span className="font-bold text-slate-900">{agent.name}</span> (
          {agent.phone}) from <span className="font-semibold">{agent.serviceArea}</span>.
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
