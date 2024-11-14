import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage  from './pages/SignupPage';
import GoogleAuth from './pages/GoogleAuth';
import AddEvent from './pages/AddEvent';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import ProfilePictureUpload from './pages/ProfilePictureUpload';
// import ProfilePage from './pages/ProfilePage';

// Export all routes as an array of Route components
const routes = [
  <Route path="/" element={<LoginPage />} key="login" />,
  <Route path="/SignupPage" element={<SignupPage />} key="signUp" />,
  <Route path="/GoogleAuth" element={<GoogleAuth />} key="GoogleAuth" />,
  <Route path="/AddEvent" element={<AddEvent />} key="AddEvent" />,
  <Route path="/SearchPage" element={<SearchPage />} key="SearchPage" />,
  <Route path="/ProfilePage" element={<ProfilePage />} key="ProfilePage" />,
  <Route path="/UserProfile" element={<UserProfile />} key="UserProfile" />,
  <Route path="/EditProfile" element={<EditProfile />} key="EditProfile" />,
  <Route path="/ProfilePictureUpload" element={<ProfilePictureUpload />} key="ProfilePictureUpload" />,
  // <Route path="/ProfilePage" element={<ProfilePage />} key="ProfilePage" />,

];

export default routes;