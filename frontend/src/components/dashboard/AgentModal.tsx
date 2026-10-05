'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Phone, Mail, MapPin, Activity } from 'lucide-react';
import { DeliveryAgent, AgentStatus } from '../../types/agent';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    phone: string;
    email: string;
    serviceArea: string;
    status: AgentStatus;
  }) => Promise<void>;
  agentToEdit?: DeliveryAgent | null;
}

export function AgentModal({
  isOpen,
  onClose,
  onSubmit,
  agentToEdit,
}: AgentModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [status, setStatus] = useState<AgentStatus>('ACTIVE');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name);
      setPhone(agentToEdit.phone);
      setEmail(agentToEdit.email);
      setServiceArea(agentToEdit.serviceArea);
      setStatus(agentToEdit.status);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setServiceArea('');
      setStatus('ACTIVE');
    }
    setErrors({});
  }, [agentToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    const cleanPhone = phone.trim().replace(/[\s\-\(\)\.]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Please provide a valid 10-15 digit phone number (e.g. 9876543210)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!serviceArea.trim() || serviceArea.trim().length < 2) {
      newErrors.serviceArea = 'Service area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        serviceArea: serviceArea.trim(),
        status,
      });
      onClose();
    } catch (err: unknown) {
      // Server error handling can set specific field issues
      const apiErr = err as { details?: Array<{ field: string; issue: string }>; message?: string };
      if (apiErr.details && Array.isArray(apiErr.details)) {
        const fieldErrors: Record<string, string> = {};
        apiErr.details.forEach((d) => {
          fieldErrors[d.field] = d.issue;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: apiErr.message || 'Operation failed. Please verify your details.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {agentToEdit ? 'Edit Delivery Agent' : 'Register New Delivery Agent'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {agentToEdit ? 'Update agent credentials and status' : 'Add delivery personnel to your active dispatch fleet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {errors.general}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Marcus Rodriguez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number (Supports 10-digit Indian & International)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 9876543210 or +919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.phone}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. marcus.rodriguez@zoop.delivery"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Service Area & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Service Area / Territory
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Downtown Metro"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                    errors.serviceArea
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.serviceArea && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.serviceArea}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dispatch Status
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AgentStatus)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE (Ready for orders)</option>
                  <option value="INACTIVE">INACTIVE (Off duty)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {agentToEdit ? 'Save Changes' : 'Register Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
