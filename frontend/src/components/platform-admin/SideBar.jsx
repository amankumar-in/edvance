import { Button, Select, TextField } from '@radix-ui/themes'
import {
  Search,
  LayoutDashboard,
  Users,
  CheckSquare,
  ListTodo,
  Gift,
  Receipt,
  Award,
  BarChart3,
  School,
  MessageCircle,
  Megaphone,
  FileBarChart,
  Settings
} from 'lucide-react'
import React from 'react'
import { Link, NavLink, useLocation } from 'react-router'

const sideBarItems = [
  {
    label: 'Overview',
    href: '',
    Icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: 'users',
    Icon: Users,
  },
  {
    label: 'Tasks',
    href: 'tasks',
    Icon: CheckSquare,
  },
  {
    label: "Task Categories",
    href: 'task-categories',
    Icon: ListTodo,
  },
  {
    label: "Rewards",
    href: 'rewards',
    Icon: Gift,
  },
  {
    label: "Reward Redemptions",
    href: 'reward-redemptions',
    Icon: Receipt,
  },
  {
    label: "Badges",
    href: 'badges',
    Icon: Award,
  },
  {
    label: "Scholarship Points",
    href: 'scholarship-points',
    Icon: BarChart3,
  },
  {
    label: 'Schools',
    href: 'schools',
    Icon: School,
  },
  {
    label: "Communications",
    href: 'communications',
    Icon: MessageCircle,
  },
  {
    label: "Promotions",
    href: 'promotions',
    Icon: Megaphone,
  },
  {
    label: 'Reports',
    href: 'reports',
    Icon: FileBarChart,
  },
  {
    label: 'Settings',
    href: 'settings',
    Icon: Settings,
  },
];

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
        className={`fixed border-r border-[--gray-a6] md:sticky top-16 h-[calc(100dvh-64px)] sm:h-[calc(100vh-64px)] bg-[--color-background]  z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 md:translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:left-0 w-72 p-4 md:p-6 flex flex-col`}
      >

        <div className='w-full mb-4 border-b border-[--gray-a6] flex flex-col gap-2 pb-4 md:hidden'>
          <TextField.Root
            placeholder='Search'
            size={'3'}
            radius='full'
          >
            <TextField.Slot>
              <Search size={18} strokeWidth={1.75} />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root size={'3'} defaultValue="US">
            <Select.Trigger/>
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
            className='w-full'
          >
            <Link className='font-normal'>
              Manage Blog
            </Link>
          </Button>
        </div>


        <div className='overflow-y-auto'>
          {sideBarItems.map(({ label, href, Icon }) => {
            if (label === 'Overview') {
              return (
                <NavLink
                  to={''}
                  key={label}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={`${pathname === '/platform-admin/dashboard' || pathname === '/platform-admin/dashboard/' ? 'bg-[--accent-a3] text-[--accent-11]' : 'hover:bg-[--gray-a3]'} p-2 px-4 rounded-lg flex items-center gap-2`}
                >
                  {Icon && <Icon className='size-5' />}
                  <span>{label}</span>
                </NavLink>
              );
            }
            return (
              <NavLink
                to={href}
                key={label}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={({ isActive }) => `${isActive ? 'bg-[--accent-a3] text-[--accent-11]' : 'hover:bg-[--gray-a3]'} p-2 px-4 rounded-lg flex items-center gap-2`}
              >
                {Icon && <Icon className='size-5' />}
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default SideBar
