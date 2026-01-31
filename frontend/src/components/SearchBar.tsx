'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, SearchSuggestion } from '@/lib/api';

interface SearchBarProps {
  size?: 'sm' | 'lg';
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  size = 'sm',
  placeholder = 'Search treatments, trials, centers...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await api.searchSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    switch (suggestion.type) {
      case 'treatment':
        router.push(`/treatments/${suggestion.id}`);
        break;
      case 'trial':
        router.push(`/trials/${suggestion.id}`);
        break;
      case 'center':
        router.push(`/centers/${suggestion.id}`);
        break;
    }
  };

  const typeColors = {
    treatment: 'bg-blue-100 text-blue-800',
    trial: 'bg-purple-100 text-purple-800',
    center: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              size === 'lg' ? 'px-5 py-4 text-lg' : 'px-4 py-2 text-sm'
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 ${
              size === 'lg' ? 'p-2' : 'p-1'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </div>
      </form>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-800 truncate flex-1">
                  {suggestion.text}
                </span>
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    typeColors[suggestion.type]
                  }`}
                >
                  {suggestion.type}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
