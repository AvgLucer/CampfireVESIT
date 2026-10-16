import React, { useState } from 'react';
import {
  DailyUpdate,
  CustomFieldDefinition,
  UpdateCategory,
  UpdateModerationStatus,
} from '../../types/dailyUpdates';
import { DynamicFieldBuilder } from './DynamicFieldBuilder';
import { DailyUpdateCard } from './DailyUpdateCard';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Save,
  Send,
} from 'lucide-react';

interface HostDailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUpdate?: DailyUpdate | null;
}

const CATEGORIES: UpdateCategory[] = [
  'Hackathon',
  'Workshop',
  'Club Activity',
  'Lost & Found',
  'Opportunity',
  'Competition',
  'Sports & Cultural',
  'Academic Notice',
  'General',
];

const SAMPLE_COVERS = [
  {
    label: 'Hackathon / Tech',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Workshop / Lab',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Campus / Students',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Gaming / Esports',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Lost & Found',
    url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Academic Notice',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Startup / Pitch',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
];

export const HostDailyUpdateModal: React.FC<HostDailyUpdateModalProps> = ({
  isOpen,
  onClose,
  existingUpdate,
}) => {
  const { user, createDailyUpdate, editDailyUpdate, showToast } = useApp();

  const isEditing = Boolean(existingUpdate);

  // Form State
  const [activeTab, setActiveTab] = useState<'details' | 'custom_fields' | 'applications' | 'preview'>('details');

  const [title, setTitle] = useState(existingUpdate?.title || '');
  const [description, setDescription] = useState(existingUpdate?.description || '');
  const [category, setCategory] = useState<string>(existingUpdate?.category || 'General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(existingUpdate?.tags || ['VESIT', 'Campus']);

  const [coverImageUrl, setCoverImageUrl] = useState(
    existingUpdate?.coverImageUrl || SAMPLE_COVERS[0].url
  );
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Expiration Deadline
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 16);
  };
  const [expiresAt, setExpiresAt] = useState(
    existingUpdate?.expiresAt
      ? new Date(existingUpdate.expiresAt).toISOString().slice(0, 16)
      : getDefaultDeadline()
  );

  const [location, setLocation] = useState(existingUpdate?.location || '');
  const [externalLink, setExternalLink] = useState(existingUpdate?.externalLink || '');
  const [contactEmail, setContactEmail] = useState(
    existingUpdate?.contactEmail || user?.email || ''
  );
  const [contactPhone, setContactPhone] = useState(
    existingUpdate?.contactPhone || user?.phone || ''
  );

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(
    existingUpdate?.customFields || []
  );

  // Application Settings
  const [acceptsApplications, setAcceptsApplications] = useState(
    existingUpdate?.acceptsApplications ?? false
  );
  const [maxApplicants, setMaxApplicants] = useState<number | ''>(
    existingUpdate?.maxApplicants || ''
  );
  const [applicationQuestions, setApplicationQuestions] = useState<string[]>(
    existingUpdate?.applicationQuestions || [
      'Why are you interested in this announcement?',
    ]
  );
  const [newQuestion, setNewQuestion] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Deadline Presets
  const setDeadlinePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiresAt(d.toISOString().slice(0, 16));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setApplicationQuestions([...applicationQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    setApplicationQuestions(applicationQuestions.filter((_, i) => i !== idx));
  };

  // Validation
  const validateForm = (): boolean => {
    setValidationError(null);
    if (!title.trim()) {
      setValidationError('Announcement title is required.');
      setActiveTab('details');
      return false;
    }
    if (!description.trim()) {
      setValidationError('Announcement description is required.');
      setActiveTab('details');
      return false;
    }
    if (!coverImageUrl) {
      setValidationError('Please select or provide a cover photo.');
      setActiveTab('details');
      return false;
    }
    const deadlineDate = new Date(expiresAt);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      setValidationError('Expiration deadline must be a valid date in the future.');
      setActiveTab('details');
      return false;
    }
    return true;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!user) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const isAdmin = user.role === 'admin';
      const status: UpdateModerationStatus = asDraft
        ? 'draft'
        : isAdmin
        ? 'approved'
        : 'pending';

      const payload = {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: customCoverUrl.trim() || coverImageUrl,
        category,
        tags,
        hostId: user.userId,
        hostName: user.name,
        hostUsername: user.username,
        hostAvatarUrl: user.avatarUrl,
        hostDepartment: user.department,
        hostYear: user.year,
        hostRole: user.role,
        ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
        ...(contactPhone.trim() ? { contactPhone: contactPhone.trim() } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(externalLink.trim() ? { externalLink: externalLink.trim() } : {}),
        customFields,
        acceptsApplications,
        ...(acceptsApplications && maxApplicants ? { maxApplicants: Number(maxApplicants) } : {}),
        ...(acceptsApplications && applicationQuestions.length > 0 ? { applicationQuestions } : {}),
        status,
        expiresAt: new Date(expiresAt).toISOString(),
      };

      if (isEditing && existingUpdate) {
        // Spec: "Edits to approved content that materially change the announcement should trigger re-moderation."
        const shouldReModerate = !isAdmin && existingUpdate.status === 'approved';
        await editDailyUpdate(existingUpdate.id, payload, shouldReModerate);
      } else {
        await createDailyUpdate(payload);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setValidationError('Failed to save announcement. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct a preview object
  const previewUpdate: DailyUpdate = {
    id: existingUpdate?.id || 'preview_id',
    title: title || 'Announcement Title Preview',
    description: description || 'Announcement description will appear here...',
    coverImageUrl: customCoverUrl || coverImageUrl,
    category,
    tags,
    hostId: user?.userId || 'host_id',
    hostName: user?.name || 'Your Name',
    hostUsername: user?.username || '@yourusername',
    hostAvatarUrl: user?.avatarUrl,
    hostDepartment: user?.department || 'First-Year Engineering',
    hostRole: user?.role,
    location: location || 'Campus Location',
    externalLink,
    customFields,
    acceptsApplications,
    maxApplicants: maxApplicants ? Number(maxApplicants) : undefined,
    status: user?.role === 'admin' ? 'approved' : 'pending',
    expiresAt: new Date(expiresAt).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl border border-[#E5E3DC] dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#171916] dark:text-neutral-100">
                {isEditing ? 'Edit Daily Update' : 'Host a Campus Daily Update'}
              </h2>
              <p className="text-xs text-[#737871] dark:text-neutral-400">
                Share hackathons, workshops, lost items, opportunities, or activities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#737871] hover:text-[#171916] hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5]/60 dark:bg-neutral-900/40 shrink-0 overflow-x-auto gap-2 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'details'
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] hover:bg-[#FAF9F5]'
            }`}
          >
            1. Core Details & Media
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom_fields')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom_fields'
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] hover:bg-[#FAF9F5]'
            }`}
          >
            <span>2. Dynamic Custom Fields</span>
            {customFields.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'custom_fields' ? 'bg-white text-[#F97316]' : 'bg-orange-100 text-[#F97316]'
              }`}>
                {customFields.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] hover:bg-[#FAF9F5]'
            }`}
          >
            <span>3. Applications</span>
            {acceptsApplications && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'text-[#555952] dark:text-neutral-400 hover:text-[#171916] hover:bg-[#FAF9F5]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4. Live Preview</span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Tab 1: Core Details */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center justify-between">
                  <span>Announcement Title *</span>
                  <span className="text-[10px] text-[#737871] font-normal">
                    {title.length}/100
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Genesis 2026: 24-Hour Campus Hardware Hackathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2 text-sm rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              {/* Category & Expiration Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center justify-between">
                    <span>Host Expiration Deadline *</span>
                    <span className="text-[10px] text-[#F97316] font-bold">Required</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-[#737871]">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset(1)}
                      className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] hover:border-[#F97316]"
                    >
                      24h
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset(3)}
                      className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] hover:border-[#F97316]"
                    >
                      3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset(7)}
                      className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-[#555952] hover:border-[#F97316]"
                    >
                      1 Week
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                  Full Announcement Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide complete guidelines, background, and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              {/* Cover Image Picker */}
              <div>
                <label className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center justify-between">
                  <span>Cover Image *</span>
                  <span className="text-[10px] text-[#737871]">Pick a photo or enter custom URL</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {SAMPLE_COVERS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setCoverImageUrl(preset.url);
                        setCustomCoverUrl('');
                      }}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        coverImageUrl === preset.url && !customCoverUrl
                          ? 'border-[#F97316] ring-2 ring-[#F97316]/30'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 py-0.5 px-1 bg-black/60 text-[9px] font-bold text-white text-center truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2.5">
                  <input
                    type="url"
                    placeholder="Or paste custom image URL (https://...)"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Location & External Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                    Location / Room (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Complex B, Lab 402 or Amphitheatre"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                    External Link / Docs URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://ves.ac.in/event"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 text-[#171916] dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                  Tags (Press Enter or comma to add)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 mt-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#F97316] text-[11px] font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="text-xs bg-transparent border-0 focus:outline-none text-[#171916] dark:text-neutral-100 flex-1 min-w-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dynamic Custom Fields Builder */}
          {activeTab === 'custom_fields' && (
            <div className="space-y-4">
              <DynamicFieldBuilder
                fields={customFields}
                onChange={setCustomFields}
              />
            </div>
          )}

          {/* Tab 3: Application Configuration */}
          {activeTab === 'applications' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800/80 border border-[#E5E3DC] dark:border-neutral-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#171916] dark:text-neutral-100">
                      Accept Student Applications / Registrations
                    </h3>
                    <p className="text-xs text-[#737871] dark:text-neutral-400 mt-0.5">
                      Allow campus members to submit their application directly to your dashboard.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptsApplications}
                      onChange={(e) => setAcceptsApplications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-[#F97316]"></div>
                  </label>
                </div>

                {acceptsApplications && (
                  <div className="pt-4 border-t border-[#E5E3DC] dark:border-neutral-700 space-y-4">
                    {/* Capacity Limit */}
                    <div>
                      <label className="text-xs font-bold text-[#171916] dark:text-neutral-100">
                        Max Capacity / Limit (Optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Leave empty for unlimited applicants"
                        value={maxApplicants}
                        onChange={(e) =>
                          setMaxApplicants(e.target.value ? Number(e.target.value) : '')
                        }
                        className="w-full sm:w-64 mt-1 px-3 py-1.5 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100"
                      />
                    </div>

                    {/* Custom Applicant Questions */}
                    <div>
                      <label className="text-xs font-bold text-[#171916] dark:text-neutral-100 mb-2 block">
                        Custom Application Questions for Students
                      </label>
                      <div className="space-y-2">
                        {applicationQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-700"
                          >
                            <span className="text-xs font-bold text-[#F97316]">
                              Q{idx + 1}.
                            </span>
                            <span className="text-xs text-[#171916] dark:text-neutral-200 flex-1">
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Question Input */}
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Link to your GitHub, or previous hackathon experience..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddQuestion();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#171916] dark:text-neutral-100"
                        />
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="px-3 py-1.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] shrink-0"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Live Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-xs text-orange-900 dark:text-orange-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>This is how your update card will look on the public campus feed:</span>
              </div>

              <div className="max-w-md mx-auto">
                <DailyUpdateCard
                  update={previewUpdate}
                  onOpenDetails={() => {}}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5] dark:bg-neutral-900 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#737871] hover:text-[#171916] cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-[#FAF9F5] text-xs font-bold text-[#555952] dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Publishing...'
                  : isEditing
                  ? 'Update Announcement'
                  : user?.role === 'admin'
                  ? 'Publish Instantly (Admin)'
                  : 'Submit for Admin Review'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
