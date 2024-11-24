import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/SideBar';
import Alert from '../components/Alert';
import { useNavigate,useBeforeUnload  } from 'react-router-dom';
import ProfileIcon from "../components/ProfileIcon";
import NavigationPrompt from '../components/NavigationPrompt';


const EditGroups = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [removedGroups, setRemovedGroups] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState(null);


  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const [selectedFriends, setSelectedFriends] = useState([username]);
  const addGroupRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [showPrompt, setShowPrompt] = useState(false);
  const [navPath, setNavPath] = useState('');
  // const [navDestination, setNavDestination] = useState({ path: '', state: null });


  useEffect(() => {
    const handlePopState = (event) => {
      if (hasChanges) {
        event.preventDefault();
        
        const currentUrl = window.location.href;
        
        setNavPath(event.target.location.pathname);
        setShowPrompt(true);
        
        window.history.pushState(null, '', currentUrl);
      }
    };
  
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges]);

  useEffect(() => {
    const unsavedChanges = newGroupName.trim() !== '' || selectedFriends.length >= 2 || removedGroups.length >= 1;
    setHasChanges(unsavedChanges);
  }, [newGroupName, selectedFriends]);

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

  useEffect(() => {
    if (hasChanges) {
      window.history.pushState(null, '', window.location.href);
    }
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
  };
  
  const handleLeave = () => {
    setShowPrompt(false);
    setHasChanges(false);
    
    if (navPath) {
      navigate(navPath);
    }
    setNavPath('');
  };

  const scrollToAddGroup = () => {
    addGroupRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleFriendToggle = (friendUsername) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendUsername)) {
        return prev.filter(username => username !== friendUsername);
      } else {
        return [...prev, friendUsername];
      }
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/getProfile?username=${username}`);
        const result = await response.json();
        
        if (result.success) {
          setProfile(result.profile);
          console.log("AAAA")
          console.log(result.profile.groups)
        } else {
          setError(result.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.log(err);
        setError("ERROR. check logs");
      } finally {
        setLoading(false);
      }
    };

    const fetchFriends = async () => {
      try {
        setFriendsLoading(true);
        const response = await fetch(`/getFriends/${username}`);
        const result = await response.json();
        
        if (result.success) {
          setFriends(result.friends);
        } else {
          setFriendsError(result.message || 'Failed to fetch friends');
        }
      } catch (err) {
        console.log(err);
        setFriendsError("Error fetching friends");
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchProfile();
    fetchFriends();
  }, [username]);

  const handleGroupToggle = (group) => {
    setRemovedGroups(prev => {
      if (prev.includes(group)) {
        return prev.filter(g => g !== group);
      } else {
        return [...prev, group];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/deleteGroup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          groups: removedGroups
        })
      });
  
      const result = await response.json();
      
      if (result.success) {
        setProfile(prev => ({
          ...prev,
          groups: prev.groups.filter(group => !removedGroups.includes(group))
        }));
        
        setRemovedGroups([]);
        setAlertMessage("Saved Changes");
        setAlertType("success");
        setShowAlert(true);
      } else {
        setAlertMessage("Error");
        setAlertType("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error removing groups:', error);
      setAlertMessage("Error");
      setAlertType("error");
      setShowAlert(true);
    }
  };
  
  const handleGroupClick = (group) => {
    handleNavigation(`/SeeGroup/${group}`);
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setAlertMessage("Please enter a group name");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch('/createGroup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: newGroupName,
          usernames: selectedFriends // Include selected friends in the request
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setProfile(prev => ({
          ...prev,
          groups: [...(prev.groups || []), newGroupName]
        }));
        setNewGroupName('');
        setSelectedFriends([]); // Reset selected friends after successful group creation
        setAlertMessage("Group Added Successfully");
        setAlertType("success");
        setShowAlert(true);
        setHasChanges(false);
      } else {
        setAlertMessage(result.message || "Error Adding Group");
        setAlertType("error");
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error adding group:', error);
      setAlertMessage("Error Adding Group");
      setAlertType("error");
      setShowAlert(true);
    }
  };


  return (
    <div className="body">
      <Alert
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
      
      <div className="main-box">
        <ProfileIcon/>
         {/* Your Groups Section with Updated Button Format */}
         <div className="section-box">
          <div className="flex items-center justify-between mb-4">
            <h1 className="main-box-title">Your Groups
              <button
                onClick={scrollToAddGroup}
                className="search-button"
                style={{marginLeft: "435px", height:"30px", marginTop: "0px"}}
              >
                Create Group
              </button>
            </h1>
          </div>
          
          {loading && <div>Loading...</div>}
          {error && <div className="error">{error}</div>}
          
          {(!loading && !error) && (
            <div style={{marginTop: "20px"}}>
              <h2>Found {profile?.groups?.length || 0} Group{(profile?.groups?.length || 0) !== 1 ? 's' : ''}</h2>
            </div>
          )}

          <div>
            <div className="search-results">
              {profile?.groups?.map((group, index) => (
                <div key={index} className="result-item">
                  <div 
                    className="user-info-container" 
                    onClick={() => handleGroupClick(group)}
                    style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }}
                  >
                    <span className="user-icon">👥</span>
                    <span className="display-name">{group}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupClick(group);
                    }}
                    className="search-button"
                    style={{
                      marginLeft: '10px',
                      backgroundColor: '#3b82f6',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    See / Leave Group
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupToggle(group);
                    }}
                    className="search-button"
                    style={{
                      marginLeft: '10px',
                      backgroundColor: removedGroups.includes(group) ? '#ef4444' : '#3b82f6',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {removedGroups.includes(group) ? 'Undo Remove' : 'Remove Group'}
                  </button>
                </div>
              ))}
            </div>
            
            {removedGroups.length > 0 && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveChanges}
                  className="search-button"
                >
                  Save Changes ({removedGroups.length} changes)
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Previous sections remain the same... */}
        
        {/* Add Group Section */}
        <div ref={addGroupRef} className="section-box" style={{ marginTop: '50px' }}>
          <h2 className="main-box-title">Create a Group!</h2>
          <form onSubmit={handleAddGroup} className="add-group-form">
            <div className="form-group">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="text-input"
              />
            </div>
            
            {/* Friends List Section with Updated Button Styling */}
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Friends to the group</h3>
              {friendsLoading && <div className="text-gray-500">Loading friends...</div>}
              {friendsError && <div className="text-red-500">{friendsError}</div>}
              <div className="space-y-2">
                {friends.map((friend, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    style={{marginTop:"20px"}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="font-medium w-48">{friend.display_name}</span>
                        <span className="text-gray-500 w-32" style={{marginLeft:"50px"}}>@{friend.username}</span>
                        <button
                        type="button"
                        onClick={() => handleFriendToggle(friend.username)}
                        className="px-4 py-2 text-white w-32"
                        style={{
                          backgroundColor: selectedFriends.includes(friend.username) ? '#ef4444' : '#3b82f6',
                          color: 'white',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'background-color 0.2s ease',
                          marginLeft:"50px"
                        }}
                      >
                        {selectedFriends.includes(friend.username) ? 'Remove Friend' : 'Add Friend'}
                      </button>
                      </div>
                      
                    </div>
                  </div>
                ))}
                {!friendsLoading && !friendsError && friends.length === 0 && (
                  <div className="text-gray-500">No friends found</div>
                )}
              </div>
            </div>

            <button type="submit" className="search-button" style={{ marginTop: '20px' }}>
              Create
            </button>
          </form>
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

export default EditGroups;