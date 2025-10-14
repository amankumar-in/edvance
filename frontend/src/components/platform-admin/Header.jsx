import { Avatar, DropdownMenu, Flex, IconButton, Select, Separator, Text, TextField } from '@radix-ui/themes';
import { LogOut, Menu, Moon, Search, Settings as SettingsIcon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { FALLBACK_IMAGES } from '../../utils/constants';

function Header({ toggleSidebar }) {
  const { handleLogout, isLoggingOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" gap="4" className="sticky top-0 z-50 px-4 w-full h-16 backdrop-blur-lg bg-[--admin-navbar] md:px-6">
      <Flex align="center" gap="3" className="md:hidden">
        <IconButton
          size="3"
          variant="ghost"
          onClick={toggleSidebar}
          color='gray'
        >
          <Menu size={20} />
        </IconButton>
      </Flex>
      <TextField.Root placeholder='Search...' size={'3'} className='hidden flex-1 max-w-sm md:flex' radius='full'>
        <TextField.Slot >
          <Search size={16} />
        </TextField.Slot>
      </TextField.Root>

      <Flex align="center" gap="4" className='text-sm'>
        <div className='hidden md:block'>
          <Select.Root defaultValue="US">
            <Select.Trigger variant='ghost' color='gray'/>
            <Select.Content variant="soft" position='popper'>
              <Select.Item value="US">United States</Select.Item>
              <Select.Item value="UG">Uganda</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <Separator orientation='vertical' className='hidden md:block' />
        <IconButton color='gray' variant='ghost' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <Separator orientation='vertical' className='hidden md:block' />
        <Flex align='center' gap='2'>
          <Text
            as='span'
            size={'2'}
            className="hidden sm:block"
          >Admin</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                radius='full'
                variant='soft'
              >
                <Avatar
                  fallback="A"
                  className='object-cover object-center w-full h-full'
                />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content variant='soft' side='bottom' align='end' className='mt-2 w-48'>
              <DropdownMenu.Item
                disabled={isLoggingOut}
                color="red"
                variant="soft"
                onClick={handleLogout}
              >
                <Flex align="center" gap="2">
                  <LogOut size={16} strokeWidth={1.5} />
                  <Text>Logout</Text>
                </Flex>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                <Flex align="center" gap="2">
                  <SettingsIcon size={16} strokeWidth={1.5} />
                  <Text>Account Settings</Text>
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Header
