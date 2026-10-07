'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Copy,
  Check,
  Zap,
  Activity,
  Loader2,
} from 'lucide-react';
import { apiService, ApiError } from '../../services/api';
import { DeliveryAgent } from '../../types/agent';

interface AgentDetailsDrawerProps {
  isOpen: boolean;
  agentId: string | null;
  onClose: () => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
}

export function AgentDetailsDrawer({
  isOpen,
  agentId,
  onClose,
  onEdit,
  onDelete,
}: AgentDetailsDrawerProps) {
  const [agent, setAgent] = useState<DeliveryAgent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !agentId) {
      setAgent(null);
      setError(null);
      setIsCached(undefined);
      return;
    }

    let isMounted = true;

    async function loadAgent() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiService.getAgentById(agentId as string);
        if (isMounted) {
          setAgent(res.data);
          setIsCached(res.meta.cached);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof ApiError ? err.message : 'Failed to retrieve agent details';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAgent();

    return () => {
      isMounted = false;
    };
  }, [isOpen, agentId]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const initials = agent?.name
    ? agent.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AG';

  return (
    <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0 bg-dark-850 border border-dark-700/80 rounded-2xl shadow-xl flex flex-col overflow-hidden h-fit xl:sticky xl:top-24 max-h-[calc(100vh-7rem)] animate-fadeIn">
      {/* Drawer Header */}
      <div className="p-5 border-b border-dark-700/80 flex items-center justify-between bg-dark-900/60">
        <div>
          <h3 className="text-sm font-bold text-white">Agent Details</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Complete information about this delivery agent
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 transition"
          aria-label="Close details panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs font-semibold">Loading agent record...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
            {error}
          </div>
        ) : agent ? (
          <>
            {/* Top Identity Block */}
            <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-dark-800/80 border border-dark-700/60">
              <div className="w-12 h-12 rounded-full bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate">{agent.name}</h4>
                  {agent.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-[11px] font-mono text-slate-400 truncate">
                    {agent.id.slice(0, 20)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(agent.id, 'id')}
                    className="text-slate-500 hover:text-slate-300 transition"
                    title="Copy full UUID"
                  >
                    {copiedField === 'id' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CONTACT INFORMATION
              </span>
              <div className="space-y-2 text-xs">
                {/* Phone */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`tel:${agent.phone}`} className="hover:text-indigo-400 transition font-medium">
                      {agent.phone}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(agent.phone, 'phone')}
                    className="text-slate-500 hover:text-slate-300 transition"
                    title="Copy phone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50">
                  <div className="flex items-center space-x-2 text-slate-300 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <a href={`mailto:${agent.email}`} className="hover:text-indigo-400 transition font-medium truncate">
                      {agent.email}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(agent.email, 'email')}
                    className="text-slate-500 hover:text-slate-300 transition ml-2 flex-shrink-0"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SERVICE AREA */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SERVICE AREA
              </span>
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-xs font-semibold text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{agent.serviceArea}</span>
              </div>
            </div>

            {/* STATUS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                STATUS
              </span>
              <div className="p-3 rounded-xl bg-dark-800/60 border border-dark-700/50 flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-white capitalize">{agent.status.toLowerCase()}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {agent.status === 'ACTIVE'
                      ? 'Currently active delivery personnel'
                      : 'Currently inactive delivery personnel'}
                  </p>
                </div>
              </div>
            </div>

            {/* TIMESTAMPS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TIMESTAMPS
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500">Registered</div>
                    <div className="font-medium text-slate-200">{formatDate(agent.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500">Last Updated</div>
                    <div className="font-medium text-slate-200">{formatDate(agent.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CACHE TELEMETRY PILL */}
            <div className="p-2.5 rounded-xl bg-dark-900 border border-dark-700/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Cache Telemetry:</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCached
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-dark-750 text-slate-400'
                }`}
              >
                {isCached ? 'Redis Cache HIT' : 'Direct DB (MISS)'}
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onEdit(agent)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Agent</span>
              </button>

              <button
                onClick={() => onDelete(agent)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 border border-dark-700 hover:border-rose-500/30 text-xs font-bold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Agent</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
