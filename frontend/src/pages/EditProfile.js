import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfile.css';  
import { Link } from 'react-router-dom';  
import HelloWorld from '../componenets/HelloWorld';

function UserProfile() {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: '',
    bio: '',
    displayName: '',
  });
  const [updatedData, setUpdatedData] = useState({ ...userData });

  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get('http://localhost:5000/api/user'); // Adjust endpoint as needed
        setUserData(response.data);
        setUpdatedData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    fetchUserData();
  }, []);

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/user/update', updatedData); // Adjust endpoint as needed
      alert(response.data.message || 'Profile updated successfully!');
      setUserData(updatedData); // Update displayed data with new info
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit} className="form">
        {Object.entries(userData).map(([key, value]) => (
          <div className="input-container" key={key}>
            <label className="label">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </label>
            <div className="input-box">
              <span className="current-value">{value}</span>
              <input
                type={key === 'password' ? 'password' : 'text'}
                name={key}
                value={updatedData[key]}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        ))}
        <button type="submit" className="button">Save Changes</button>
      </form>
    </div>
  );
}

export default UserProfile;
