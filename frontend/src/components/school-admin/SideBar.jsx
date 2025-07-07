import { Avatar, Button, DropdownMenu, Flex, Text } from '@radix-ui/themes';
import {
  BarChart3,
  ChevronRight,
  LogOut,
  School,
  SettingsIcon,
  UserPlus
} from 'lucide-react';
import React from 'react';
import { NavLink, useMatch, useResolvedPath } from 'react-router';
import { useAuth } from '../../Context/AuthContext';
import profileFallback from '../../assets/profileImage.webp';


const sideBarItems = [
  {
    label: 'Overview',
    href: '/school-admin/dashboard',
    icon: <BarChart3 size={18} />
  },
  {
    label: "Join Requests",
    href: '/school-admin/join-requests',
    icon: <UserPlus size={18} />
  },
]

function SideBar({ isOpen, toggleSidebar }) {
  const { handleLogout, isLoggingOut, user } = useAuth();

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
        className={`fixed top-0 h-dvh sm:h-screen bg-[--gray-2] z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } w-72 p-4 py-3 flex flex-col`}
      >
        <Text as="div" weight="bold" size="6" mb='3' color='cyan' className='flex items-center px-4 h-14'>
          EdVance
        </Text>
        {sideBarItems.map(({ label, href, icon }) => {
          const resolvedPath = useResolvedPath(href);
          const isActive = useMatch({ path: resolvedPath.pathname, end: true });

          return (
            <NavLink
              to={href}
              key={label}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
              className={`${isActive ? 'bg-[--accent-a3] text-[--accent-12]' : 'hover:bg-[--gray-a3]'} p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium`}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          );
        })}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className='mt-auto mb-1'>
            <Button variant='ghost' color='gray' radius='large' highContrast>
              <Flex align='center' gap='2' justify='between' className='w-full'>

                <Flex align='center' gap='2'>
                  <Avatar
                    src={user?.avatar || profileFallback}
                    fallback={(user?.firstName?.[0] || 'A') + (user?.lastName?.[0] || '')}
                    className='object-cover object-center w-10 h-10'
                    radius='full'
                  />
                  <div className='text-left'>
                    <Text as='p' size='2' weight='medium'>
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text as='p' size='1'>
                      {user?.email}
                    </Text>
                  </div>
                </Flex>
                <ChevronRight size={16} />
              </Flex>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content variant='soft' align='center' sideOffset={'1'} className='w-64'>
            <Flex align='center' gap='2'>
              <Avatar
                src={user?.avatar || profileFallback}
                fallback={(user?.firstName?.[0] || 'A') + (user?.lastName?.[0] || '')}
                className='object-cover object-center w-10 h-10'
                radius='full'
              />
              <div className='text-left'>
                <Text as='p' size='2' weight='medium'>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text as='p' size='1'>
                  {user?.email}
                </Text>
              </div>
            </Flex>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
              <School size={16} strokeWidth={1.5} />
              School Profile
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <SettingsIcon size={16} strokeWidth={1.5} />
              Account Settings
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              disabled={isLoggingOut}
              variant="soft"
              onClick={handleLogout}
            >
              <LogOut size={16} strokeWidth={1.5} />
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

      </div>
    </>
  );
}

export default SideBar 