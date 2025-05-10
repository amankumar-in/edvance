import {
  Award,
  BarChart3,
  CheckSquare,
  Coins,
  Gift,
  LayoutDashboard,
  MessageSquare,
  School,
  Search,
  Settings,
  Tags,
  Users
} from 'lucide-react'
import React from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Button, Select, TextField } from '@radix-ui/themes'

const sideBarItems = [
  {
    label: 'Overview',
    href: '',
    icon: LayoutDashboard
  },
  {
    label: 'Users',
    href: 'users',
    icon: Users
  },
  {
    label: 'Tasks',
    href: 'tasks',
    icon: CheckSquare
  },
  {
    label: "Rewards",
    href: 'rewards',
    icon: Gift
  },
  {
    label: "Badges",
    href: 'badges',
    icon: Award
  },
  {
    label: "Scholarship Points",
    href: 'scholarship-points',
    icon: Coins
  },
  {
    label: 'Schools',
    href: 'schools',
    icon: School
  },
  {
    label: "Communications",
    href: 'communications',
    icon: MessageSquare
  },
  {
    label: "Promotions",
    href: 'promotions',
    icon: Tags
  },
  {
    label: 'Reports',
    href: 'reports',
    icon: BarChart3
  },
  {
    label: 'Settings',
    href: 'settings',
    icon: Settings
  },
]

function SideBar({ isOpen, toggleSidebar }) {
  const { pathname } = useLocation();

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
        className={`fixed md:sticky top-16 h-[calc(100svh-64px)] sm:h-[calc(100vh-64px)] bg-[--color-background] border-r border-[--gray-a6] z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 md:translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:left-0 w-72 p-4 md:p-6 flex flex-col`}
      >

        <div className='w-full mb-4 border-b border-[--gray-a6] flex flex-col gap-2 pb-4 md:hidden'>
          <TextField.Root
            placeholder='Search'
            size={'3'}
          >
            <TextField.Slot>
              <Search size={18} strokeWidth={1.75} />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root size={'3'} defaultValue="US">
            <Select.Trigger />
            <Select.Content variant="soft" position='popper' className='flex-1' >
              <Select.Item value="US">United States</Select.Item>
              <Select.Item value="UG">Uganda</Select.Item>
            </Select.Content>
          </Select.Root>

          <Button
            variant='soft'
            color='gray'
            highContrast
            asChild
            size={'3'}
            className='w-full '
          >
            <Link className='font-normal'>
              Manage Blog
            </Link>
          </Button>
        </div>



        {sideBarItems.map(({ label, href, icon: Icon }) => {
          if (label === 'Overview') {
            return (
              <NavLink
                to={''}
                key={label}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={`${pathname === '/platform-admin/dashboard' || pathname === '/platform-admin/dashboard/' ? 'bg-[--accent-4]' : 'hover:bg-[--gray-a3]'} p-2 rounded-md flex items-center gap-2`}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{label}</span>
              </NavLink>
            );
          }
          return (
            <NavLink
              to={href}
              key={label}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
              className={({ isActive }) => `${isActive ? 'bg-[--accent-4]' : 'hover:bg-[--gray-a3]'} p-2 rounded-md flex items-center gap-2`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
}

export default SideBar
