import { Flex, IconButton, Separator, Text } from '@radix-ui/themes';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

function Header({ toggleSidebar }) {
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" gap="4" className="z-50 w-full h-14 px-4 md:px-6 border-b border-[--slate-6] bg-[--color-background]">
      <Flex align="center" gap="4">
        <IconButton
          size="3"
          variant="ghost"
          color='gray'
          onClick={toggleSidebar}
          title='Toggle Sidebar'
          aria-label='Toggle Sidebar'
        >
          <PanelLeft size={20} />
        </IconButton>
        <Separator orientation='vertical' />
        <Text as='h1' size='3' weight='medium'>
          School Admin
        </Text>
      </Flex>
      <Flex align="center" gap="4" className='text-sm'>
        <IconButton variant='ghost' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
      </Flex>
    </Flex>
  )
}

export default Header 