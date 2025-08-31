import { Flex, IconButton, Text } from '@radix-ui/themes';
import { Bell, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '../Context/AuthContext';

export default function Navbar({ isMobileSidebarOpen, setIsMobileSidebarOpen }) {
  const { handleLogout, isLoggingOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" px="5" py="3" className="h-16 bg-[--gray-2]  w-full sticky top-0 z-50 shadow-md">
      <Flex align='center' gap='4'>
        <IconButton
          variant='ghost'
          color='gray'
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className='md:hidden'
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </IconButton>
        <Text as='span' weight='bold' size="7" color='cyan'>
          EdVance
        </Text>
      </Flex>
      <div className="flex gap-6 items-center">
        <IconButton variant='ghost' color='gray' size='3' highContrast disabled className='disabled:cursor-not-allowed'>
          <Bell size={16}/>
        </IconButton>
        <IconButton variant='ghost' color='gray' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <IconButton
          disabled={isLoggingOut}
          variant="ghost"
          color='gray'
          onClick={handleLogout}
        >
          <LogOut size={16} />
        </IconButton>
      </div>
    </Flex>
  );
}
