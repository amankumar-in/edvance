import { Box, Flex, IconButton, TabNav, Tooltip } from '@radix-ui/themes';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router';

function ClassDetails() {
  const { classId } = useParams();
  const { pathname } = useLocation();
  const currentPath = pathname.split('/').pop();

  const tabs = [
    {
      label: 'Overview',
      href: '',
      active: currentPath === classId
    },
    {
      label: 'Students',
      href: 'students',
      active: currentPath === 'students'
    },
    {
      label: 'Attendance',
      href: 'attendance',
      active: currentPath === 'attendance'
    }
  ]

  return (
    <Box className='space-y-6'>
      <Flex align="center" gap="4" className='overflow-x-auto'>
        <Tooltip content='Back'>
          <IconButton variant='surface' color='gray' asChild highContrast>
            <Link to={-1} >
              <ChevronLeft size={16} />
            </Link>
          </IconButton>
        </Tooltip>
        <div className='flex-1'>
          <TabNav.Root>
            {tabs.map((tab) => (
              <TabNav.Link
                asChild
                active={tab.active}
                key={tab.label}
              >
                <Link to={tab.href}>
                  {tab.label}
                </Link>
              </TabNav.Link>
            ))}
          </TabNav.Root>
        </div>
      </Flex>
      <Outlet />
    </Box>
  );
}

export default ClassDetails; 