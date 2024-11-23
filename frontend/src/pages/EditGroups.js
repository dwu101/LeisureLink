import './ProfilePage.css';
import React, { useState, useEffect} from 'react';
import Sidebar from '../components/SideBar';
import Alert from '../components/Alert';
import { Link, useParams, useLocation, useNavigate} from 'react-router-dom';
import ProfileIcon from "../components/ProfileIcon";

const EditGroups = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [gcalLinked, setGcalLinked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [removedGroups, setRemovedGroups] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/getProfile?username=${username}`);
        const result = await response.json();
        
        if (result.success) {
          setProfile(result.profile);
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

    fetchProfile();
  }, [gcalLinked, username]);

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
    navigate('/SeeGroup', { state: { group: group } });
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
        <h2 className="main-box-title">Your Groups</h2>
        
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
    </div>
  );
};

export default EditGroups;