import './ProfilePage.css';
import React, { useState, useEffect} from 'react';
import Sidebar from '../components/SideBar';

import { Link } from 'react-router-dom';  

 


const ProfilePage = () => {
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [gcalLinked, setGcalLinked] = useState(false);

  const username = sessionStorage.getItem('username');

  
  useEffect(() => {

    const fetchProfile = async () => {
      console.log(sessionStorage.getItem('username'))

      try {
        const response = await fetch(`/getProfile?username=${username}`);
          const result = await response.json();
        
        if (result.success) {
          setProfile(result.profile);
        } else {
          setError(result.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }

      try {
        const responseLink = await fetch('/gcalLinked', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username }),
        });
      
        const resultLink = await responseLink.json();
        console.log("AAAA");
        console.log(resultLink);
      
        if (resultLink[1] === true) {
          setGcalLinked(true);
        } else {
          setGcalLinked(false);
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
      
    };
  

    fetchProfile();
  }, [gcalLinked, username]);

  const handleToggle = async () => {
    if (profile.status === "Active"){
      setProfile(prev => ({ ...prev, status: "Inactive" }));
    }
    else{
      setProfile(prev => ({ ...prev, status: "Active" }));
    }

    const data = {
      username: sessionStorage.getItem('username'),
      newStatus: profile.status,
    };

    try {
      const response = await fetch('/changeStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result)

      // if (response.ok) {
      //   setStatusMessage('Status changed successfully');
      // } else {
      //   setStatusMessage(`Error: ${result.message}`);
      // }
    } catch (error) {
      // setStatusMessage('Error: Could not update status');
      console.error('Error:', error);
    }




    console.log(profile.status);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
        <Sidebar/>
    <div className="profile-container">
      

      <aside className="profile-sidebar relative flex flex-col h-full">
        <div className="profile-image-container">
          <img 
            src={profile?.pfp_link} 
            alt="Profile" 
            className="profile-image" 
          />
        </div>
        
        <div className="profile-info flex-grow">
          <InfoField label="Name" value={profile?.display_name || 'Loading...'} />
          <InfoField label="Username" value={username} />
          <InfoField label="Email" value={profile?.email || 'Loading...'} />
          <InfoField label="Status" value={profile?.status || 'Loading...'} />
          
          <button
            status={profile.status}
            onClick={handleToggle}
          >{profile.status==="Active" ? "Click to become Inactive" : "Click to become Active"}</button>

          <InfoField 
            label="Bio" 
            value={profile?.bio || 'Loading...'} 
          />
          {gcalLinked && (
            <div>
            <InfoField label="Calendar" value={"Google Calendar is Linked!"} />

            <Link to="/AddEvent">
              <button>
                  Create an Event!
              </button>
            </Link>
          </div>
          )}
          {!gcalLinked && (
            <div>
            <InfoField label="Calendar" value={"Google Calendar is not Linked"} />
          </div>
          )}
        </div>

        

      
{/* 
        {!gcalLinked && (
          <div className="button-container">
            Gcal is not Linked
          </div>
        )} */}

        <div className="button-container">
          
          <Link to="/GoogleAuth">
          <button style={{marginTop:"20px"}}>Link/Change GCal</button>
          </Link>
        </div>

        <div className="button-container">
          
          <Link to="/EditProfile">
          <button style={{marginTop:"50px", fontSize: "20px"}}>Edit Profile</button>
          </Link>
        </div>
      </aside>

      <main className="profile-main">
        <div className="featured-project">
          <h2>Groups</h2>
          <div className="groups-list">
            {profile?.groups?.map((group, index) => {
              return (
                <div key={index} className="group-item">
                  <h3>{group}</h3>
                  {/* <p>{group.content}</p> */}
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label>{label}</label>
    <p>{value}</p>
  </div>
);

export default ProfilePage;
