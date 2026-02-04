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

  const typeConfig = {
    treatment: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    trial: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    center: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${
            size === 'lg' ? 'pl-5' : 'pl-4'
          }`}>
            <svg
              className={`text-gray-400 ${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={`w-full bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
              size === 'lg'
                ? 'pl-14 pr-14 py-4 text-lg'
                : 'pl-11 pr-11 py-2.5 text-sm'
            }`}
          />
          <button
            type="submit"
            className={`absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-teal-600 transition-colors ${
              size === 'lg' ? 'pr-5' : 'pr-4'
            }`}
          >
            <span className="sr-only">Search</span>
            <svg
              className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </form>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/50 max-h-80 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Searching...</span>
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((suggestion) => {
                const config = typeConfig[suggestion.type];
                return (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.text} flex items-center justify-center flex-shrink-0`}>
                      {config.icon}
                    </div>
                    <span className="text-sm text-gray-800 truncate flex-1">
                      {suggestion.text}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
                      {suggestion.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
