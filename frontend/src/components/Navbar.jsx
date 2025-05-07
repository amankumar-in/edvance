import { Flex, Text, Button } from '@radix-ui/themes';
import { useAuth } from '../Context/AuthContext';

export default function Navbar() {
  const { handleLogout, isLoggingOut } = useAuth();

  return (
    <Flex as="nav" align="center" justify="between" px="5" py="3" className="bg-[--slate-1] border-b border-[--slate-6] w-full">
      <Text weight="bold" size="5" color="purple">
        Univance
      </Text>
      <Button
        disabled={isLoggingOut}
        color="red" variant="soft"
        onClick={handleLogout}
        size="3"
      >
        Logout
      </Button>
    </Flex>
  );
}
