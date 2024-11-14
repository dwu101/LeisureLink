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

      // Handle successful login
      setMessage(response.data.message); // Or redirect, etc.
      sessionStorage.setItem('username', username)
      navigate('/ProfilePage');               // Go to new page

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
    <div className="container">
      <h1>Welcome to LeisureLink!</h1>
      <h2>Please Log In</h2>
      
      <form onSubmit={handleSubmit} className="form" onKeyPress={handleKeyPress}>
        <div className="input-container">
          <label className="label">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="input-container">
          <label className="label">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </div>
        

        <Link to="/SignupPage">
          <button className="button" >Or Sign up today!</button>
        </Link>
        <button type="submit" className="button" style={{marginLeft:'10px'}}>Log In</button>

      </form>

      {/* <HelloWorld  names={namesArray} /> */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginPage;
