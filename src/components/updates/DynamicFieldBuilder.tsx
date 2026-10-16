import React from 'react';
import { CustomFieldDefinition, CustomFieldType } from '../../types/dailyUpdates';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  HelpCircle,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  MapPin,
  CheckSquare,
  Phone,
  Hash,
} from 'lucide-react';

interface DynamicFieldBuilderProps {
  fields: CustomFieldDefinition[];
  onChange: (fields: CustomFieldDefinition[]) => void;
}

const FIELD_TYPE_OPTIONS: { type: CustomFieldType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'text', label: 'Short Text', icon: FileText },
  { type: 'long_text', label: 'Long Description / Rules', icon: FileText },
  { type: 'price', label: 'Price / Fee (₹)', icon: DollarSign },
  { type: 'number', label: 'Number / Count', icon: Hash },
  { type: 'datetime', label: 'Date & Time', icon: Calendar },
  { type: 'url', label: 'Website / Link URL', icon: ExternalLink },
  { type: 'location', label: 'Location / Room / Venue', icon: MapPin },
  { type: 'boolean', label: 'Yes / No (Boolean)', icon: CheckSquare },
  { type: 'contact', label: 'Contact Phone / Email', icon: Phone },
];

const PRESET_SUGGESTIONS: { label: string; type: CustomFieldType; defaultValue: string | number | boolean }[] = [
  { label: 'Prize Pool', type: 'price', defaultValue: 25000 },
  { label: 'Registration Fee', type: 'price', defaultValue: 0 },
  { label: 'Team Size', type: 'text', defaultValue: '3 to 4 Students' },
  { label: 'Venue / Lab', type: 'location', defaultValue: 'Complex B, Lab 402' },
  { label: 'Eligibility', type: 'text', defaultValue: 'Open to all Engineering Batches' },
  { label: 'Prerequisites', type: 'text', defaultValue: 'Laptop with WiFi & College ID' },
  { label: 'Registration Deadline', type: 'datetime', defaultValue: '' },
  { label: 'Certificate Provided', type: 'boolean', defaultValue: true },
  { label: 'Coordinator WhatsApp', type: 'contact', defaultValue: '+91 98200 00000' },
  { label: 'Official Doc / Brochure', type: 'url', defaultValue: 'https://ves.ac.in' },
];

export const DynamicFieldBuilder: React.FC<DynamicFieldBuilderProps> = ({
  fields,
  onChange,
}) => {
  const addField = (
    label = '',
    type: CustomFieldType = 'text',
    value: string | number | boolean = ''
  ) => {
    const newField: CustomFieldDefinition = {
      id: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label,
      type,
      value,
      required: false,
    };
    onChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<CustomFieldDefinition>) => {
    onChange(
      fields.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...updates };
        // Reset default value if type changes
        if (updates.type && updates.type !== f.type) {
          if (updates.type === 'price' || updates.type === 'number') {
            updated.value = 0;
          } else if (updates.type === 'boolean') {
            updated.value = true;
          } else {
            updated.value = '';
          }
        }
        return updated;
      })
    );
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    onChange(newFields);
  };

  return (
    <div className="space-y-4">
      {/* Header and Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-xs font-bold text-[#171916] dark:text-neutral-100 flex items-center gap-1.5">
              <span>Dynamic Information Fields</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-mono font-bold">
                {fields.length} added
              </span>
            </label>
            <p className="text-[11px] text-[#737871] dark:text-neutral-400 mt-0.5">
              Add custom details like Prize Pool, Team Size, Lab Venue, Fees, or Prerequisites.
            </p>
          </div>

          <button
            type="button"
            onClick={() => addField('', 'text', '')}
            className="px-3 py-1.5 rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Field</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-semibold text-[#737871] dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F97316]" /> Suggestions:
          </span>
          {PRESET_SUGGESTIONS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => addField(preset.label, preset.type, preset.defaultValue)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 hover:border-[#F97316] dark:hover:border-[#F97316] text-[#555952] dark:text-neutral-300 font-medium transition-colors cursor-pointer"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <div className="p-6 rounded-2xl border-2 border-dashed border-[#E5E3DC] dark:border-neutral-800 text-center bg-[#FAF9F5]/50 dark:bg-neutral-900/40">
          <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#171916] dark:text-neutral-200">
            No custom fields added yet
          </p>
          <p className="text-[11px] text-[#737871] dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Click &ldquo;Add Custom Field&rdquo; or pick one of the suggestions above to provide
            detailed information for students.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-3"
              >
                {/* Row 1: Label, Type, and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wide">
                      Field Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prize Pool, Venue, Eligibility"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  </div>

                  <div className="w-full sm:w-48">
                    <label className="text-[10px] font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wide">
                      Input Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as CustomFieldType,
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    >
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.type} value={opt.type}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ordering & Delete */}
                  <div className="flex items-center gap-1 self-end sm:self-center sm:pt-4">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveField(index, 'up')}
                      className="p-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-[#555952] dark:text-neutral-300"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === fields.length - 1}
                      onClick={() => moveField(index, 'down')}
                      className="p-1.5 rounded-lg border border-[#E5E3DC] dark:border-neutral-700 hover:bg-[#FAF9F5] dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-[#555952] dark:text-neutral-300"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Value Input according to Field Type */}
                <div>
                  <label className="text-[10px] font-bold text-[#737871] dark:text-neutral-400 uppercase tracking-wide">
                    Field Value
                  </label>

                  {field.type === 'long_text' ? (
                    <textarea
                      rows={2}
                      placeholder="Enter detailed value or guidelines..."
                      value={String(field.value || '')}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  ) : field.type === 'price' ? (
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-xs font-bold text-[#737871]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0 for Free"
                        value={field.value !== undefined ? Number(field.value) : ''}
                        onChange={(e) =>
                          updateField(field.id, { value: Number(e.target.value) })
                        }
                        className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                      />
                    </div>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={field.value !== undefined ? Number(field.value) : ''}
                      onChange={(e) =>
                        updateField(field.id, { value: Number(e.target.value) })
                      }
                      className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  ) : field.type === 'datetime' ? (
                    <input
                      type="datetime-local"
                      value={
                        field.value
                          ? new Date(String(field.value)).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        updateField(field.id, {
                          value: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : '',
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  ) : field.type === 'boolean' ? (
                    <div className="mt-1 flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#171916] dark:text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name={`bool_${field.id}`}
                          checked={field.value === true || field.value === 'true'}
                          onChange={() => updateField(field.id, { value: true })}
                          className="accent-[#F97316]"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-[#171916] dark:text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name={`bool_${field.id}`}
                          checked={field.value === false || field.value === 'false'}
                          onChange={() => updateField(field.id, { value: false })}
                          className="accent-[#F97316]"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  ) : field.type === 'url' ? (
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={String(field.value || '')}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  ) : field.type === 'contact' ? (
                    <input
                      type="text"
                      placeholder="+91 98200 00000 or email@ves.ac.in"
                      value={String(field.value || '')}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter value"
                      value={String(field.value || '')}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E3DC] dark:border-neutral-700 bg-[#FAF9F5] dark:bg-neutral-800 focus:outline-none focus:border-[#F97316] text-[#171916] dark:text-neutral-100"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
