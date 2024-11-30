import './ProfilePage.css';
import React, { useState, useEffect} from 'react';
import Sidebar from '../components/SideBar';
import ProfileIcon from '../components/ProfileIcon';
import { useLocation, useParams } from 'react-router-dom';  
import Alert from '../components/Alert';
import StyledTagsDisplay from '../components/StyledTagsDisplay';

 


const ProfilePageSearch = () => {
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [isFriend, setIsFriend] = useState(false);

  const { usernametmp } = useParams();

  const location = useLocation();
  const username = location.state?.username || usernametmp

 
  console.log(username)
  
  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/getProfile?username=${username}`);
          const result = await response.json();
        
        if (result.success) {
          setProfile(result.profile);
          console.log(result.profile)
        } else {
          setError(result.message || 'Failed to fetch profile');
        }

      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    const checkFriendshipStatus = async () => {
      try {
        const response = await fetch('/checkFriendship', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentUsername: sessionStorage.getItem('username'), // Current logged-in user
            friendUsername: username // Profile being viewed
          }),
        });
  
        const result = await response.json();
        if (result.success) {
          setIsFriend(result.areFriends);
        } else {
          console.error('Failed to check friendship status:', result.message);
        }
      } catch (error) {
        console.error('Error checking friendship status:', error);
      }
    };
  
    checkFriendshipStatus();
    fetchProfile();
  }, [username]);

  const handleAddFriend = async () => {
    try {
      const response = await fetch('/addFriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_user: sessionStorage.getItem('username'),
          friend_username: username
        }),
      });
  
      const result = await response.json();
      if (result.success) {
        setShowAlert(true);
        setAlertType('success');
        setAlertMessage('Successfully Added Friend!')
        setIsFriend(true)
      } else {
        console.error('Failed to send friend request:', result.message);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>

        <Alert
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

    <div className="profile-container">
      <ProfileIcon/>

      <aside className="profile-sidebar relative flex flex-col h-full">
        <div className="profile-image-container">
          <img 
            src={profile?.pfp_link || "/profile-pictures/defaultpfp.jpg"} 
            alt="Profile" 
            className="profile-image" 
          />
        </div>
        
        <div className="profile-info flex-grow">
        {!isFriend &&
            <div className="mt-4 text-green-600 friend-button-container">
              <button
                onClick={handleAddFriend}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                + Add Friend !
              </button>
            </div>
          }

          {isFriend &&
            <div className="mt-4 text-green-600 friend-button-container">
              <button 
                className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
              >
                Friend Already Added!
              </button>
            </div>
          }
          <InfoField label="Name" value={profile?.display_name || 'None'} />
          <InfoField label="Username" value={username} />
          <InfoField label="Email" value={profile?.email || 'Loading...'} />
          <InfoField label="Status" value={profile?.status || 'Active'} />
          
      

          <InfoField 
            label="Bio" 
            value={profile?.bio || 'None'} 
          />

          <div style={{marginTop: "30px"}}>
            <InfoField label="Interests"/>
            <StyledTagsDisplay tags={profile?.tags} />
          </div>
          
         
        </div>

      </aside>

      <main className="profile-main">
        <div className="featured-project">
          <h2>Groups</h2>
          <div className="groups-list">
          {profile?.groups?.length > 0 ? (
              profile.groups.map((group, index) => (
                <div key={index} className="group-item">
                  <h3>{group}</h3>
                </div>
              ))
            ) : (
              <div >
                <p>None</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
    </div>
  );
};

const InfoField = ({ label, value=null }) => (
  <div className="info-field">
    <label>{label}</label>
    <p>{value}</p>
  </div>
);

export default ProfilePageSearch;
