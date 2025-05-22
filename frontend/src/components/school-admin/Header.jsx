import { Avatar, DropdownMenu, Flex, IconButton, Separator, Text } from '@radix-ui/themes';
import { LogOut, Menu, Moon, School, Settings as SettingsIcon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import profileFallback from '../../assets/profileImage.webp';
import { useAuth } from '../../Context/AuthContext';

function Header({ toggleSidebar }) {
  const { handleLogout, isLoggingOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" gap="4" className="sticky top-0 z-50 w-full h-16 px-4 md:px-6 border-b border-[--slate-6] bg-[--color-background]">
      <Flex align="center" gap="3">
        <IconButton
          size="3"
          variant="ghost"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </IconButton>
        <Text weight="medium" size="7">
          EdVance
        </Text>
      </Flex>
      <Flex align="center" gap="4" className='text-sm'>
        <IconButton variant='ghost' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <Separator orientation='vertical' className='hidden md:block' />
        <Flex align='center' gap='2'>
          <Text
            as='span'
            size={'2'}
            className="hidden sm:block"
          >Hi Admin</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                radius='full'
                variant='soft'
              >
                <Avatar
                  src={user?.avatar || profileFallback}
                  fallback={(user?.firstName?.[0] || 'A') + (user?.lastName?.[0] || '')}
                  className='object-cover object-center w-full h-full'
                />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content variant='soft' side='bottom' align='end' className='w-48 mt-2'>
              <DropdownMenu.Item>
                <School size={16} strokeWidth={1.5} />
                School Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <SettingsIcon size={16} strokeWidth={1.5} />
                Account Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                disabled={isLoggingOut}
                color="red"
                variant="soft"
                onClick={handleLogout}
              >
                <LogOut size={16} strokeWidth={1.5} />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Header 