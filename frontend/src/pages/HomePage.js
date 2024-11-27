import React, { useState, useEffect } from 'react';
import './HomePage.css';  
import { Link } from 'react-router-dom';  
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';


function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Add this line to define setMessage
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [signingUp, setSigningUp] = useState(false);
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');

  sessionStorage.setItem('gcalLinked', false);



  useEffect(() => { 
    
    const params = new URLSearchParams(window.location.search);

    const showParam = params.get('show');
    const typeParam = params.get('type');
    const messageParam = params.get('message');
    console.log(showParam)
    console.log(typeParam)
    console.log(messageParam)


    setShowAlert(showParam ? decodeURIComponent(showParam) : false);
    setAlertType(typeParam ? decodeURIComponent(typeParam) : '');  // or your default type
    setAlertMessage(messageParam ? decodeURIComponent(messageParam) : '');  // or your default message

  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!signingUp){
      try {
        const response = await axios.post('/login', {
          username,
          password,
        });
        if (response.data.status === 200){
          setMessage(response.data.message); // Or redirect, etc.
          sessionStorage.setItem('username', username)
            
          const responsePFP = await fetch(`/getProfile?username=${username}`);
            const resultPFP = await responsePFP.json();
          
          if (resultPFP.success) {
          
            sessionStorage.setItem('pfp_link', resultPFP.profile.pfp_link)
  
          } 
          
          console.log("SUCCESS")
          navigate('/ProfilePage');
        }  
        else{
          setMessage(response?.data?.error || "Login failed. Please try again.");

        }

      } catch (error) {
        // Handle errors (e.g., incorrect credentials)
        setMessage(error.response?.data?.error || "Login failed. Please try again.");
      }
    }
    else{
      if (password === password2){
        console.log(email)
        console.log(username)
        console.log(password)
        try {
          const formData = new FormData();
          formData.append('email', email);
          formData.append('username', username);
          formData.append('password', password);
        
          const response = await axios.post('/signUp', formData, {
            headers: {
              'Content-Type': 'application/json'  // Specify content type for form data
            }
          });
          
          setMessage(response.data.message);
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('pfp_link',"/profile-pictures/defaultpfp.png")
          
          navigate("/ProfilePage");
          
        } catch (error) {
          setMessage(error.response?.data?.error || "Signup failed. Please try again.");
        }

      } else{
        setShowAlert(true);
        setAlertType('error');
        setAlertMessage('Passwords do not match')

      }
    }



  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };


  
  return (

    <div className="fullbox">
  <Alert
  show={showAlert}
  type={alertType}
  message={alertMessage}
  onClose={() => setShowAlert(false)}
/>



      <div className="infobox">
      <h1 >Welcome to LeisureLink!</h1>
      <p style={{fontSize:"20px"}}>LeisureLink is a social networking platform that allows users to expand their group of friends by finding those with similar interests. It will provide a seamless way to find optimal times to schedule events or gatherings within a group. All the features will be available and easily accessible from our website.</p>
      <p style={{fontSize:"20px"}}>By: Daniel Wu, Nick Pham,<br></br> Srikar Puri, and Lucas Eng</p>
      </div>
      <div className="signinbox">

      <form onSubmit={handleSubmit} className="form" onKeyPress={handleKeyPress}>

          <label className="label">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
          />


          <label className="label">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />

        

        {/* <Link to="/SignupPage"> */}
        {!signingUp && (
          <>
          <button className="button" onClick={() => setSigningUp(true)}>Or Sign up today!</button>
          <button type="submit" className="button">Login</button>
          </>
        )}
        {signingUp && (
          <>
          <label className="label">Confirm Password:</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="input"
          />
          <label className="label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <button className="button" onClick={() => setSigningUp(false)}>Log in Instead!</button>
          <button type="submit" className="button">Sign Up</button>
          </>
        )}

      </form>

      {/* <HelloWorld  names={namesArray} /> */}
      {/* {message && <p>{message}</p>} */}
      </div>
    </div>
  );
}


export default LoginPage;
