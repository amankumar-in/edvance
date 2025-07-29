import { Outlet, useLocation } from 'react-router';
import { Navbar } from './index';
import { useAuth } from '../Context/AuthContext';
import { useEffect, useState } from 'react';


export default function ProtectedLayout() {
  const { handleLogout } = useAuth()
  const { pathname } = useLocation()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(window.innerWidth > 768)

  useEffect(() => {
    // Auto-open on desktop, auto-close on mobile
    const handleResize = () => setIsMobileSidebarOpen(window.innerWidth > 768);
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll on mobile when sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  return (
    <>
      {pathname !== '/select-profile' && <Navbar isMobileSidebarOpen={isMobileSidebarOpen} setIsMobileSidebarOpen={setIsMobileSidebarOpen} onLogout={handleLogout} />}
      <Outlet context={{ isMobileSidebarOpen, setIsMobileSidebarOpen }} />
    </>
  );
}