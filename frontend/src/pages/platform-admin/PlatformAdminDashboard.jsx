import React from 'react';
import { Text, Card, Flex, Box, Badge } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function PlatformAdminDashboard() {
  const { user } = useAuth();
  return (
    <Container>
      <Box className="max-w-2xl py-8 mx-auto space-y-6">
        <Text as="h1" size="8" weight="bold" color="indigo">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text as="p" size="4" color="gray" mb="4">
          This is your platform admin dashboard. Here you can manage the entire platform, oversee all users, and access analytics.
        </Text>
        <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="blue">6,000</Text>
            <Text as="div" size="2" color="gray">Total Users</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="green">120</Text>
            <Text as="div" size="2" color="gray">Schools</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="purple">98%</Text>
            <Text as="div" size="2" color="gray">Uptime</Text>
          </Card>
        </Flex>
        <Card size="4" mt="6">
          <Flex align="center" justify="between" mb="2">
            <Text size="4" weight="bold">Analytics</Text>
            <Badge color="green">Live</Badge>
          </Flex>
          <Text size="2" color="gray">Platform usage and performance analytics are up to date.</Text>
        </Card>
      </Box>
    </Container>
  );
}

export default PlatformAdminDashboard;
