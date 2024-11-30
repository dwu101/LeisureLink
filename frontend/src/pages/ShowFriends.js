import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import ProfileIcon from "../components/ProfileIcon";

const ShowFriends = ({ displayIcon = true }) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const username = sessionStorage.getItem('username')

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/getFriends/${username}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        
        const result = await response.json();
        if (result.success) {
          setFriends(result.friends);
        } else {
          setError(result.message || 'Failed to fetch friends');
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('Failed to fetch friends. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [username]);

  const handleClick = (username) => {
    navigate('/ProfilePageSearch', { state: { username: username } });
  };

  return (
    <div className="body">
      <div className="main-box" style={{ backgroundColor: "#e0e0e0" }}>
        {displayIcon && <ProfileIcon />}
        <h2 className="main-box-title">My Friends</h2>

        {loading && <div>Loading friends...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        {!loading && !error && friends.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            No friends found
          </div>
        )}

        <div className="search-results">
          {friends.map((friend, index) => (
            <div 
              key={index}
              className="result-item"
              onClick={() => handleClick(friend.username)}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-info-container" style={{ 
                display: 'flex', 
                alignItems: 'center',
                flex: 1,
                padding: '12px'
              }}>
                <span className="user-icon">👤</span>
                <span className="display-name">{friend.display_name}</span>
                <span className="username">@{friend.username}</span>
                <span className="status" style={{ marginLeft: "50px" }}>{friend.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowFriends;