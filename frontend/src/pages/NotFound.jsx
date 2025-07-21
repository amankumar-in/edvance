import { Heading, Text, Button, Flex } from '@radix-ui/themes';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <Flex direction="column" align="center" justify="center" height="100vh" className="bg-[--slate-1]" p={'4'}>
      <Heading size="9" color="purple" mb="4" weight="bold">
        404
      </Heading>
      <Text size="5" color="gray" mb="2" weight="medium">
        Page Not Found
      </Text>
      <Text size="3" color="gray" mb="6" align={'center'}>
        Sorry, the page you are looking for does not exist or has been moved.
      </Text>
      <Button asChild size="3" color="purple" variant="solid" radius="full">
        <Link to={-1}>
          <ArrowLeft /> Go Back
        </Link>
      </Button>
    </Flex>
  );
} 