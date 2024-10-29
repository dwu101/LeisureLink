import React, { useState } from 'react';

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState('username');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleSearch = async () => {
    
    if (!searchQuery.trim()) {
        handleClear();
      setError('Please enter a search term');
      
      return;
    }
    setButtonClicked(true)
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          searchType: searchBy
        })
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        setError('No results found');
      }
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    
    if (e.key === 'Enter') {
    setButtonClicked(true)
      handleSearch();
    }
  };

  const handleClear = () => {
    setButtonClicked(false)

    setSearchQuery('');
    setResults([]);
    setError('');
  };

  const getSearchPlaceholder = () => {
    switch(searchBy) {
      case 'username':
        return 'Enter username...';
      case 'displayName':
        return 'Enter display name...';
      case 'group':
        return 'Enter group name...';
      default:
        return 'Enter search term...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">User Search</h2>
        <div className="space-y-6">
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
            >
              {loading ? (
                <div className="animate-spin">↻</div>
              ) : (
                <>
                  <SearchIcon />
                  Search
                </>
              )}
            </button>
            {searchQuery && (
              <button 
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Options */}
          <div className="flex gap-6">
            {['username', 'displayName', 'group'].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={searchBy === option}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">
                  {option === 'displayName' ? 'Display Name' : 
                   option === 'group' ? 'Group Name' : 'Username'}
                </span>
              </label>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {buttonClicked &&
        <div className="mt-6 text-sm text-gray-500" style={{ marginTop: '35px', marginBottom: '35px' }}>
            <h2>Found {results.length} result{results.length !== 1 ? 's' : ''} </h2>
        </div>
        }
    
      {/* <h2 className="text-xl font-bold mb-6">Search Results</h2> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {/* Simple user icon using HTML */}
                  <span className="text-gray-500 text-lg">👤</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium text-gray-900 truncate">
                  {result.displayName}
                </p>
                <p className="text-sm text-gray-500">
                  @{result.username}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      </div>
    </div>
  );
};

export default SearchInterface;