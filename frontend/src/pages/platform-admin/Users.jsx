import { Flex, Heading, IconButton, ScrollArea, Skeleton, TabNav, Text } from '@radix-ui/themes';
import { Ellipsis } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { toast } from 'sonner';
import { useTotalUserCount } from '../../api/user/user.queries';
import { AddNewUserDialog } from '../../components/platform-admin';
import CreateSubAdmin from '../../components/platform-admin/CreateSubAdminDialog';

function Users() {
  const { pathname } = useLocation();
  const currentPath = pathname.split('/').pop();

  const { data: totalUsers, isLoading, isError, error } = useTotalUserCount();
  console.log(totalUsers)

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || 'Something went wrong while fetching the total users');
    }
  }, [isError, error]);

  const tabs = [
    {
      label: 'Students',
      href: 'students',
      active: currentPath === 'students'
    },
    {
      label: 'Teachers',
      href: 'teachers',
      active: currentPath === 'teachers'
    },
    {
      label: 'Parents',
      href: 'parents',
      active: currentPath === 'parents'
    },
    {
      label: "Social Workers",
      href: "social-workers",
      active: currentPath === 'social-workers'
    },
    {
      label: "School Admins",
      href: "school-admins",
      active: currentPath === 'school-admins'
    }
  ]

  return (
    <div className='px-4 py-8 space-y-4 lg:px-8 xl:px-12'>
      <Flex as='div' justify='between' align='center' className='flex-wrap gap-4'>
        <Heading as='h1' size={'7'} weight={'medium'} className='flex flex-wrap gap-2 items-center'>
          User Management <span><MdArrowDropDown size={28} /></span>
          <span className='text-sm font-normal border rounded-md border-[--gray-a6] px-2 py-1 flex items-center gap-[6px]'>
            <span className='w-[6px] h-[6px] bg-[--green-8] rounded-full' /> 23 Active
          </span>
        </Heading>
        <div className='flex flex-wrap gap-2 items-center'>
          <CreateSubAdmin />
          <AddNewUserDialog />
          <IconButton
            variant='outline'
            color='gray'
          >
            <Ellipsis size={20} />
          </IconButton>
        </div>
      </Flex>
      <Text as='p' color='blue' size={'2'} className='flex flex-wrap gap-y-2 gap-6 items-center'>
        <span>
          <Skeleton loading={isLoading}>
            {totalUsers?.data.total} Total Users
          </Skeleton>
        </span>
        <span>
          245 New Users in this month
        </span>
      </Text>
      <ScrollArea size={'1'} className='pb-2' scrollbars='horizontal' >
        <TabNav.Root>
          {tabs.map((tab) => (
            <TabNav.Link
              asChild
              active={tab.active}
            >
              <Link to={tab.href}>
                {tab.label}
              </Link>
            </TabNav.Link>
          ))}
        </TabNav.Root>
      </ScrollArea>
      <Outlet />
    </div>
  )
}

export default Users
