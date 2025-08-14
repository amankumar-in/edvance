import { Avatar, Box, Button, Flex, Separator, Text } from '@radix-ui/themes';
import { BookOpen, ClipboardCheck, Home, LogOut, Settings, Trophy, Users } from 'lucide-react';
import React from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function ParentLayout() {
  const { user, handleLogout, isLoggingOut } = useAuth();

  // Sidebar navigation items
  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/parent/dashboard' },
    { icon: <BookOpen size={20} />, label: 'Tasks', href: '/parent/tasks' },
    { icon: <ClipboardCheck size={20} />, label: 'Claims', href: '/parent/claims' },
    { icon: <Users size={20} />, label: 'Children', href: '/parent/children' },
    { icon: <Trophy size={20} />, label: 'Rewards', href: '/parent/rewards' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/parent/settings' },
  ];

  return (
    <Flex>
      {/* Desktop Sidebar */}
      <Box className="fixed left-0 hidden w-64 h-[calc(100vh-4rem)] pt-6 top-16 md:block" style={{ borderRight: '1px solid var(--gray-6)' }}>
        <Flex direction="column" gap="6" className="h-full">
          {/* Profile Section */}
          <Flex direction="column" align="center" gap="2" className="px-4 py-2">
            <Avatar
              size="5"
              src={user?.avatar}
              fallback={user?.firstName?.[0] || "P"}
              radius="full"
              highContrast
            />
            <Text size="3" weight="bold" align="center">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Parent'}
            </Text>
          </Flex>

          <Separator size="4" />

          {/* Navigation Items */}
          <Flex direction="column" className="flex-grow px-3">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href || '#'}
                className={({ isActive }) =>
                  `${isActive ? 'bg-[--accent-a3] text-[--accent-11] font-medium' : 'hover:bg-[--gray-a3]'} 
                  py-2 text-sm px-4 rounded-lg flex items-center gap-2`
                }
              >
                <span className="flex gap-2 items-center">
                  {item.icon}
                  {item.label}
                </span>
              </NavLink>
            ))}
          </Flex>

          {/* Logout Button */}
          <Box className="px-4 py-4 mt-auto">
            <Button variant="outline" color="gray" className='w-full'
              onClick={() => {
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              <LogOut size={20} /> {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box className="fixed right-0 bottom-0 left-0 z-50 md:hidden" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-background)' }}>
        <Flex justify="between" className="px-2 py-3">
          {navItems.slice(0, 5).map((item, index) => (
            <NavLink
              key={index}
              to={item.href || '#'}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-2 ${isActive ? 'text-[--accent-11]' : 'text-[--gray-11] hover:text-[--gray-12]'
                }`}
            >
              <Box className={({ isActive }) =>
                isActive ? 'bg-[--accent-a3] p-1 rounded-md' : 'p-1'
              }>
                {item.icon}
              </Box>
              <Text
                size="1"
                weight={({ isActive }) => isActive ? "medium" : "regular"}
              >
                {item.label}
              </Text>
            </NavLink>
          ))}
        </Flex>
      </Box>

      {/* Main Content */}
      <Box className="flex-1 pb-16 min-w-0 md:ml-64">
        <Container>
          <Outlet />
        </Container>
      </Box>
    </Flex>
  );
}

export default ParentLayout; 