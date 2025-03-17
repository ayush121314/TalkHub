import { useState } from 'react';

const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  // Search lectures
  const searchLectures = async (query) => {
    try {
      setLoading(true);
      setSearchResults([]);
      setError(null);
      setNoResults(false);

      if (!query || query.trim() === '') {
        setLoading(false);
        setSearchResults([]);
        return;
      }

      // Debug logged to help troubleshoot
      console.log(`Searching for: "${query}"`);
      
      // Get the token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Create the search URL with query parameter
      const searchUrl = `${apiUrl}/api/lectures/search?query=${encodeURIComponent(query)}`;
      console.log(`Calling API endpoint: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = `Search failed with status: ${response.status}`;
        
        try {
          // Try to get more detailed error from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Server error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`Received ${data.length} search results`);
      
      if (data.length === 0) {
        setNoResults(true);
      }
      
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search lectures');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setError(null);
    setNoResults(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    noResults,
    searchLectures,
    clearSearch
  };
};

export default useSearch; 