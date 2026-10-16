import React from 'react';
import { DailyUpdate } from '../../types/dailyUpdates';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle,
  Clock3,
  FileEdit,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DailyUpdateCardProps {
  update: DailyUpdate;
  onOpenDetails: (update: DailyUpdate) => void;
  onApply?: (update: DailyUpdate) => void;
  hasApplied?: boolean;
  showHostControls?: boolean;
  onEdit?: (update: DailyUpdate) => void;
  onWithdraw?: (update: DailyUpdate) => void;
  onViewApplications?: (update: DailyUpdate) => void;
  applicationsCount?: number;
}

export const DailyUpdateCard: React.FC<DailyUpdateCardProps> = ({
  update,
  onOpenDetails,
  onApply,
  hasApplied = false,
  showHostControls = false,
  onEdit,
  onWithdraw,
  onViewApplications,
  applicationsCount = 0,
}) => {
  const { user } = useApp();
  const isHost = user && update.hostId === user.userId;
  const isExpired =
    update.status === 'expired' || new Date(update.expiresAt) <= new Date();

  // Calculate remaining time
  const getRemainingTime = () => {
    if (isExpired) return 'Expired';
    const diff = new Date(update.expiresAt).getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (days > 1) return `${days}d left`;
    if (days === 1) return `1d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    const mins = Math.max(1, Math.floor((diff / (1000 * 60)) % 60));
    return `${mins}m left`;
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          Expired
        </span>
      );
    }
    switch (update.status) {
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Clock3 className="w-2.5 h-2.5" /> In Review
          </span>
        );
      case 'changes_requested':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> Changes Requested
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Draft
          </span>
        );
      case 'withdrawn':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Withdrawn
          </span>
        );
      case 'declined':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  // Prominent custom fields to show as tags (up to 3)
  const previewFields = update.customFields.slice(0, 3);

  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 hover:border-[#F97316]/50 dark:hover:border-[#F97316]/50 transition-all shadow-xs hover:shadow-md overflow-hidden group">
      {/* Cover Image Header */}
      <div
        className="relative h-44 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(update)}
      >
        <img
          src={update.coverImageUrl}
          alt={update.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback image
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
            {update.category}
          </span>
          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
            <span
              className={`px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1 ${
                isExpired
                  ? 'bg-neutral-900/80 text-neutral-300'
                  : 'bg-orange-500/90 text-white'
              }`}
              title={`Expires on ${new Date(update.expiresAt).toLocaleString()}`}
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{getRemainingTime()}</span>
            </span>
          </div>
        </div>

        {/* Bottom tags on image */}
        {update.location && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1 text-[11px] font-medium text-white/90 drop-shadow-sm truncate">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate">{update.location}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h3
            onClick={() => onOpenDetails(update)}
            className="text-base font-bold text-[#171916] dark:text-neutral-100 group-hover:text-[#F97316] transition-colors cursor-pointer line-clamp-2"
          >
            {update.title}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-[#555952] dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {update.description}
          </p>

          {/* Dynamic Custom Fields Preview Pills */}
          {previewFields.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {previewFields.map((field) => (
                <CustomFieldRenderer key={field.id} field={field} variant="pill" />
              ))}
              {update.customFields.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#FAF9F5] dark:bg-neutral-800 text-[10px] font-bold text-[#737871] border border-[#E5E3DC] dark:border-neutral-700">
                  +{update.customFields.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {update.tags && update.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {update.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-[#737871] dark:text-neutral-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Metadata & Actions */}
        <div className="pt-3 border-t border-[#E5E3DC]/70 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-2">
            {/* Host Details */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                {update.hostAvatarUrl ? (
                  <img
                    src={update.hostAvatarUrl}
                    alt={update.hostName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  update.hostName.charAt(0)
                )}
              </div>
              <div className="truncate text-left">
                <div className="text-[11px] font-bold text-[#171916] dark:text-neutral-200 truncate flex items-center gap-1">
                  <span>{update.hostName}</span>
                  {update.hostRole === 'admin' && (
                    <ShieldCheck className="w-3 h-3 text-blue-600 inline shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-[#737871] dark:text-neutral-400 truncate">
                  {update.hostDepartment || update.hostUsername}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {showHostControls ? (
                <>
                  {update.acceptsApplications && onViewApplications && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewApplications(update);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 border border-orange-300 dark:border-orange-800 text-[#F97316] text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      title="View received applications & approve or deny"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Applications ({applicationsCount})</span>
                    </button>
                  )}
                  {onEdit && (update.status === 'draft' || update.status === 'changes_requested' || update.status === 'approved') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(update);
                      }}
                      className="p-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] hover:text-[#171916] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                      title="Edit announcement"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Host viewing their own card in feed */}
                  {isHost && update.acceptsApplications && onViewApplications ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewApplications(update);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 border border-orange-300 dark:border-orange-800 text-[#F97316] text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      title="You are host: Review received student applications"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Review Apps ({applicationsCount})</span>
                    </button>
                  ) : !isHost && update.acceptsApplications && !isExpired && update.status === 'approved' && onApply ? (
                    <button
                      type="button"
                      disabled={hasApplied}
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply(update);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        hasApplied
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-[#F97316] text-white hover:bg-[#EA580C] shadow-xs hover:shadow'
                      }`}
                    >
                      {hasApplied ? 'Applied ✓' : 'Apply'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onOpenDetails(update)}
                    className="p-1.5 rounded-lg text-[#737871] hover:text-[#171916] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="View full details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
