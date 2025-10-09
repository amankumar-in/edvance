import { Flex, IconButton, Text } from '@radix-ui/themes';
import { Bell, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '../Context/AuthContext';

export default function Navbar({ isMobileSidebarOpen, setIsMobileSidebarOpen }) {
  const { handleLogout, isLoggingOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" px={'4'} className="h-16 bg-gradient-to-r from-[--blue-a9] to-[--purple-a9]  w-full sticky top-0 z-50 border-b border-[--gray-a5] backdrop-blur-lg shadow-md">
      <Flex align='center' gap='4'>
        <IconButton
          variant='ghost'
          color='gray'
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className='text-white md:hidden'
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </IconButton>
        <Text as='span' weight='bold' size="6" className='text-white'>
          EdVance
        </Text>
      </Flex>
      <div className="flex gap-6 items-center">
        <IconButton variant='ghost' color='gray' size='3' highContrast disabled className='text-white disabled:cursor-not-allowed disabled:text-opacity-50'>
          <Bell size={16}/>
        </IconButton>
        <IconButton variant='ghost' color='gray' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='text-white' >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <IconButton
          disabled={isLoggingOut}
          variant="ghost"
          highContrast
          onClick={handleLogout}
          className='text-white'
        >
          <LogOut size={16} />
        </IconButton>
      </div>
    </Flex>
  );
}
