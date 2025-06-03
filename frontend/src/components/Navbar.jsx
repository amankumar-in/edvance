import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '../Context/AuthContext';

export default function Navbar() {
  const { handleLogout, isLoggingOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Flex as="nav" align="center" justify="between" px="5" py="3" className="h-16 bg-[--slate-1] border-b border-[--slate-6] w-full sticky top-0 z-50">
      <Text weight="bold" size="5" color="purple">
        Univance
      </Text>
      <div className="flex items-center gap-4">
        <IconButton variant='ghost' color='gray' size='3' highContrast onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <Button
          disabled={isLoggingOut}
          color="red" variant="soft"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </Flex>
  );
}
