import React, { useState } from 'react';
import './LoginSignupPage.css';  // Import the CSS file
import { Link } from 'react-router-dom';  // Import Link


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    //INSERT API CALL HERE
  };

  return (
    <div className="container">
      <h1>Welcome to LeisureLink!</h1>
      <h2>Please Log In</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="input-container">
          <label className="label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" className="button">Log In</button>
        <Link to="/SignupPage">
          <button className="button" style={{ marginLeft: '20px' }}>Or Sign up today!</button>
        </Link>
      </form>
    </div>
  );
}

export default LoginPage;
