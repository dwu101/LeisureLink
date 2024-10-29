import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage  from './pages/SignupPage';
import GoogleAuth from './pages/GoogleAuth';
import AddEvent from './pages/AddEvent';
import SearchPage from './pages/SearchPage';

// Export all routes as an array of Route components
const routes = [
  <Route path="/" element={<LoginPage />} key="login" />,
  <Route path="/SignupPage" element={<SignupPage />} key="signUp" />,
  <Route path="/GoogleAuth" element={<GoogleAuth />} key="GoogleAuth" />,
  <Route path="/AddEvent" element={<AddEvent />} key="AddEvent" />,
  <Route path="/SearchPage" element={<SearchPage />} key="SearchPage" />,
];

export default routes;