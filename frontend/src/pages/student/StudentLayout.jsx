import React from 'react';
import { Text, Card, Flex, Box, Progress, Badge, Button, IconButton, Separator, Avatar, Theme } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';
import { BarChart3, BookOpen, Calendar, CreditCard, Home, LogOut, Medal, Settings, TrendingUp, User } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';

function StudentLayout() {
  const { user, handleLogout, isLoggingOut } = useAuth();

  // Sidebar navigation items
  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/student/dashboard' },
    { icon: <BookOpen size={20} />, label: 'Tasks', href: '/student/tasks' },
    { icon: <Calendar size={20} />, label: 'Schedule', href: '/student/schedule' },
    { icon: <Medal size={20} />, label: 'Achievements', href: '/student/achievements' },
    { icon: <TrendingUp size={20} />, label: 'Progress', href: '/student/progress' },
    { icon: <CreditCard size={20} />, label: 'Points', href: '/student/points' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/student/analytics' },
    { icon: <User size={20} />, label: 'Profile', href: '/student/profile' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/student/settings' },
  ];

  return (
    <Flex>
      {/* Desktop Sidebar */}
      <Box className="sticky left-0 hidden w-64 h-[calc(100vh-4rem)] pt-6 top-16 md:block" style={{ borderRight: '1px solid var(--gray-6)' }}>
        <Flex direction="column" gap="6" className="h-full">
          {/* Profile Section */}
          <Flex direction="column" align="center" gap="2" className="px-4 py-2">
            <Avatar
              size="5"
              src={user?.profileImage || "https://ui.shadcn.com/avatars/01.png"}
              fallback={user?.firstName?.[0] || "S"}
              color="indigo"
              radius="full"
              highContrast
            />
            <Text size="3" weight="bold" align="center">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Student'}
            </Text>
            {/* <Badge color="indigo" variant="soft">Level 2</Badge> */}
          </Flex>

          <Separator size="4" />

          {/* Navigation Items */}
          <Flex direction="column" className="flex-grow px-3">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) =>
                  `${isActive ? 'bg-[--accent-a3] text-[--accent-11] font-medium' : 'hover:bg-[--gray-a3]'} 
                  py-[6px] text-sm px-4 rounded-lg flex items-center gap-2 mb-1`
                }
              >
                <span className="flex items-center gap-2">
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
      </Box >

      {/* Mobile Bottom Navigation */}
      < Box className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-background)' }
      }>
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
      </Box >

      {/* Main Content */}
      <Container>
        <Outlet />
      </Container>
    </Flex >
  );
}

export default StudentLayout;
