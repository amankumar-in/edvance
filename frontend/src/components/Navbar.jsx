import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import { LogOut, Menu, Moon, PanelBottom, PanelLeft, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '../Context/AuthContext';

export default function Navbar() {
  const { handleLogout, isLoggingOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" px="5" py="3" className="h-16 bg-[--gray-2]  w-full sticky top-0 z-50 shadow-md">
      <Flex align='center' gap='4'>
        <Menu size={24} />
        <Text as='span' className='font-sans font-medium' size="6">
          Edvance
        </Text>
      </Flex>
      <div className="flex gap-6 items-center">
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
