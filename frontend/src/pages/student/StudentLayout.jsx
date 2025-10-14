import { Avatar, Badge, Box, Flex, IconButton, ScrollArea, Separator, Skeleton, Text, Link as RadixLink } from '@radix-ui/themes';
import { Award, BarChart3, BookOpen, Calendar, Copyright, CreditCard, GraduationCap, Home, Menu, Settings, TrendingUp, Trophy, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, NavLink, Outlet, useOutletContext } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { usePointsDetailsById } from '../../api/points/points.queries';
import { Container } from '../../components';
import { APP_NAME, BRAND_COLOR, YEAR } from '../../utils/constants';

function StudentLayout() {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useOutletContext();
  const { user, profiles } = useAuth();
  const studentId = profiles?.student?._id;

  const { data, isLoading, isError, error } = usePointsDetailsById(studentId);
  const pointAccount = data?.data ?? {};

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || 'Error fetching points details');
    }
  }, [isError, error])

  // Sidebar navigation items
  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/student/dashboard' },
    { icon: <Calendar size={20} />, label: 'Attendance', href: '/student/attendance' },
    { icon: <BookOpen size={20} />, label: 'Tasks', href: '/student/tasks' },
    { icon: <Trophy size={20} />, label: 'Rewards', href: '/student/rewards' },
    { icon: <CreditCard size={20} />, label: 'Scholarship Points', href: '/student/points' },
    { icon: <GraduationCap size={20} />, label: "Colleges", href: '/student/colleges' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/student/settings/profile' },
    { icon: <TrendingUp size={20} />, label: 'Progress', href: '/student/progress', disabled: true },
    { icon: <Award size={20} />, label: 'Badges', href: '/student/badges', disabled: true },
    { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/student/analytics', disabled: true },
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
        <Box className={` fixed md:sticky transition-transform duration-300 ease-in-out left-0 min-w-72 h-dvh md:h-[calc(100vh-4rem)] bg-[--secondary-bg] ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} top-0 md:top-16 z-[999] md:z-40`}>
          <ScrollArea className='h-full' type='auto' scrollbars='vertical'>
            <Flex align='center' gap='4' px={'4'} className='h-16 md:hidden'>
              <IconButton
                variant='ghost'
                color='gray'
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className='md:hidden'
              >
                <Menu size={24} />
              </IconButton>
              <Text as='span' weight='bold' size="6" color={BRAND_COLOR}>
                EdVance
              </Text>
            </Flex>

            {/* Profile Section */}
            <Flex align="start" gap="4" className="p-4 md:py-8">
              <Avatar
                size="5"
                src={user?.avatar}
                fallback={user?.firstName?.[0] || "S"}
                radius="full"
                highContrast
              />
              <div className='space-y-1'>
                <Text as='p' size="3" weight="bold">
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
              </div>
            </Flex>
            <Separator size={'4'} />
            {/* Navigation Items */}
            <Flex direction="column" justify='between' px={'3'} py={'4'}>
              <Flex direction="column">
                {navItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.disabled ? '#' : item.href}
                    className={({ isActive }) =>
                      `${isActive && !item.disabled ? 'bg-[--accent-a3] text-[--accent-11] font-medium' : 'hover:bg-[--gray-a3]'} 
                  p-4 py-3 text-sm  rounded-full flex items-center gap-2 relative font-medium ${item.disabled ? 'cursor-not-allowed opacity-80' : ''}`
                    }
                    onClick={item.disabled ? undefined : handleSidebarClick}
                  >
                    <span className="flex flex-1 gap-5 items-center">
                      {item.icon}
                      {item.label}
                      {item.disabled && <Badge color='gray' ml={'auto'}>coming soon</Badge>}
                    </span>
                    {item.badge && (
                      <span className="flex justify-center items-center px-1 h-5 text-xs text-white bg-red-500 rounded-full min-w-5">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </Flex>
            </Flex>
            <Separator size={'4'} />
            <Box my={'4'} className='space-y-2' px={'4'}>
              <Text as='p' color='gray' size={'1'} className='flex gap-1 items-center'>
                <Copyright size={12} /> {YEAR} {APP_NAME}. All rights reserved.
              </Text>
              <Text size={'1'} as='div' className='flex flex-wrap gap-2 items-center' color='gray'>
                <RadixLink asChild color='blue'>
                  <Link to={'#terms'}>
                    Terms
                  </Link>
                </RadixLink>
                <RadixLink asChild color='blue'>
                  <Link to={'#privacy'}>
                    Privacy
                  </Link>
                </RadixLink>
                <RadixLink asChild color='blue'>
                  <Link to={'#contact'}>
                    Contact Us
                  </Link>
                </RadixLink>
              </Text>
            </Box>
          </ScrollArea>
        </Box >

        {/* Mobile Bottom Navigation */}
        < Box className="flex fixed right-0 bottom-0 left-0 z-50 h-16 md:hidden bg-[--secondary-bg] border-t border-[--gray-a5]">
          <Flex justify="between" className='w-full'>
            {navItems.slice(0, 5).map((item, index) => (
              <NavLink
                key={index}
                to={item.href || '#'}
                className={({ isActive }) => `flex flex-col font-medium items-center gap-1 h-full relative flex-1 justify-center ${isActive ? 'text-[--accent-11] font-semibold' : 'text-[--gray-11]'} group`}
              >
                {({ isActive }) => (
                  <>
                    <Text as='span' className={`px-[18px] py-[6px] group-active:bg-[--gray-a3] relative  rounded-full ${isActive ? "bg-[--accent-a3]" : ""}`}>
                      {item.icon}
                    </Text>
                    <Text
                      as='p'
                      size="1"
                    >
                      {item.label === 'Scholarship Points' ? 'SP' : item.label === 'Dashboard' ? 'Home' : item.label}
                    </Text>
                  </>
                )}
              </NavLink>
            ))}
          </Flex>
        </Box >

        {/* Main Content */}
        <div className='flex-1 pb-16 min-w-0 bg-gradient-to-t from-[--brand-blue-light] to-[--gray-background]'>
          <Container>
            <Outlet />
          </Container>
        </div>
      </Flex >
    </>
  );
}

export default StudentLayout;
