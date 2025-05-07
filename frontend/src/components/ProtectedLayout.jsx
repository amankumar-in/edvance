import { Outlet, useLocation } from 'react-router';
import { Navbar } from './index';
import { useAuth } from '../Context/AuthContext';


export default function ProtectedLayout() {
  const { handleLogout } = useAuth()
  const { pathname } = useLocation()

  return (
    <>
      {pathname !== '/select-profile' && <Navbar onLogout={handleLogout} />}
      <Outlet />
    </>
  );
}