import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfile.css';
import './ProfilePage.css'
import Alert from '../components/Alert';
import Sidebar from '../components/SideBar';
import { Link } from 'react-router-dom';
import { centerCrop } from 'react-image-crop';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

function EditProfile() {
  const [profile, setProfile] = useState(null);

  const [userData, setUserData] = useState({
    password: '******',
    email: '',
    bio: '',
    displayName: '',
    pfp_link: '',
  });

  const [updatedData, setUpdatedData] = useState({
    newPassword: '',
    newPassword2: '',
    newEmail: '',
    newBio: '',
    newDisplayName: '',
  });

  const username = sessionStorage.getItem('username');


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
        } else {
          // setError(result.message || 'Failed to fetch profile');
        }
      } catch (err) {
        // setError('Error connecting to server');
      } finally {
        // setLoading(false);
      }
    };
  
    fetchProfile();
  }, [username]);
  

  // Handle input changes for updated data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit updated data to corresponding endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    let messages = [];

    if (updatedData.newPassword === updatedData.newPassword2){

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
        
        setAlertType('success');
        messages.push(". Reload to see changes.")
        setAlertMessage(messages.join(' '));
        // window.location.reload();
        setUpdatedData({
          newPassword: '',
          newPassword2: '',
          newEmail: '',
          newBio: '',
          newDisplayName: '',
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
  

  return (
    <div className="container">
      <h1 style={{textAlign: "center"}}>Edit Profile</h1>
      <div className="profile-container">

      <div>
        <Sidebar />
    <div className="profile-container">
      

      <aside className="profile-sidebar relative flex flex-col h-full">
        <div className="profile-image-container">
          <img 
            src={profile?.pfp_link || "/profile-pictures/defaultpfp.png"} 
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
              <ProfilePictureUpload/>
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
