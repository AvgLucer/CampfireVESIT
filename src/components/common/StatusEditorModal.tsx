import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smile,
  X,
  User,
  Sparkles,
  Check,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const StatusEditorModal: React.FC = () => {
  const {
    isStatusModalOpen,
    closeStatusModal,
    user,
    updateProfile,
    showToast,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setStatusMessage(user.statusMessage || '');
    }
  }, [user, isStatusModalOpen]);

  if (!isStatusModalOpen || !user) return null;

  const MAX_STATUS_CHARS = 60;
  const charsRemaining = MAX_STATUS_CHARS - statusMessage.length;

  const presetStatuses = [
    'Prepping for C++ lab & Genesis Hackathon 🚀',
    'Carpool to Dadar at 5:15 PM · 2 seats open 🚗',
    'Maths II revision table 4 in Central Library 📚',
    'BEE AC circuits review in Lab 204 ⚡',
    'In Cafeteria building discussions · join table 💡',
    'Studying Engineering Mechanics statics problem 📐',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    const trimmedStatus = statusMessage.slice(0, MAX_STATUS_CHARS);
    updateProfile({
      name: name.trim(),
      statusMessage: trimmedStatus,
    });
    showToast('Name and status message updated!', 'success');
    closeStatusModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E3DC] p-6 text-[#20231F] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeStatusModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737871] hover:text-[#20231F] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#E5E3DC]">
          <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#171916] tracking-tight">
              Edit Profile & Campus Status
            </h2>
            <div className="text-xs text-[#737871]">
              Update your display name and 60-character status message
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Institutional @username indicator */}
          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-[#737871] uppercase tracking-wider">
                Assigned Username
              </div>
              <div className="text-xs font-mono font-bold text-[#F97316] mt-0.5">
                {user.username}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold text-[#737871] uppercase tracking-wider">
                Institutional ID
              </div>
              <div className="text-[11px] font-mono text-[#555952] truncate max-w-[170px]">
                {user.email}
              </div>
            </div>
          </div>

          {/* Student Name (Can be changed) */}
          <div>
            <label className="block text-xs font-semibold text-[#3B4036] mb-1">
              Full Name (Changeable)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C9187] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D7D4CB] bg-white text-[#20231F] focus:outline-hidden focus:border-[#F97316]"
              />
            </div>
          </div>

          {/* Status Message (Max 60 letters) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#3B4036] flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Student Status (Max 60 chars)</span>
              </label>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  charsRemaining < 0
                    ? 'text-rose-600'
                    : charsRemaining <= 10
                    ? 'text-amber-600'
                    : 'text-[#737871]'
                }`}
              >
                {statusMessage.length} / {MAX_STATUS_CHARS}
              </span>
            </div>

            <textarea
              rows={2}
              maxLength={MAX_STATUS_CHARS}
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value.slice(0, MAX_STATUS_CHARS))}
              placeholder="What are you currently studying or planning on campus?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D7D4CB] bg-white text-[#20231F] focus:outline-hidden focus:border-[#F97316] resize-none leading-relaxed"
            />

            {/* Quick Status Presets */}
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-[#737871] mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F97316]" />
                <span>Quick Status Ideas:</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {presetStatuses.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStatusMessage(preset.slice(0, MAX_STATUS_CHARS))}
                    className="text-[10px] px-2 py-1 rounded-md bg-[#FAF9F5] border border-[#E5E3DC] hover:border-[#F97316] text-[#555952] hover:text-[#171916] transition-colors text-left cursor-pointer truncate max-w-full"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 rounded-xl bg-[#FFF8F5] border border-[#F97316]/20">
            <div className="text-[10px] font-semibold text-[#737871] uppercase tracking-wider mb-1">
              Live Preview for Peers
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#F97316] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {name.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#171916] truncate">
                  {name || 'Student Name'}{' '}
                  <span className="font-mono text-[#F97316] font-normal text-[11px]">
                    {user.username}
                  </span>
                </div>
                <div className="text-[11px] text-[#555952] italic truncate">
                  &ldquo;{statusMessage || 'No status set'}&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E3DC]">
            <button
              type="button"
              onClick={closeStatusModal}
              className="px-3.5 py-2 text-xs font-semibold text-[#555952] hover:text-[#171916] hover:bg-[#FAF9F5] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
