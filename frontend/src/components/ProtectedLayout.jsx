import { Outlet, useLocation } from 'react-router';
import { Navbar } from './index';
import { useAuth } from '../Context/AuthContext';
import { ThemeProvider } from 'next-themes';


export default function ProtectedLayout() {
  const { handleLogout } = useAuth()
  const { pathname } = useLocation()

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='light'
      enableSystem
      disableTransitionOnChange
    >
      {pathname !== '/select-profile' && <Navbar onLogout={handleLogout} />}
      <Outlet />
    </ThemeProvider>
  );
}