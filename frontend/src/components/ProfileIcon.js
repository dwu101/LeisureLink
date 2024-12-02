import { useNavigate } from 'react-router-dom';

const ProfileIcon = ({onClickFunc = null}) => {
  const navigate = useNavigate();
  const pfp_link = sessionStorage.getItem('pfp_link') || "/profile-pictures/defaultpfp.jpg"
  console.log("PFPF LINK")
  console.log(pfp_link)
  if (!onClickFunc){
      return (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            cursor: 'pointer'
          }}
          
          onClick={() => navigate('/ProfilePage')}
        >
          <img
            src={pfp_link}
            alt="Profile"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      );
  }
  else  {
    return (
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          cursor: 'pointer'
        }}
        
        onClick={() => onClickFunc('/ProfilePage')}
      >
        <img
          src={pfp_link}
          alt="Profile"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    );

  }


};

export default ProfileIcon;