import React, { useState } from 'react';
import './LoginSignupPage.css';  
import { Link } from 'react-router-dom';  
import HelloWorld from '../componenets/HelloWorld';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Add this line to define setMessage


  const handleSubmit = async (event) => {
    event.preventDefault();
    //INSERT API CALL HERE
      try {
        const response = await axios.post('/login', {
          username,
          password,
        });
        if (response.data.status === 200){
          setMessage(response.data.message); // Or redirect, etc.
          sessionStorage.setItem('username', username)
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



  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="fullbox">
      <div className="infobox">
      <h1>Welcome to LeisureLink!</h1>
      <p>LeisureLink is a social networking platform that allows users to expand their group of friends by finding those with similar interests. It will provide a seamless way to find optimal times to schedule events or gatherings within a group. All the features will be available and easily accessible from our website.</p>
      <h2>By Daniel Wu, Nick Pham,<br></br> Srikar Puri, and Lucas Eng</h2>
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

        

        <Link to="/SignupPage">
          <button className="button" >Or Sign up today!</button>
        </Link>
        <button type="submit" className="button">Log In</button>

      </form>

      {/* <HelloWorld  names={namesArray} /> */}
      {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
