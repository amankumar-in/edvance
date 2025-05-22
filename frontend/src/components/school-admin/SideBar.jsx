import {
  BarChart3,
  UserPlus
} from 'lucide-react'
import React from 'react'
import { NavLink, useLocation, useMatch, useResolvedPath } from 'react-router'

const sideBarItems = [
  {
    label: 'Overview',
    href: '',
    icon: <BarChart3 size={18} />
  },
  {
    label: "Join Requests",
    href: 'join-requests',
    icon: <UserPlus size={18} />
  },
]

function SideBar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[--color-overlay] md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-16 h-[calc(100dvh-64px)] sm:h-[calc(100vh-64px)] bg-[--color-background]  z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 md:translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:left-0 w-72 p-4 md:p-6 flex flex-col`}
      >
        {sideBarItems.map(({ label, href, icon }) => {
          const resolvedPath = useResolvedPath(href);
          const isActive = useMatch({ path: resolvedPath.pathname, end: true });

          return (
            <NavLink
              to={href}
              key={label}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
              className={`${isActive ? 'bg-[--accent-a3] text-[--accent-11]' : 'hover:bg-[--gray-a3]'} p-2 px-4 rounded-lg flex items-center gap-2`}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
}

export default SideBar 