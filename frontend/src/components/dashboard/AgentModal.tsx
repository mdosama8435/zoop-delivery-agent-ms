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
      newErrors.serviceArea = 'Service area is required (min 2 characters)';
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-dark-900 rounded-3xl max-w-lg w-full shadow-2xl border border-dark-700/80 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-dark-700/80 flex items-center justify-between bg-dark-900">
          <div>
            <h3 id="modal-headline" className="text-base font-bold text-white">
              {agentToEdit ? 'Edit Delivery Agent' : 'Register New Delivery Agent'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {agentToEdit
                ? 'Update agent credentials and status'
                : 'Add delivery personnel to your active dispatch fleet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-medium">
              {errors.general}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Manish Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-dark-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone Number (10-digit Indian or E.164)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="e.g. 9876543210 or +919876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-dark-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.phone}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="e.g. manish@zoop.delivery"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-dark-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Service Area & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service Area / Territory
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. ITPL"
                  value={serviceArea}
                  onChange={(e) => {
                    setServiceArea(e.target.value);
                    if (errors.serviceArea) setErrors((prev) => ({ ...prev, serviceArea: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                    errors.serviceArea
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-dark-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.serviceArea && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.serviceArea}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dispatch Status
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AgentStatus)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium cursor-pointer"
                >
                  <option value="ACTIVE" className="bg-dark-900 text-white">ACTIVE (On Duty)</option>
                  <option value="INACTIVE" className="bg-dark-900 text-white">INACTIVE (Off Duty)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-dark-700/80 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center disabled:opacity-50 active:scale-95"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
              {agentToEdit ? 'Save Changes' : 'Register Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
