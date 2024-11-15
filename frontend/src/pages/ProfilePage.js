import './ProfilePage.css';
import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
 

const ProfilePage = () => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState(sessionStorage.getItem('username'));
  



  useEffect(() => {
    const fetchProfile = async (username) => {

    const fetchProjects = async () => {
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
    };
  

    fetchProfile();
  }, [username]);

  const handleCircleClick = () => {
    setIsButtonClicked(!isButtonClicked);
  };

  const handleToggle = () => {
    if (profile.status === "Active"){
      setProfile(prev => ({ ...prev, status: "Inactive" }));
    }
    else{
      setProfile(prev => ({ ...prev, status: "Active" }));
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

          <InfoField label="Google Calendar" value={profile?.status || 'Loading...'} />
        </div>

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
  );
};

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label>{label}</label>
    <p>{value}</p>
  </div>
);

export default ProfilePage;
