import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/SideBar';
import Alert from '../components/Alert';
import ProfileIcon from "../components/ProfileIcon";
import { useNavigate } from 'react-router-dom';
import NavigationPrompt from '../components/NavigationPrompt';

const AddEvent = () => {
  const [eventDetails, setEventDetails] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const username = sessionStorage.getItem('username');
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([username]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [navPath, setNavPath] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (eventDetails.endDateTime < eventDetails.startDateTime && eventDetails.endDateTime !== '') {
      setAlertMessage("End Time should be later than Start Time");
      setAlertType("error");
      setShowAlert(true);

      setEventDetails(prev => ({
        ...prev,
        endDateTime: eventDetails.startDateTime
      }));
      
    }
  }, [eventDetails.startDateTime]);

  useEffect(() => {
    const unsavedChanges = eventDetails.summary.trim() !== '' || 
                          eventDetails.description.trim() !== '' || 
                          eventDetails.startDateTime !== '' || 
                          eventDetails.endDateTime !== '' ||
                          selectedFriends.length > 1;
    setHasChanges(unsavedChanges);
  }, [eventDetails, selectedFriends]);

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
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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

  useEffect(() => {
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

    fetchFriends();
  }, []);

  const handleFriendToggle = (friendUsername) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendUsername)) {
        return prev.filter(username => username !== friendUsername);
      } else {
        return [...prev, friendUsername];
      }
    });
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setEventDetails(prev => {
      const newStartTime = new Date(newStartDate).getTime();
      const currentEndTime = new Date(prev.endDateTime).getTime();
      return {
        ...prev,
        startDateTime: newStartDate,
        endDateTime: currentEndTime < newStartTime ? newStartDate : prev.endDateTime
      };
    });
  };
  
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEventDetails(prev => {
      const startTime = new Date(prev.startDateTime).getTime();
      const newEndTime = new Date(newEndDate).getTime();
      return {
        ...prev,
        endDateTime: newEndTime < startTime ? prev.startDateTime : newEndDate
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFriends.length === 1) {
      setAlertMessage('Please Select Someone to Invite');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
      
    try {
      const formattedStartTime = new Date(eventDetails.startDateTime).toISOString();
      const formattedEndTime = new Date(eventDetails.endDateTime).toISOString();
      const body = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        startDateTime: formattedStartTime,
        endDateTime: formattedEndTime,
        friends: selectedFriends
      };

      const response = await axios.post('/addEvent', body);
      
      if (response.data.success) {
        setAlertMessage('Event added successfully!');
        setAlertType('success');
        setShowAlert(true);
        setEventDetails({
          summary: '',
          description: '',
          startDateTime: '',
          endDateTime: ''
        });
        setSelectedFriends([username]);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      if (error.response?.status === 401) {
        setAlertMessage('Authentication expired. Please login again.');
        setAlertType('error');
        setShowAlert(true);
      } else {
        setAlertMessage('Failed to add event: ' + (error.response?.data?.error || error.message));
        setAlertType('error');
        setShowAlert(true);
      }
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
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} onClickFunc={handleNavigation}/>
      
      <div className="main-box">
        <ProfileIcon onClickFunc={handleNavigation}/>
        
        <div className="section-box"   style={{backgroundColor: "#e0e0e0"}}
        >
          <h1 className="main-box-title">Add Calendar Event</h1>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={eventDetails.summary}
                onChange={(e) => setEventDetails({...eventDetails, summary: e.target.value})}
                className="text-input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                value={eventDetails.description}
                onChange={(e) => setEventDetails({...eventDetails, description: e.target.value})}
                className="text-input"
                rows="4"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventDetails.startDateTime}
                onChange={handleStartDateChange}
                className="text-input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventDetails.endDateTime}
                onChange={handleEndDateChange}
                className="text-input"
                min={eventDetails.startDateTime}
                required
              />
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add friends to the event</h3>
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
                          {selectedFriends.includes(friend.username) ? 'Remove' : 'Add'}
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
            
            <button 
              type="submit" 
              className="search-button"
              style={{marginTop:"50px", fontSize: "18px"}}
            >
              Add Event
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

export default AddEvent;