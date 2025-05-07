import { Heading, Text, Button, Flex } from '@radix-ui/themes';
import { Link } from 'react-router';

export default function NotFound() {
  return (
    <Flex direction="column" align="center" justify="center" height="100vh" className="bg-[--slate-1]">
      <Heading size="9" color="purple" mb="4" weight="bold">
        404
      </Heading>
      <Text size="5" color="gray" mb="2" weight="medium">
        Page Not Found
      </Text>
      <Text size="3" color="gray" mb="6">
        Sorry, the page you are looking for does not exist or has been moved.
      </Text>
      <Button asChild size="4" color="purple" variant="solid" radius="full">
        <Link to="/">Go to Home</Link>
      </Button>
    </Flex>
  );
} 