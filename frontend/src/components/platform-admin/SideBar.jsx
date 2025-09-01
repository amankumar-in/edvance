import { IconButton, Text } from '@radix-ui/themes';
import {
  Award,
  BarChart3,
  CheckSquare,
  FileBarChart,
  Gift,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  MessageCircle,
  Receipt,
  School,
  Settings,
  Users,
  X
} from 'lucide-react';
import React from 'react';
import { NavLink, useLocation } from 'react-router';

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
    label: "Badges",
    href: 'badges',
    Icon: Award,
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
          className="fixed inset-0 z-[60] bg-[--color-overlay] md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed overflow-y-auto space-y-6 md:sticky top-0 h-dvh bg-[--sidebar] text-white  z-[70] transition-transform duration-200 ease-linear ${isOpen ? 'translate-x-0 md:translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:left-0 w-72 flex flex-col`}
      >
        <Text weight="medium" size="7" className='flex justify-between items-center px-6 h-16'>
          EdVance
          <IconButton variant='ghost' color='gray' onClick={toggleSidebar} className='md:hidden'>
            <X color='white' size={20} />
          </IconButton>
        </Text>

        <div className='text-sm'>
          {sideBarItems.map(({ label, href, Icon }) => {
            if (label === 'Overview') {
              return (
                <NavLink
                  to={''}
                  key={label}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={`${pathname === '/platform-admin/dashboard' || pathname === '/platform-admin/dashboard/' ? 'bg-[--accent-a3] text-white font-medium' : 'hover:bg-[--gray-a3] text-[--inactive-link]'} p-3 px-6 flex items-center gap-4`}
                >
                  {Icon && <Icon className='size-5' color='var(--icon-muted)' />}
                  <span>{label}</span>
                </NavLink>
              );
            }
            return (
              <NavLink
                to={href}
                key={label}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={({ isActive }) => `${isActive ? 'bg-[--accent-a3] text-white font-medium' : 'hover:bg-[--gray-a3] text-[--inactive-link]'} p-3 px-6 flex items-center gap-4`}
              >
                {Icon && <Icon className='size-5' color='var(--icon-muted)' />}
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
