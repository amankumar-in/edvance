import { Avatar, Badge, Box, Button, Flex, IconButton, Skeleton, Text } from '@radix-ui/themes';
import { BarChart3, Bell, BookOpen, Calendar, CreditCard, Home, LogOut, Settings, TrendingUp, Trophy, User, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { usePointsDetailsById } from '../../api/points/points.queries';
import { Container } from '../../components';

function StudentLayout() {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useOutletContext();
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

  const handleSidebarClick = () => window.innerWidth < 768 && setIsMobileSidebarOpen(false);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && <div
        onClick={() => setIsMobileSidebarOpen(false)}
        className="fixed inset-0 z-[999] bg-[--color-overlay] md:hidden"
      />}

      <Flex className='relative w-full'>
        {/* Desktop Sidebar */}
        <Box className={`overflow-y-auto fixed md:sticky transition-transform border-r border-[--gray-a6] duration-300 ease-in-out left-0 min-w-72 h-dvh md:h-[calc(100vh-4rem)] bg-[--gray-2] ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} top-0 md:top-16 z-[999] md:z-40`}>
          <Flex align='center' gap='4' px={'4'} className='h-16 md:hidden' justify='between'>
            <Text as='p' weight='bold' size="7" color='cyan'>
              EdVance
            </Text>
            <IconButton
              variant='ghost'
              color='gray'
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className='md:hidden'
            >
              <X size={24} />
            </IconButton>
          </Flex>

          {/* Profile Section */}
          <Flex direction="column" align="center" gap="2" className="p-4">
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
          <Flex direction="column" justify='between' px={'3'} pb={'4'}>
            <Flex direction="column">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[--accent-a3] text-[--accent-11] font-medium' : 'hover:bg-[--gray-a3]'} 
                  p-4 py-3 text-sm  rounded-full flex items-center gap-2 relative font-medium`
                  }
                  onClick={handleSidebarClick}
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
            </Flex>
            <Button
              variant="ghost"
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
        </Box >

        {/* Mobile Bottom Navigation */}
        < Box className="flex fixed right-0 bottom-0 left-0 z-50 h-16 md:hidden bg-[--gray-2]" style={{ borderTop: '1px solid var(--gray-6)' }
        }>
          <Flex justify="between" className='w-full'>
            {navItems.slice(0, 5).map((item, index) => (
              <NavLink
                key={index}
                to={item.href || '#'}
                className={({ isActive }) => `flex flex-col items-center gap-1 px-2 border-t-4 h-full relative flex-1 justify-center ${isActive ? 'text-[--accent-11] font-bold  border-[--accent-11]' : 'border-transparent'} active:bg-[--accent-a3]`}
              >
                {item.icon}
                <Text
                  as='p'
                  size="1"
                >
                  {item.label === 'Scholarship Points' ? 'SP' : item.label}
                </Text>
              </NavLink>
            ))}
          </Flex>
        </Box >

        {/* Main Content */}
        <div className='flex-1 pb-16 min-w-0 md:pb-0'>
          <Container>
            <Outlet />
          </Container>
        </div>
      </Flex >
    </>
  );
}

export default StudentLayout;
