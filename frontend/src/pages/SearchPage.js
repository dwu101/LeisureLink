import { useNavigate } from "react-router-dom";
import "./SearchPage.css"
import ProfileIcon from "../components/ProfileIcon";
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
  const navigate = useNavigate()
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
          "query": searchQuery,
          "searchBy": searchBy
        })
      });
      
      if (!response.ok) {
        console.log("!!!!!")
        throw new Error('Search failed');
      }
      else{
        console.log(response.json)
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);console.log(results)
        if (Array.isArray(data) && data.length === 0) {
          setError('No results found');
        }
        
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

  const handleClick = (username) => {
    console.log("Clicked user:", username);
    navigate('/ProfilePageSearch', { state: { username: username } });

};

  return (
    <div className = "body">
      
    <div className="main-box">
    <ProfileIcon/>
      <h2 className="main-box-title">User Search</h2>
      
      {/* Search Input */}
      <div className="namesearch-section">
      <input
        className="name-search-box"
        type="text"
        placeholder={getSearchPlaceholder()}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className="search-button"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? <div>↻</div> : <><SearchIcon /> Search</>}
      </button>
      {searchQuery && (
        <button onClick={handleClear}>Clear</button>
      )}
      </div>
    
      {/* Search Options */}
      <div className="filter-selections">
      {['username', 'displayName', 'group'].map((option) => (
        <label key={option}>
        <input
          type="radio"
          value={option}
          checked={searchBy === option}
          onChange={(e) => setSearchBy(e.target.value)}
        />
        <span>
          {option === 'displayName' ? 'Display Name' : 
           option === 'group' ? 'Group Name' : 'Username'}
        </span>
        </label>
      ))}
      </div>
    
      {/* Error Message */}
      {error && <div>{error}</div>}
    
      {/* Search Results */}
      {(buttonClicked && !error) && (
      <div style={{marginTop: "50px"}}>
        <h2>Found {results.length} result{results.length !== 1 ? 's' : ''}</h2>
      </div>
      )}
    
      <div>
      <div className="search-results">
        {results.map((result, index) => (
          <div key={index} className="result-item" onClick={ () => handleClick(result.username)}>
            <span className="user-icon">👤</span>
            <span className="display-name">{result.displayName}</span>
            <span className="username">@{result.username}</span>
            <span className="status" style={{marginLeft: "50px"}}>{result.status}</span>
            </div>
        ))}
</div>
      </div>
    </div>
    </div>
    );
    
};

export default SearchInterface;