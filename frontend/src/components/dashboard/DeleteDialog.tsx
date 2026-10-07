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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-dark-900 rounded-3xl max-w-md w-full shadow-2xl border border-dark-700/80 overflow-hidden transform transition-all p-6">
        <div className="flex items-center space-x-3.5 text-rose-500 mb-3">
          <div className="p-3 bg-rose-500/15 border border-rose-500/25 rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-white">
              Delete delivery agent?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              You are about to permanently remove this delivery agent.
            </p>
          </div>
        </div>

        <div className="my-4 p-3.5 bg-dark-800/80 border border-dark-700/80 rounded-xl text-xs text-slate-300 space-y-1">
          <div>
            Agent: <span className="font-bold text-white">{agent.name}</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            ID: {agent.id}
          </div>
          <div className="text-slate-400">
            Zone: <span className="text-indigo-400 font-medium">{agent.serviceArea}</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center disabled:opacity-50 active:scale-95"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            Delete Agent
          </button>
        </div>
      </div>
    </div>
  );
}
