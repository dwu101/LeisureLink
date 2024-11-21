// import React, { useState } from 'react';
// import './LoginSignupPage.css';  // Import the CSS file
// import { Link } from 'react-router-dom';  // Import Link
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';


// function SignupPage() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState(''); // Add this line to define setMessage


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log(email);
//     console.log(username);
//     console.log(password);
//     //INSERT API CALL HERE
//     try {
//       const response = await axios.post('/signup', {
//         email,
//         username,
//         password,
//       });

//       // Display success message or redirect as needed
//         setMessage(response.data.message);
//         navigate("/ProfilePage")
//       } catch (error) {
//         setMessage(error.response?.data?.error || "Signup failed. Please try again.");
//       }

//   };

  


//   return (
//     <div className = "infobox">
//     <div className="signinbox">
//         <form onSubmit={handleSubmit} className="form">
//           <label className="label">Email:</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="input"
//           />

//           <label className="label">Username:</label>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//             className="input"
//           />

//           <label className="label">Password:</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="input"
//           />

//           <button type="submit" className="button">Sign Up!</button>
//           <Link to="/">
//             <button className="button">Login instead</button>
//           </Link>
//         </form>
//         {message && <p>{message}</p>}
//       </div>
//       </div>
//   );
// }

// export default SignupPage;
