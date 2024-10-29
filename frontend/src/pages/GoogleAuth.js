import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

const GoogleAuth = () => {

  useEffect(() => {
    const initAuth = async () => {
      try {
  
          handleLogin();
   
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


};

export default GoogleAuth;