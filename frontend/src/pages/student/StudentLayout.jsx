import { Avatar, Badge, Box, Button, Flex, Separator, Skeleton, Text } from '@radix-ui/themes';
import { BarChart3, Bell, BookOpen, Calendar, CreditCard, Home, LogOut, Settings, TrendingUp, Trophy, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';
import { usePointsDetailsById } from '../../api/points/points.queries';
import { toast } from 'sonner';

function StudentLayout() {
  const { user, handleLogout, isLoggingOut, profiles } = useAuth();
  const studentId = profiles?.student?._id;

  const { data, isLoading, isError, error } = usePointsDetailsById(studentId);
  const pointAccount = data?.data ?? {};

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || 'Error fetching points details');
    }
  }, [isError, error])

  // Mock unread notifications count - replace with actual data
  const unreadNotifications = 3;

  // Sidebar navigation items
  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/student/dashboard' },
    { icon: <BookOpen size={20} />, label: 'Tasks', href: '/student/tasks' },
    { icon: <CreditCard size={20} />, label: 'Scholarship Points', href: '/student/points' },
    { icon: <Trophy size={20} />, label: 'Rewards', href: '/student/rewards' },
    { icon: <Calendar size={20} />, label: 'Attendance', href: '/student/attendance' },
    {
      icon: <Bell size={20} />,
      label: 'Notifications',
      href: '/student/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    { icon: <TrendingUp size={20} />, label: 'Progress', href: '/student/progress' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/student/analytics' },
    { icon: <User size={20} />, label: 'Profile', href: '/student/profile' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/student/settings' },
  ];

  return (
    <Flex>
      {/* Desktop Sidebar */}
      <Box className="sticky left-0 hidden min-w-72 h-[calc(100vh-4rem)] py-6 top-16 md:block bg-[--gray-2] overflow-y-auto">
        <Flex direction="column" gap="4" className="h-full">
          {/* Profile Section */}
          <Flex direction="column" align="center" gap="2" className="px-4 py-2">
            <Avatar
              size="5"
              src={user?.profileImage}
              fallback={user?.firstName?.[0] || "S"}
              radius="full"
              highContrast
            />
            <Text as='p' size="3" weight="bold" align="center">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Student'}
            </Text>
            <Badge highContrast>
              Student
            </Badge>
            <Skeleton loading={isLoading} className='w-28'>
              <Text as='p' size="1" color="gray">
                Level {pointAccount.level} {pointAccount.levelName}
              </Text>
            </Skeleton>
          </Flex>

          {/* Navigation Items */}
          <Flex direction="column" className="flex-grow px-3">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) =>
                  `${isActive ? 'bg-[--accent-a3] text-[--accent-11] font-medium' : 'hover:bg-[--gray-a3]'} 
                  p-4 py-3 text-sm  rounded-full flex items-center gap-2 relative font-medium`
                }
              >
                <span className="flex flex-1 gap-5 items-center">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="flex justify-center items-center px-1 h-5 text-xs text-white bg-red-500 rounded-full min-w-5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
            <Button
              variant="ghost"
              my={'6'}
              mx='auto'
              radius='full'
              color="gray"
              highContrast
              className='flex gap-5 justify-start px-4 py-3 max-w-xs font-medium'
              onClick={() => {
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              <LogOut size={20} /> {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </Flex>
        </Flex>
      </Box >

      {/* Mobile Bottom Navigation */}
      < Box className="flex fixed right-0 bottom-0 left-0 z-50 h-16 md:hidden" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-background)' }
      }>
        <Flex justify="between" className="items-stretch w-full">
          {navItems.slice(0, 6).map((item, index) => (
            <NavLink
              key={index}
              to={item.href || '#'}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-2 h-full relative flex-1 justify-center ${isActive ? 'text-[--accent-11]' : 'text-[--gray-11] hover:text-[--gray-12] '
                }`}
            >
              <Box className={({ isActive }) =>
                isActive ? 'bg-[--accent-a3] p-1 rounded-md' : 'p-1'
              }>
                {item.icon}
              </Box>
              {/* <Text
                size="1"
                weight={({ isActive }) => isActive ? "medium" : "regular"}
              >
                {item.label}
              </Text> */}
            </NavLink>
          ))}
        </Flex>
      </Box >

      {/* Main Content */}
      <div className='flex-1 pb-16 md:pb-0'>
        <Container>
          <Outlet />
        </Container>
      </div>
    </Flex >
  );
}

export default StudentLayout;
