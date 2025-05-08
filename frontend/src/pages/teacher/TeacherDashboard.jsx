import React from 'react';
import { Text, Card, Flex, Box, Badge } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function TeacherDashboard() {
  const { user } = useAuth();
  return (
    <Container>
      <Box className="max-w-2xl mx-auto py-8 space-y-6">
        <Text as="h1" size="8" weight="bold" color="indigo">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text as="p" size="4" color="gray" mb="4">
          This is your teacher dashboard. Here you can manage your classes, assign tasks, and track student progress.
        </Text>
        <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="blue">4</Text>
            <Text as="div" size="2" color="gray">Classes</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="green">120</Text>
            <Text as="div" size="2" color="gray">Students</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="purple">8</Text>
            <Text as="div" size="2" color="gray">Tasks to Review</Text>
          </Card>
        </Flex>
        <Card size="4" mt="6">
          <Flex align="center" justify="between" mb="2">
            <Text size="4" weight="bold">Upcoming Deadlines</Text>
            <Badge color="red">This Week</Badge>
          </Flex>
          <Text size="2" color="gray">3 assignments due for review by Friday.</Text>
        </Card>
      </Box>
    </Container>
  );
}

export default TeacherDashboard;
