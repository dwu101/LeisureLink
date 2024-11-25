import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import Alert from './Alert';

const Sidebar = ({isOpen: propIsOpen, setIsOpen: propSetIsOpen, onClickFunc = null}) => {
  // const [isOpen, setIsOpen] = useState(false);

  const [internalIsOpen, internalSetIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : internalSetIsOpen;

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
                message: "Signed Out",
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
      {!onClickFunc ? (
      
      <div className={`sidebar ${isOpen ? 'show' : ''}`}>

        <ul>
         
        <li style={{ marginTop: '40px' }}>
        <Link to="/EditProfile" onClick={toggleSidebar}>Edit Your Profile</Link>
        </li>
         
         

          <li>
            <Link to="/SearchPage" onClick={toggleSidebar}>Search</Link>
          </li>

          <li>
            <Link to="/EditGroups" onClick={toggleSidebar}>Edit Groups</Link>
          </li>
          
          <li style={{marginTop:"50px",cursor: "pointer"}} onClick={logOut}>
             Sign Out
          </li>
        </ul>

      </div>
      ) : (
      <div className={`sidebar ${isOpen ? 'show' : ''}`}>

        <ul>
 
          <li style={{marginTop:"40px", cursor:"pointer"}} onClick={() => onClickFunc('/EditProfile')}>Edit Your Profile
          </li>

          <li style={{cursor:"pointer"}}onClick={() => onClickFunc('/SearchPage')}>Search
          </li>

          <li style={{cursor:"pointer"}}onClick={() => onClickFunc('/EditGroups')}>Search
          </li>


        
          <li style={{marginTop:"50px",cursor: "pointer"}} onClick={logOut}>
             Sign Out
          </li>
        </ul>

      </div>
  )}



    </div>
    </div>
  );
};

export default Sidebar;
