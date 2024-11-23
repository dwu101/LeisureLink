import { Outlet, useLocation } from 'react-router-dom';
import ProfileIcon from './ProfileIcon';
import Sidebar from './SideBar';


const Layout = () => {

const location = useLocation();
const hideIconPathsProfileIcon = ['/',];
const hideIconPathsSideBar = ['/'];


  return (
    <>
      {!hideIconPathsProfileIcon.includes(location.pathname) && <ProfileIcon />}

      {!hideIconPathsSideBar.includes(location.pathname) && <Sidebar />}

      <Outlet />
    </>
  );
};

export default Layout;