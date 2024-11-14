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
  const {username} = useParams();



  useEffect(() => {
    const fetchProfile = async (username) => {

      console.log(sessionStorage.getItem('username'))
      try {
        const response = await fetch(`http://localhost:5000/getProfile?username=${username}`);
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
  

    fetchProfile(username);
  }, []);

  const handleCircleClick = () => {
    setIsButtonClicked(!isButtonClicked);
  };

  // const handleLinkButtonClick = () => {
  //   window.location.href = "https://localhost:3000/GoogleAuth";
  // };

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
            src={profile?.pfp_link || "/assets/diddyparty.png"} 
            alt="Profile" 
            className="profile-image" 
          />
        </div>
        
        <div className="profile-info flex-grow">
          <InfoField label="Name" value={profile?.display_name || 'Loading...'} />
          <InfoField label="Username" value={username} />
          <InfoField label="Contact" value={profile?.email || 'Loading...'} />
          <InfoField label="Status" value={profile?.status || 'Loading...'} />
          <InfoField 
            label="Bio" 
            value={profile?.bio || 'Loading...'} 
          />
        </div>

        <div className="button-container">
          <button 
            onClick={handleCircleClick}
            className={`circle-button ${isButtonClicked ? 'clicked' : ''}`}
            aria-label="Action button"
          >
            <span className="button-text">
              {isButtonClicked ? 'We going!' : 'Lets go'}
            </span>
          </button>
          <Link to="/GoogleAuth">
          <button 
            // onClick={handleLinkButtonClick}
            className="circle-button link-button"
            aria-label="Link button"
          >
            <span className="button-text">Visit</span>
          </button>

          </Link>
        </div>
      </aside>

      <main className="profile-main">
        <div className="featured-project">
          <h2>Groups</h2>
          <div className="groups-list">
            {profile?.groups?.map((group, index) => {
              // Assuming each group is an object with id, title, and content
              // If your Python get_groups() returns a different structure, 
              // adjust the rendering accordingly
              return (
                <div key={index} className="group-item">
                  <h3>{group.title}</h3>
                  <p>{group.content}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="posts-grid">
          {profile.groups.map(post => (
            <article key={post.id} className="post-card">
              <div className="post-content">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
            </article>
          ))}
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
