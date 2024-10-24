import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage  from './pages/SignupPage';

// Export all routes as an array of Route components
const routes = [
  <Route path="/" element={<LoginPage />} key="login" />,
  <Route path="/SignupPage" element={<SignupPage />} key="signUp" />,
];

export default routes;