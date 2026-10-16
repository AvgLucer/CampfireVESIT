import React from 'react';
import { CustomFieldDefinition } from '../../types/dailyUpdates';
import {
  Tag,
  DollarSign,
  Calendar,
  ExternalLink,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  FileText,
  Hash,
} from 'lucide-react';

interface CustomFieldRendererProps {
  field: CustomFieldDefinition;
  variant?: 'pill' | 'row' | 'detailed';
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  variant = 'row',
}) => {
  const { label, type, value } = field;

  if (value === undefined || value === null || value === '') {
    return null;
  }

  // Formatting helpers
  const formatValue = () => {
    switch (type) {
      case 'price': {
        const num = Number(value);
        if (num === 0) return 'Free Entry';
        return isNaN(num) ? String(value) : `₹${num.toLocaleString('en-IN')}`;
      }
      case 'datetime': {
        try {
          const date = new Date(String(value));
          return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return String(value);
        }
      }
      case 'boolean':
        return value === true || value === 'true' ? 'Yes' : 'No';
      case 'url':
        return String(value).replace(/^https?:\/\//, '');
      default:
        return String(value);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'price':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'datetime':
        return <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'url':
        return <ExternalLink className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />;
      case 'location':
        return <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'boolean':
        return value === true || value === 'true' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-neutral-400" />
        );
      case 'contact':
        return <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-[#F97316]" />;
    }
  };

  // Compact Pill for cards
  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-xs">
        {getIcon()}
        <span className="font-medium text-[#737871] dark:text-neutral-400">{label}:</span>
        <span className="font-semibold text-[#171916] dark:text-neutral-100 truncate max-w-[140px]">
          {formatValue()}
        </span>
      </div>
    );
  }

  // Row format for detail modals
  if (variant === 'row') {
    return (
      <div className="flex items-start justify-between py-2 border-b border-[#E5E3DC]/60 dark:border-neutral-800 last:border-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] dark:text-neutral-400">
          {getIcon()}
          <span>{label}</span>
        </div>
        <div className="text-xs font-bold text-[#171916] dark:text-neutral-100 text-right max-w-[60%] break-words">
          {type === 'url' ? (
            <a
              href={String(value).startsWith('http') ? String(value) : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F97316] hover:underline inline-flex items-center gap-1"
            >
              <span>{formatValue()}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            formatValue()
          )}
        </div>
      </div>
    );
  }

  // Detailed box format
  return (
    <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800/80 border border-[#E5E3DC] dark:border-neutral-700 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737871] dark:text-neutral-400 uppercase tracking-wide">
        {getIcon()}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-bold text-[#171916] dark:text-neutral-100">
        {type === 'url' ? (
          <a
            href={String(value).startsWith('http') ? String(value) : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F97316] hover:underline inline-flex items-center gap-1 break-all"
          >
            <span>{formatValue()}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          formatValue()
        )}
      </div>
    </div>
  );
};
