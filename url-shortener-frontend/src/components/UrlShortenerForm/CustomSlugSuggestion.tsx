import { CustomSlugSuggestionsProps } from "@/types";

export default function CustomSlugSuggestion({
  suggestions,
  onSlugChange,
  onValidationChange
} : CustomSlugSuggestionsProps) {
  return (
    <>
      <p className="text-sm text-zinc-400 mb-1">Try these instead:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              onSlugChange(s);
              onValidationChange({ status: 'idle' });
            }}
            type="button"
            className="px-3 py-1 text-sm rounded-full  transition-colors border hover:bg-[#1a1a1a] border border-solid border-white/[.145] hover:border-transparent cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
