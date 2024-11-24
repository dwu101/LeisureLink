import { useNavigate } from "react-router-dom";
import "./SearchPage.css"
import "./EditGroups.css"
import ProfileIcon from "../components/ProfileIcon";
import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import NavigationPrompt from '../components/NavigationPrompt';


const SeeGroup = () => {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [removedMembers, setRemovedMembers] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [navPath, setNavPath] = useState('');
  const [nextLocation, setNextLocation] = useState(null);


  
  const username = sessionStorage.getItem('username')

  const { group } = useParams();

  useEffect(() => {
    const unsavedChanges = removedMembers.length >= 1;
    setHasChanges(unsavedChanges);
  }, [removedMembers]);
  useEffect(() => {
    const handlePopState = (event) => {
      if (hasChanges) {
        // Prevent the default navigation
        event.preventDefault();
        event.stopPropagation();
        
        // Store the current URL
        const currentUrl = window.location.href;
        
        // Get the URL we're trying to navigate to
        const nextUrl = document.location.pathname;
        
        // Store the attempted navigation path
        setNavPath(nextUrl);
        setShowPrompt(true);
        
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', currentUrl);
      }
    };
  
    // Block initial navigation when component mounts
    if (hasChanges) {
      window.history.pushState(null, '', window.location.href);
    }
  
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges]);

  useEffect(() => {
    if (nextLocation) {
      navigate(nextLocation);
      setNextLocation(null);
    }
  }, [nextLocation, navigate]);
  

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  const handleNavigation = (path) => {
    if (hasChanges) {
      setNavPath(path);
      setShowPrompt(true);
    } else {
      navigate(path);
    }
  };

  const handleStay = () => {
    setShowPrompt(false);
    setNavPath('');
    setNextLocation(null);
    // Push current URL again to ensure we stay on this page
    window.history.pushState(null, '', window.location.href);
  };

  const handleLeave = () => {
    setShowPrompt(false);
    setHasChanges(false);
    
    if (navPath) {
      // Store the navigation target
      setNextLocation(navPath);
    }
    setNavPath('');
  };


  useEffect(() => {
    if (group) {
      fetchGroupUsers();
    }
  }, [group]);

  const fetchGroupUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/getGroupUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group_name: group
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const formattedResults = data.users.map(user => ({
          username: user.username,
          displayName: user.display_name,
          status: user.status
        }));
        
        const sortedResults = [...formattedResults].sort((a, b) => {
          if (a.username === username) return -1;
          if (b.username === username) return 1;
          return 0;
        });
        
        setResults(sortedResults);
        setButtonClicked(true);
      } else {
        setError(data.message || 'Failed to fetch group users');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (username) => {
    handleNavigation(`/ProfilePageSearch/${username}`);
  };

  const handleRemoveMember = (e, username) => {
    e.stopPropagation();
    setRemovedMembers(prev => {
      if (prev.includes(username)) {
        return prev.filter(member => member !== username);
      } else {
        return [...prev, username];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/removeGroupMembers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group_name: group,
          members: removedMembers
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setHasChanges(false);
        if (removedMembers.includes(username)) {
          navigate('/ProfilePage');
        } else {
          fetchGroupUsers();
          setRemovedMembers([]);
        }
      } else {
        setError(data.message || 'Failed to remove members');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="body">
      <div className="main-box">
        <ProfileIcon/>
        <h2 className="main-box-title">{group} </h2>
        
        {loading && <div>Loading...</div>}
        {error && <div className="error">{error}</div>}
        
        {(buttonClicked && !error) && (
          <div style={{marginTop: "50px"}}>
            <h2>Found {results.length} Member{results.length !== 1 ? 's' : ''}</h2>
          </div>
        )}
    
        <div>
          <div className="search-results">
            {results.map((result, index) => {
              const isCurrentUser = result.username === username;
              return (
                <React.Fragment key={index}>
                  <div className="result-item" style={{
                    backgroundColor: isCurrentUser ? '#f3f4f6' : 'transparent',
                    marginBottom: isCurrentUser ? '20px' : '0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}>
                    <div 
                      className="user-info-container" 
                      onClick={() => handleClick(result.username)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flex: 1, 
                        cursor: 'pointer',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', minWidth: '0', flex: '1' }}>
                        <span className="user-icon" style={{ marginRight: '12px' }}>👤</span>
                        <span className="display-name" style={{ marginRight: '12px' }}>{result.displayName}</span>
                        <span className="username">@{result.username}</span>
                      </div>
                      {result.status === "Busy" && 
                      <div style={{ width: '120px', textAlign: 'right', marginRight: '60px' }}>
                        <span className="status">Busy</span>
                      </div>
                        }
                    {result.status === "Active" && 
                      <div style={{ width: '120px', textAlign: 'right', marginRight: '49px' }}>
                        <span className="status">Active</span>
                      </div>
                        }

                    </div>
                    <button
                      onClick={(e) => handleRemoveMember(e, result.username)}
                      className="search-button"
                      style={{
                        marginLeft: '10px',
                        backgroundColor: removedMembers.includes(result.username) ? '#ef4444' : '#3b82f6',
                        transition: 'background-color 0.2s ease',
                        width: '140px',  // Fixed width for all buttons
                        whiteSpace: 'nowrap',  // Prevent text wrapping
                        overflow: 'hidden',    // Hide overflow text
                        textOverflow: 'ellipsis',  // Show ... if text is too long
                        justifyContent:'center',

                      }}
                    >
                      {isCurrentUser ? 
                        (removedMembers.includes(result.username) ? 'Stay in Group' : 'Leave Group') :
                        (removedMembers.includes(result.username) ? 'Undo Remove' : 'Remove Member')}
                    </button>
                  </div>
                  {isCurrentUser && (
                    <div style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#e5e7eb',
                      margin: '0 0 20px 0'
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          {removedMembers.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveChanges}
                className="search-button"
                style={{
                  width: '180px',  // Match the width of other buttons,
                  justifyContent: 'center'
                }}
              >
                Save Changes ({removedMembers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <NavigationPrompt
        when={showPrompt}
        message="You have unsaved changes. Are you sure you want to leave?"
        onOK={handleLeave}
        onCancel={handleStay}
      />
    </div>
  );
};

export default SeeGroup;