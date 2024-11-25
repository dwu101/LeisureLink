import './ProfilePage.css';
import React, { useState, useEffect} from 'react';
import Sidebar from '../components/SideBar';
import StyledTagsDisplay from '../components/StyledTagsDisplay';

import { Link, useNavigate } from 'react-router-dom';  

 


const ProfilePage = () => {
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [gcalLinked, setGcalLinked] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();


  const username = sessionStorage.getItem('username');

 
  console.log(username)
  
  useEffect(() => {

    const fetchProfile = async () => {
 

      try {
        const response = await fetch(`/getProfile?username=${username}`);
          const result = await response.json();
        
        if (result.success) {
          setProfile(result.profile);
          // console.log("BBBB")
          // console.log(result.profile.pfp_link)
          // sessionStorage.setItem('pfp_link', result.profile.pfp_link)

        } else {
          setError(result.message || 'Failed to fetch profile');
        }

      } catch (err) {
        console.log(err)
        setError("ERROR. check logs");
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
        // console.log("AAAA");
        // console.log(resultLink);
      
        if (resultLink[1] === true) {
          setGcalLinked(true);
          sessionStorage.setItem('gcalLinked', true)
        } else {
          setGcalLinked(false);
          sessionStorage.setItem('gcalLinked', false)

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
      setProfile(prev => ({ ...prev, status: "Busy" }));
    }
    else{
      setProfile(prev => ({ ...prev, status: "Active" }));
    }

    const data = {
      username: username,
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
    return <div></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // const handleGroupClick = (group) => {
  //   // Navigate to group page or handle group click
  //   console.log('Group clicked:', group);
  //   // Example: navigate(`/group/${group}`);
  // };

  // const handleCreateGroup = () => {
  //   // Handle create group action
  //   console.log('Create group clicked');
  //   // Example: navigate('/create-group');
  // };

  return (
    <div>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
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
          <InfoField label="Status" value={profile?.status || 'Active'} />
          
          <button
            status={profile.status}
            onClick={handleToggle}
            style={{fontSize:"15px"}}
          >{profile.status==="Active" ? "Click to become Inactive" : "Click to become Active"}</button>

          <InfoField 
            label="Bio" 
            value={profile?.bio || 'None...'} 
          />



          

          {gcalLinked && (
            <div>
            <InfoField label="Calendar" value={"Google Calendar is Linked!"} />

            <div className="button-container">

                <Link to="/AddEvent">
                  <button style={{marginTop: "10px", fontSize: "15px"}}>
                      Create an Event!
                  </button>
                </Link>
            </div>

          </div>
          )}
          {!gcalLinked && (
            <div>
            <InfoField label="Calendar" value={"Google Calendar is not Linked"} />
          </div>
          )}
        </div>

        
        


        <div className="button-container">
          
          <Link to="/GoogleAuth">
          <button style={{marginTop: "10px", fontSize: "15px"}}>Link/Change GCal</button>
          </Link>
        </div>


        <div style={{marginTop: "30px"}}>
            {profile.tags.length > 0 ? (
              <div>
              <InfoField label="Interests"/>
              
              <StyledTagsDisplay tags={profile?.tags} />
              </div>
            ) :
            (
              <InfoField label="Interests" value={"None"}/>

            )}
            
          </div>




        <div className="button-container">
          
          {/* <Link to="/EditProfile"> */}
          <button onClick= {() => setIsOpen(!isOpen)} style={{marginTop:"50px", fontSize: "20px"}}>All Actions!</button>
          {/* </Link> */}
        </div>
      </aside>

      <main className="profile-main">
          <div className="featured-project">
            <div className="groups-header">
              <h2>Groups</h2>
              <button 
                onClick={() => navigate('/EditGroups')}
                className="create-group-btn"
                style={{fontSize:"18px"}}
              >
                Edit Groups and Members
              </button>
            </div>
            <div className="groups-list">
            {profile?.groups?.length > 0 ? (
  profile.groups.map((group, index) => (
    <div
      key={index}
      // className="group-item"
      style={{
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'default',
        pointerEvents: 'none',  // This will completely disable any hover effects
        border: '1px solid #e5e7eb', // Optional: adds a subtle border
        marginBottom: '0rem'  // Adds some spacing between items
      }}
    >
      <h3 style={{ 
        margin: 0,
        fontWeight: 'normal',
        color: '#333'
      }}>
        {group}
      </h3>
    </div>
  ))
) : (
  <div className="empty-groups">
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

export default ProfilePage;
