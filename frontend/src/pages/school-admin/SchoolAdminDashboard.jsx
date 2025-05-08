import React from 'react';
import { Text, Card, Flex, Box, Badge } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function SchoolAdminDashboard() {
  const { user } = useAuth();
  return (
    <Container>
      <Box className="max-w-2xl mx-auto py-8 space-y-6">
        <Text as="h1" size="8" weight="bold" color="indigo">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text as="p" size="4" color="gray" mb="4">
          This is your school admin dashboard. Here you can manage your school, view reports, and oversee staff and students.
        </Text>
        <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="blue">1</Text>
            <Text as="div" size="2" color="gray">School Managed</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="green">25</Text>
            <Text as="div" size="2" color="gray">Staff Members</Text>
          </Card>
          <Card size="3" style={{ flex: 1 }}>
            <Text as="div" size="5" weight="bold" color="purple">500</Text>
            <Text as="div" size="2" color="gray">Students</Text>
          </Card>
        </Flex>
        <Card size="4" mt="6">
          <Flex align="center" justify="between" mb="2">
            <Text size="4" weight="bold">Recent Reports</Text>
            <Badge color="blue">Updated</Badge>
          </Flex>
          <Text size="2" color="gray">Attendance and performance reports updated this week.</Text>
        </Card>
      </Box>
    </Container>
  );
}

export default SchoolAdminDashboard;
