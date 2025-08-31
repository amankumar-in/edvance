import { Flex, Text, Tooltip } from '@radix-ui/themes'
import { PanelLeftOpenIcon } from 'lucide-react'
import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Container } from '../components'

const settings = [
  {
    name: 'Profile',
    path: 'profile',
  },
  {
    name: 'Linked Accounts',
    path: 'linked-accounts',
  },
  // {
  //   name: 'Notifications',
  //   path: 'notifications',
  // }
]

function SettingsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile toggle button */}
      <Flex align={'center'} gap="2" className="md:hidden" mb={'4'}>
        <Tooltip content={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
          <button onClick={toggleSidebar} className='flex gap-2 items-center'>
            {!sidebarOpen && <PanelLeftOpenIcon color='gray' size={20} strokeWidth={1.5} />}
            <Text as="p" size={'2'} weight={'medium'} color='gray'>Settings</Text>
          </button>
        </Tooltip>
      </Flex>

      <Flex gap="6">
        {/* Sidebar */}
        <div
          className={`fixed md:static top-16 h-[calc(100vh-64px)] z-30 bg-[--color-background] w-64 p-4 md:p-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? '-translate-x-4' : '-translate-x-[101%] md:translate-x-0'
            }`}
        >
          {settings.map((setting) => (
            <NavLink
              key={setting.path}
              to={setting.path}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              className={({ isActive }) =>
                `${isActive ? 'bg-[--accent-a3] text-[--accent-11] font-medium' : 'hover:bg-[--gray-a3]'} 
              p-4 py-3 text-sm  rounded-full flex items-center gap-2 relative font-medium`
              }
            >
              {setting.name}
            </NavLink>
          ))}
        </div>

        {/* Main content */}
        <div className='flex-1'>
          <Outlet />
        </div>
      </Flex>
    </>
  )
}

export default SettingsLayout
