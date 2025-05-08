import React from 'react';
import { Text, Card, Flex, Box, Badge } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function ParentDashboard() {
  const { user } = useAuth();
  return (
    <Container>
      <Box className="max-w-2xl mx-auto py-8 space-y-6">
        <Text as="h1" size="8" weight="bold" color="indigo">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text as="p" size="4" color="gray" mb="4">
          This is your parent dashboard. Here you can view your children's progress, manage tasks, and more.
        </Text>
        <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="blue">2</Text>
            <Text as="div" size="2" color="gray">Children Linked</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="green">5</Text>
            <Text as="div" size="2" color="gray">Tasks to Approve</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="purple">1200</Text>
            <Text as="div" size="2" color="gray">Total Rewards Given</Text>
          </Card>
        </Flex>
        <Card size="4" mt="6">
          <Flex align="center" justify="between" mb="2">
            <Text size="4" weight="bold">Recent Activity</Text>
            <Badge color="blue">Today</Badge>
          </Flex>
          <Text size="2" color="gray">You approved 2 tasks and gave 50 points today.</Text>
        </Card>
      </Box>
    </Container>
  );
}

export default ParentDashboard;
