import React from 'react'
import { useAuth } from '../../Context/AuthContext';
import { Avatar, Button, DropdownMenu, Flex, IconButton, Select, Separator, Text, TextField } from '@radix-ui/themes';
import profileFallback from '../../assets/profileImage.webp';
import { Link } from 'react-router';
import { Search, LogOut, Settings as SettingsIcon, Menu, MenuIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes'

function Header({ toggleSidebar }) {
  const { handleLogout, isLoggingOut } = useAuth();
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
      <TextField.Root placeholder='Search' size={'3'} className='flex-1 hidden max-w-sm md:flex' radius='full'>
        <TextField.Slot side="left">
          <MenuIcon size={16} color='var(--gray-9)' />
        </TextField.Slot>
        <TextField.Slot side="right">
          <Search size={16} color='var(--gray-9)' />
        </TextField.Slot>
      </TextField.Root>



      <Flex align="center" gap="4" className='text-sm'>
        <Button
          variant='ghost'
          asChild
          className="hidden md:flex"
        >
          <Link>
            Manage Blog
          </Link>
        </Button>
        <Separator orientation='vertical' className="hidden md:block" />
        <div className='hidden md:block'>
          <Select.Root defaultValue="US">
            <Select.Trigger variant='ghost' />
            <Select.Content variant="soft" position='popper'>
              <Select.Item value="US">United States</Select.Item>
              <Select.Item value="UG">Uganda</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <Separator orientation='vertical' className='hidden md:block' />
        <IconButton variant='ghost' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <Separator orientation='vertical' className='hidden md:block' />
        <Flex align='center' gap='2'>
          <Text
            as='span'
            size={'2'}
            className="hidden sm:block"
          >Hi User</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                radius='full'
                variant='soft'
              >
                <Avatar
                  src={profileFallback}
                  fallback="SH"
                  className='object-cover object-center w-full h-full'
                />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content variant='soft' side='bottom' align='end' className='w-48 mt-2'>
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
