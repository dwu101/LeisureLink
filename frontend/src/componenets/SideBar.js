import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import Alert from './Alert';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');
  const [alertMessage, setAlertMessage] = useState('error');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const logOut = async () => {
    toggleSidebar();
    try {
        const response = await fetch('/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
    
        if (!response.ok) {
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage("Error Signing Out")        
        }
        else{
            const params = new URLSearchParams({
                show: true,
                message: "successful sign out",
                type: "success" 
            });
            console.log(params)
            window.location.href = '/?' + params.toString();
            

        }
    
        
      } catch (error) {
        setShowAlert(true);
            setAlertType('error');
            setAlertMessage("Error Signing Out")    
      }

  }

  return (
    <div>
        <Alert
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
        />
    <div className="sidebar-container">

      {/* Hamburger Icon */}
      <div className={`hamburger-icon`} onClick={toggleSidebar}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      {/* Sidebar */}
      
      <div className={`sidebar ${isOpen ? 'show' : ''}`}>
        <ul>
        <li style={{ marginTop: '40px' }}>
            <Link to="/Home" onClick={toggleSidebar}>Home</Link>
          </li>
          <li>
            <Link to="/EditProfile" onClick={toggleSidebar}>Edit Profile</Link>
          </li>
          <li>
            <Link to="/services" onClick={toggleSidebar}>Services</Link>
          </li>
          
          <li style={{marginTop:"50px"} } onClick={logOut}>
             Sign Out
          </li>
        </ul>
      </div>
    </div>
    </div>
  );
};

export default Sidebar;
