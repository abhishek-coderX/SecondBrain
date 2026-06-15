import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import api from "../utils/api";
import type { Content } from "../types/type";

interface SearchBarProps {
  onSearch: (results: Content[] | null) => void;
  onSearchStateChange: (isSearching: boolean) => void;
}

export const SearchBar = ({ onSearch, onSearchStateChange }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim() === "") {
      onSearch(null);
      onSearchStateChange(false);
      return;
    }

    onSearchStateChange(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        onSearch(response.data);
      } catch (err) {
        console.error("Semantic search failed:", err);
        onSearch([]);
      } finally {
        onSearchStateChange(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, onSearch, onSearchStateChange]);

  return (
    <div className="relative w-full lg:w-[320px]">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Semantic search, like 'cache strategy'..."
        className="bento-input pl-4 pr-11"
      />

      {query ? (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};
