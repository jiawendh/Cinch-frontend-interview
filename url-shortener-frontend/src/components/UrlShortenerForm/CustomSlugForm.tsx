'use client';

import { useSlugValidation } from '@/hooks/useSlugValidation';
import { CustomSlugFormProps, SlugValidationState } from '@/types';
import CustomSlugSuggestion from './CustomSlugSuggestion';

export default function CustomSlugForm({
  enabled,
  customSlug,
  validation,
  onToggle,
  onSlugChange,
  onValidationChange,
}: CustomSlugFormProps) {
  useSlugValidation({
    slug: customSlug,
    enabled,
    onChange: onValidationChange,
  });
  
  return (
    <div className="space-y-3">
      {/* Toggle */}
      <label className="flex items-center gap-2 text-xs pl-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            onToggle(e.target.checked);
            onSlugChange('');
            onValidationChange({ status: 'idle' });
          }}
          className='cursor-pointer'
        />
        <span className='cursor-pointer'>Customise short URL (optional)</span>
      </label>

      {/* Input */}
      {enabled && (
        <>
          <input
            value={customSlug}
            maxLength={30}
            onChange={(e) => {
              const formatted = e.target.value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
              onSlugChange(formatted);
            }}
            placeholder="my-custom-link"
            className="w-full sm:w-60 border rounded-full px-3 py-2 transition-colors border border-solid border-white/[.145] hover:border-white/[.25]"
          />
          
          <div className='pl-3 space-y-3'>
            {/* Feedback */}
            {validation.status === 'checking' && <p className="text-sm text-zinc-400">Checking availability...</p>}
            {validation.status === 'valid' && <p className="text-sm text-green-500">"{customSlug}" is available!</p>}
            {validation.status === 'invalid' && <p className="text-sm text-red-500">{validation.reason}</p>}

            {/* Suggestions */}
            {validation.status === 'invalid' && validation.suggestions && validation.suggestions.length > 0 && (
              <CustomSlugSuggestion suggestions={validation.suggestions} onSlugChange={onSlugChange} onValidationChange={onValidationChange} />
            )}

            {/* Criteria */}
            <ul className="text-xs text-zinc-500 list-disc pl-4 space-y-1">
              <li>3–30 characters</li>
              <li>Letters, numbers, hyphens only</li>
              <li>No prohibited content</li>
              <li>Must be unique</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
