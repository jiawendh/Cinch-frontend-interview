import { CustomSlugSuggestionsProps } from "@/types";
import { Refresh } from "@/icons";
import { useSuggestSlug } from "@/hooks/useSuggestSlug";
import { useEffect, useState } from "react";

export default function CustomSlugSuggestion({
  slug,
  suggestions: initialSuggestions,
  onSlugChange,
  onValidationChange
} : CustomSlugSuggestionsProps) {
  const [suggestions, setSuggestions] = useState([""]);
  const { refresh, suggestions : newSuggestions, loading, error } = useSuggestSlug();
  
  async function getNewSuggestions() {
    await refresh(slug);
  }

  useEffect(() => {
    if (newSuggestions) setSuggestions(newSuggestions);
  }, [newSuggestions]);

  useEffect(() => {
    if (initialSuggestions?.length) {
      setSuggestions(initialSuggestions);
    }
  }, [initialSuggestions]);

  return (
    <>
      <div className="flex gap-2 items-center mb-1">
        <p className="text-sm text-zinc-400">Try these instead:</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            getNewSuggestions();
          }}
          type="button"
          className="p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer"
        >
          <Refresh height={16} width={16} className={"stroke-zinc-500"} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {error && (
          <p className="text-sm text-red-500 mb-2">
            Failed to generate suggestions. Please try again.
          </p>
        )}
        {loading && (
          <p className="text-sm text-zinc-500 mb-2 animate-pulse">
            Please wait, loading...
          </p>
        )}
        {!error && !loading && suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              onSlugChange(s);
              onValidationChange({ status: 'idle' });
            }}
            type="button"
            className="px-3 py-1 text-sm rounded-full transition-colors border hover:bg-[#1a1a1a] border border-solid border-white/[.145] hover:border-transparent cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
