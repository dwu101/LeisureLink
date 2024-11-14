import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfile.css';
import Alert from '../componenets/Alert';

function EditProfile() {
  // State for user data, updated data, and alert
  const [userData, setUserData] = useState({
    password: '******',
    email: 'user@example.com',
    bio: 'This is my bio.',
    displayName: 'User123',
  });

  const [updatedData, setUpdatedData] = useState({
    newPassword: '',
    newEmail: '',
    newBio: '',
    newDisplayName: '',
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // Fetch user data on component mount (fake endpoint for now)
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get('http://localhost:5000/api/user/getProfile');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    fetchUserData();
  }, []);

  // Handle input changes for updated data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit updated data to corresponding endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    let messages = [];

    try {
      if (updatedData.newPassword) {
        await axios.post('http://localhost:5000/api/user/changePassword', { password: updatedData.newPassword });
        messages.push('Successfully changed Password!');
      }
      if (updatedData.newEmail) {
        await axios.post('http://localhost:5000/api/user/changeEmail', { email: updatedData.newEmail });
        messages.push('Successfully updated Email!');
      }
      if (updatedData.newBio) {
        await axios.post('http://localhost:5000/api/user/changeBio', { bio: updatedData.newBio });
        messages.push('Successfully updated Bio!');
      }
      if (updatedData.newDisplayName) {
        await axios.post('http://localhost:5000/api/user/changeDisplayName', { displayName: updatedData.newDisplayName });
        messages.push('Successfully updated Display Name!');
      }

      setAlertType('success');
      setAlertMessage(messages.join(' '));
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertType('error');
      setAlertMessage('Failed to update profile. Please try again.');
    }

    setShowAlert(true);
  };

  return (
    <div className="container">
      <h1>Edit Profile</h1>
      <div className="profile-container">
        {/* Left side: Current user data (unclickable) */}
        <div className="current-data">
          <h2>Current Info</h2>
          <div className="info-box"><strong>Password:</strong> ******</div>
          <div className="info-box"><strong>Email:</strong> {userData.email}</div>
          <div className="info-box"><strong>Bio:</strong> {userData.bio}</div>
          <div className="info-box"><strong>Display Name:</strong> {userData.displayName}</div>
        </div>

        {/* Right side: Editable input boxes */}
        <div className="update-data">
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
              />
            </div>
            <div className="input-container">
              <label>New Display Name:</label>
              <input
                type="text"
                name="newDisplayName"
                value={updatedData.newDisplayName}
                onChange={handleChange}
                className="input"
              />
            </div>
            <button type="submit" className="button">Save Changes</button>
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

export default EditProfile;
