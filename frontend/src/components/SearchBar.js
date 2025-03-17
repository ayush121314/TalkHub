import React, { useState, useRef } from 'react';

const SearchBar = ({ onSearch, className }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onSearch(''); // Pass empty string to clear search
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-lg bg-gray-700 text-white border border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm pr-10"
          placeholder="Search talks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-14 text-gray-400 hover:text-white flex items-center justify-center h-full px-2"
            type="button"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={handleSearch}
          className="ml-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar; 