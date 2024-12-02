import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfile.css';
import './ProfilePage.css'
import Alert from '../components/Alert';
import Sidebar from '../components/SideBar';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import StyledTagsDisplay from '../components/StyledTagsDisplay';
import NavigationPrompt from '../components/NavigationPrompt';
import ProfileIcon from '../components/ProfileIcon';


function EditProfile() {
  const goingOut = [
    "Bars", "Cafe-hopping", "Clubs", "Concerts", "Festivals",
    "Karaoke", "Museums & galleries", "Stand up", "Theater"
  ];
  
  const activities = [
    "Gym", "Badminton", "Baseball", "Basketball", "Bouldering",
    "Volleyball", "Boxing", "Football", "Soccer", "Yoga"
  ];
  
  const stayingIn = [
    "Reading", "Video games", "Board games", "Cooking", "Baking",
    "Meditation", "Puzzle solving", "Movie watching", "TV binge watching",
    "Knitting", "Podcasts", "Journaling", "Scrapbooking", "DIY projects",
    "Online shopping"
  ];
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [originalTags, setOriginalTags] = useState([]);
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [navPath, setNavPath] = useState('');
  const [isChanged, setIsChanged] = useState(false);

  const [updatedData, setUpdatedData] = useState({
    newPassword: '',
    newPassword2: '',
    newEmail: '',
    newBio: '',
    newDisplayName: '',
    newTags: []
  });
  

  const username = sessionStorage.getItem('username');
  const MAX_TAGS = 6;

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      console.log(sessionStorage.getItem('username'));
  
      try {
        const response = await fetch(`/getProfile?username=${username}`);
        const result = await response.json();
  
        if (result.success) {
          setProfile(result.profile);
          const initialTags = result.profile.tags || [];
          setSelectedTags(initialTags);
          setOriginalTags(initialTags);
          setUpdatedData(prev => ({
            ...prev,
            newTags: initialTags
          }));

        } else {
          setError(result.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [username]);

  useEffect(() => {
    const hasUnsavedChanges = 
      updatedData.newPassword !== '' ||
      updatedData.newPassword2 !== '' ||
      updatedData.newEmail !== '' ||
      updatedData.newBio !== '' ||
      updatedData.newDisplayName !== '' ||
      JSON.stringify(updatedData.newTags) !== JSON.stringify(originalTags) ||
      isChanged;
    
    setHasChanges(hasUnsavedChanges);
  }, [updatedData, originalTags, isChanged]);

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
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let messages = [];


    if (updatedData.newPassword === updatedData.newPassword2){
      updatedData.tags = selectedTags;

      try {
        if (updatedData.newPassword) {
          await axios.post('/changePassword', { newPassword: updatedData.newPassword, username: username});
          if (messages.length){
            messages.push(", Password")
          }
          else{
          messages.push('Successfully changed Password');
          }
        }
        if (updatedData.newEmail) {
          await axios.post('/changeEmail', { newEmail: updatedData.newEmail , username: username});
          if (messages.length){
            messages.push(", Email")
          }
          else{
          messages.push('Successfully changed Email');
          }
        }
        if (updatedData.newBio) {
          await axios.post('/changeBio', { newBio: updatedData.newBio , username: username });
          if (messages.length){
            messages.push(", Bio")
          }
          else{
          messages.push('Successfully changed Bio');
          }
        }
        if (updatedData.newDisplayName) {
          await axios.post('/changeDisplayName', { newDisplayName: updatedData.newDisplayName , username: username });
          if (messages.length){
            messages.push(", Name")
          }
          else{
          messages.push('Successfully changed Name');
          }
        }
        if (selectedTags !== originalTags){
          await axios.post('/updateTags', { username: username , tags: updatedData.newTags });
            if (messages.length){
              messages.push(", Tags")
            }
            else{
            messages.push('Successfully changed Tags');
            }
        }


        setHasChanges(false);
        setAlertType('success');
        messages.push("- Reload to see changes.")
        setAlertMessage(messages.join(' '));
        setUpdatedData({
          newPassword: '',
          newPassword2: '',
          newEmail: '',
          newBio: '',
          newDisplayName: '',
          newTags: updatedData.newTags
        })
      } catch (error) {
        console.error('Error updating profile:', error);
        setAlertType('error');
        setAlertMessage('Failed to update profile. Please try again.');
      }

      setShowAlert(true);
    } else{
      setShowAlert(true);
      setAlertType('error');
      setAlertMessage('Passwords do not match');
    };
  }

  
  const handleAddTag = (tag) => {
    if (selectedTags.length >= MAX_TAGS) {
      setShowAlert(true);
      setAlertType('error');
      setAlertMessage(`You can only select up to ${MAX_TAGS} tags`);
      return;
    }
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setUpdatedData(prev => ({
        ...prev,
        newTags: newTags
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setUpdatedData(prev => ({
      ...prev,
      newTags: newTags
    }));
  };

 
  const InteractiveTagsDisplay = ({ tags, onClick, isSelectable }) => {
    const handleClick = (tag) => (e) => {
      e.stopPropagation();
      onClick(tag.replace(' ✕', '')); 
    };
  
    const displayTags = tags.map(tag => ({
      text: isSelectable ? tag : `${tag} ✕`,
      originalTag: tag
    }));
  
    const styles = {
      container: {
        display: "flex",
        flexWrap: "wrap", 
        gap: "10px", 
        justifyContent: "flex-start", 
        marginTop: "10px"
      },
      tagBubble: {
        padding: "10px 15px",
        backgroundColor: "#A9A9A9",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#333",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        flex: "0 0 calc(50% - 10px)", 
        textAlign: "center",
        cursor: "pointer"
      }
    };
  
    return (
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        {displayTags.map(({ text, originalTag }) => (
          <div 
            key={originalTag}
            onClick={handleClick(originalTag)}
            style={styles.tagBubble}
          >
            {text}
          </div>
        ))}
      </div>
    );
  };
  
  const TagSection = ({ title, tags, isSelectable = true }) => (
    <div className="mb-6 w-full max-w-2xl">
      <div className="mb-3 text-center">
        <h3>{title}</h3>
        {title === "Current" && (
          <div className="text-base text-gray-500 mt-1">
            {selectedTags.length} of {MAX_TAGS} tags selected
          </div>
        )}
      </div>
      <InteractiveTagsDisplay 
        tags={tags}
        onClick={isSelectable ? handleAddTag : handleRemoveTag}
        isSelectable={isSelectable}
      />
    </div>
  );

 

  if (loading) return <div className="flex justify-center p-4"></div>;
  if (error) return <div className="flex justify-center p-4 text-red-500">{error}</div>;

  

  return (
    <div className="container">
      <h1 style={{textAlign: "center"}}>Edit Profile</h1>
      <div className="profile-container">

      <div>
        <ProfileIcon onClickFunc={handleNavigation}/>
        <Sidebar onClickFunc={handleNavigation} />
    <div className="profile-container">
      

      <aside className="profile-sidebar relative flex flex-col h-full"  style={{backgroundColor: "#e0e0e0"}}
      >
        <div className="profile-image-container">
          <img 
            src={profile?.pfp_link || "/profile-pictures/defaultpfp.jpg"} 
            alt="Profile" 
            className="profile-image" 
          />
        </div>
        
        <div className="profile-info flex-grow">
          <InfoField label="Name" value={profile?.display_name || 'None'} />
          <InfoField label="Username" value={username} />
          <InfoField label="Email" value={profile?.email || 'Loading...'} />
          <InfoField label="Status" value={profile?.status || 'None'} />
          
      

          <InfoField 
            label="Bio" 
            value={profile?.bio || 'None'} 
          />

          <div >
            <InfoField label="Interests"/>
            <StyledTagsDisplay tags={profile?.tags} />
            
          </div>
        
        </div>
      </aside>

      </div>
      </div>

        
        <div className="update-data" style={{marginLeft:"50px"}}>
          <h2>Update Info</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <label>New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={updatedData.newPassword}
                onChange={handleChange}
                className="input"
                style={{marginLeft:"20px"}}
              />
            </div>
            <div className="input-container">
              <label>Confirm New Password:</label>
              <input
                type="password"
                name="newPassword2"
                value={updatedData.newPassword2}
                onChange={handleChange}
                className="input"
                style={{marginLeft:"2px"}}
              />
            </div>
            <div className="input-container">
              <label>New Email:</label>
              <input
                type="email"
                name="newEmail"
                value={updatedData.newEmail}
                onChange={handleChange}
                className="input"
                style={{marginLeft:"20px"}}
              />
            </div>
            <div className="input-container">
              <label>New Bio:</label>
              <input
                type="text"
                name="newBio"
                value={updatedData.newBio}
                onChange={handleChange}
                className="input"
                style={{marginLeft:"20px"}}
              />
            </div>
            <div className="input-container">
              <label>New Name:</label>
              <input
                type="text"
                name="newDisplayName"
                value={updatedData.newDisplayName}
                onChange={handleChange}
                className="input"
                style={{marginLeft:"20px"}}
              />
            </div>
            <div >
              <ProfilePictureUpload setIsChanged={setIsChanged}/>
            </div>

            <h2 style={{marginTop:"30px"}}>Edit  Tags</h2>
              <div className="min-h-screen p-6 flex flex-row items-center" style={{marginLeft:"100px"}}>
                <div className="w-full max-w-2xl">
                  
                  
                  {/* Selected Tags Section */}
                  <TagSection 
                    title="Current" 
                    tags={selectedTags} 
                    isSelectable={false}
                  />

                  {/* Available Tags Sections */}
                  <TagSection 
                    title="Going Out" 
                    tags={goingOut.filter(tag => !selectedTags.includes(tag))} 
                  />
                  <TagSection 
                    title="Activities" 
                    tags={activities.filter(tag => !selectedTags.includes(tag))} 
                  />
                  <TagSection 
                    title="Staying In" 
                    tags={stayingIn.filter(tag => !selectedTags.includes(tag))} 
                  />
                </div>
              </div>
             
            <button style={{marginTop: "50px"}} type="submit" className="button">Save Changes</button>
          </form>

          
        </div>
      </div>

      {/* Alert Component */}
      <Alert
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      <NavigationPrompt
        when={showPrompt}
        message="You have unsaved changes. Are you sure you want to leave?"
        onOK={handleLeave}
        onCancel={handleStay}
      />
    </div>
  );
}

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label>{label}</label>
    <p>{value}</p>
  </div>
);
export default EditProfile;
