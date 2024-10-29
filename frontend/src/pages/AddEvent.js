import React, { useState, useEffect } from 'react';
import axios from 'axios';


const AddEvent = () => {
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [eventDetails, setEventDetails] = useState({
        summary: '',
        description: '',
        startDateTime: '',
        endDateTime: ''
    });



    useEffect(() => {
        const initAuth = async () => {
          try {
            const response = await axios.get('/check-cred');
            console.log("XXXX")
            console.log(response.data.authenticated)
            // setIsAuthenticated(response.data.authenticated);
            
            // If not authenticated, trigger login automatically
            if (!response.data.authenticated) {
              handleLogin();
            }
          } catch (error) {
            console.error('Error checking authentication status:', error);
          }
        };
    
        initAuth();
      }, []);

      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      const handleLogin = async () => {
        try {
          const response = await axios.get('/authorize', {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          });
          window.location.href = response.data.authUrl;
          await delay(200);
        } catch (error) {
          console.error('Error during login:', error);
        }
      };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const formattedStartTime = new Date(eventDetails.startDateTime).toISOString();
          const formattedEndTime = new Date(eventDetails.endDateTime).toISOString();
    
          const response = await axios.post('/addEvent', {
            ...eventDetails,
            startDateTime: formattedStartTime,
            endDateTime: formattedEndTime
          });
          
          if (response.data.success) {
            alert('Event added successfully!');
            setEventDetails({
              summary: '',
              description: '',
              startDateTime: '',
              endDateTime: ''
            });
          }
        } catch (error) {
          console.error('Error adding event:', error);
          if (error.response?.status === 401) {
            alert('Authentication expired. Please login again.');
            // setIsAuthenticated(false);
          } else {
            alert('Failed to add event: ' + (error.response?.data?.error || error.message));
          }
        }
      };

      const handleLogout = async () => {
        try {
          await axios.post('/logout');
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
        //   setIsAuthenticated(false);
        }
      };
return (
    <div className="p-4">
       
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Event Title</label>
              <input
                type="text"
                value={eventDetails.summary}
                onChange={(e) => setEventDetails({...eventDetails, summary: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Description</label>
              <textarea
                value={eventDetails.description}
                onChange={(e) => setEventDetails({...eventDetails, description: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={eventDetails.startDateTime}
                onChange={(e) => setEventDetails({...eventDetails, startDateTime: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={eventDetails.endDateTime}
                onChange={(e) => setEventDetails({...eventDetails, endDateTime: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Add Event
            </button>
          </form>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
          >
          
            Logout
          </button>
        </div>
      
    </div>
  );
};

export default AddEvent