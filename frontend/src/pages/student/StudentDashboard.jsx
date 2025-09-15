import React from 'react';
import { Text, Card, Flex, Box, Progress, Badge } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';

function StudentDashboard() {
  const { user } = useAuth();
  return (
    <Box className="mx-auto space-y-6 max-w-2xl">
      <Text as="h1" size="8" weight="bold" color="indigo">
        Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
      </Text>
      <Text as="p" size="4" color="gray" mb="4">
        This is your student dashboard. Here you can view your points, tasks, and progress.
      </Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Card size="3" style={{ flex: 1 }} className='card_no_border'>
          <Text as="div" size="5" weight="bold" color="blue">350</Text>
          <Text as="div" size="2" color="gray">Scholarship Points</Text>
        </Card>
        <Card size="3" style={{ flex: 1 }} className='card_no_border'>
          <Text as="div" size="5" weight="bold" color="green">3</Text>
          <Text as="div" size="2" color="gray">Tasks Due Today</Text>
        </Card>
        <Card size="3" style={{ flex: 1 }} className='card_no_border'>
          <Text as="div" size="5" weight="bold" color="purple">Level 2</Text>
          <Text as="div" size="2" color="gray">Current Level</Text>
        </Card>
      </Flex>
      <Card size="4" mt="6" className='card_no_border'>
        <Flex align="center" justify="between" mb="2">
          <Text size="4" weight="bold">Progress</Text>
          <Badge color="green">7 day streak</Badge>
        </Flex>
        <Progress value={70} max={100} color="green" size="3" mb="2" variant='classic' />
        <Text size="2" color="gray">You're making great progress! Keep it up!</Text>
      </Card>
    </Box>
  );
}

export default StudentDashboard;
