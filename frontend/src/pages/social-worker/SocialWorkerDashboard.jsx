import React from 'react';
import { Text, Card, Flex, Box, Badge } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function SocialWorkerDashboard() {
  const { user } = useAuth();
  return (
    <Container>
      <Box className="max-w-2xl mx-auto py-8 space-y-6">
        <Text as="h1" size="8" weight="bold" color="indigo">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text as="p" size="4" color="gray" mb="4">
          This is your social worker dashboard. Here you can support students, view caseloads, and manage notes.
        </Text>
        <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="blue">15</Text>
            <Text as="div" size="2" color="gray">Students Supported</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="green">5</Text>
            <Text as="div" size="2" color="gray">Active Cases</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="purple">23</Text>
            <Text as="div" size="2" color="gray">Notes Added</Text>
          </Card>
        </Flex>
        <Card size="4" mt="6">
          <Flex align="center" justify="between" mb="2">
            <Text size="4" weight="bold">Recent Activity</Text>
            <Badge color="blue">Today</Badge>
          </Flex>
          <Text size="2" color="gray">You added 2 notes and closed 1 case today.</Text>
        </Card>
      </Box>
    </Container>
  );
}

export default SocialWorkerDashboard;
