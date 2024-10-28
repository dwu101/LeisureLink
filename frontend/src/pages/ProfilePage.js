import React, { useState } from 'react';
import './ProfilePage.css';  // Import the CSS file
import { Link } from 'react-router-dom';  // Import Link


const ProfilePage = () => {
	const posts = [
	  {
		id: 1,
		title: "Latest Update",
		content: "Just launched a new feature that improves user experience by 50%!"
	  },
	  {
		id: 2,
		title: "Team Collaboration",
		content: "Working with an amazing team on our newest project. Stay tuned for updates!"
	  },
	  {
		id: 3,
		title: "Tech Talk",
		content: "Gave a presentation on modern CSS practices at the local dev meetup."
	  },
	  {
		id: 4,
		title: "Code Review Tips",
		content: "Here are my top 5 tips for effective code reviews and maintaining code quality."
	  },
	  {
		id: 5,
		title: "Weekend Project",
		content: "Built a cool side project using React and Node.js. Check it out!"
	  },
	  {
		id: 6,
		title: "Design System Update",
		content: "Just completed a major update to our company's design system."
	  }
	];
  
	return (
	  <div className="profile-container">
		<aside className="profile-sidebar">
		  <div className="profile-image-container">
			<img src="/assets/diddyparty.png" alt="Profile" className="profile-image" />
		  </div>
		  
		  <div className="profile-info">
			<InfoField label="Name" value="John Doe" />
			<InfoField label="Username" value="whomadethatmessking" />
			<InfoField label="Contact" value="john.doe@example.com" />
			<InfoField label="Location" value="San Francisco, CA" />
			<InfoField 
			  label="Bio" 
			  value="Frontend developer passionate about creating beautiful and functional web experiences." 
			/>
		  </div>
		</aside>
  
		<main className="profile-main">
		  <div className="featured-project">
			<h2>Featured Project</h2>
			<p>
			  Currently working on a revolutionary web application that combines AI 
			  with user experience design. This project showcases the latest in 
			  frontend development techniques and responsive design patterns.
			</p>
			<div className="project-details">
			  <div><strong>Status:</strong> In Progress</div>
			  <div><strong>Team Size:</strong> 5 members</div>
			  <div><strong>Technologies:</strong> React, Node.js, TensorFlow.js</div>
			</div>
		  </div>
  
		  <div className="posts-grid">
			{posts.map(post => (
			  <article key={post.id} className="post-card">
				<img src="/assets/diddyparty.png" alt="" className="post-image" />
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