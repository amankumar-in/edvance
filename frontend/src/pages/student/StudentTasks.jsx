import { Badge, Box, Callout, Card, Flex, Grid, Heading, Separator, Tabs, Text } from '@radix-ui/themes';
import { AlertCircleIcon, CheckCircle, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { useGetTasks } from '../../api/task/task.queries';
import { Container, Loader } from '../../components';
import { formatDate } from '../../utils/helperFunctions';

function StudentTasks() {
  const [filter, setFilter] = useState('all');
  const { data, isLoading, isError, error, isFetching } = useGetTasks({
    role: 'student',
  })
  const { data: tasks = [] } = data ?? {}

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'completed': return 'yellow';
      case 'pending_approval': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  // Get status badge text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'To Do';
      case 'completed': return 'Completed';
      case 'pending_approval': return 'Awaiting Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return 'indigo';
      case 'home': return 'cyan';
      case 'behavior': return 'purple';
      case 'extracurricular': return 'green';
      case 'attendance': return 'blue';
      default: return 'gray';
    }
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return <Badge color="green" variant="soft">Easy</Badge>;
      case 'medium':
        return <Badge color="yellow" variant="soft">Medium</Badge>;
      case 'hard':
        return <Badge color="orange" variant="soft">Hard</Badge>;
      case 'challenging':
        return <Badge color="red" variant="soft">Challenging</Badge>;
      default:
        return null;
    }
  };



  // Task Card Component
  const TaskCard = ({ task }) => {
    const isPastDue = task.status === 'pending' && task.dueDate < new Date();

    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Flex justify="between" align="start">
            <Flex direction="column" gap="1">
              <Flex gap="2" align="center">
                <Badge color={getCategoryColor(task.category)} variant="soft">{task.category}</Badge>
              </Flex>
              <Heading size="3" style={{ marginTop: '6px' }}>{task.title}</Heading>
            </Flex>
          </Flex>

          <Text size="2" color="gray" className="line-clamp-2">{task.description}</Text>

          <Separator size="4" />

          <Flex justify="between" align="center">
            <Flex gap="3" align="center">
              <Text weight="bold" size="4" color="blue">{task.pointValue}</Text>
              <Text size="1" color="gray">points</Text>
            </Flex>

            <Flex gap="3" align="center">
              <Flex gap="1" align="center">
                <Clock size={14} className={isPastDue ? 'text-[--red-9]' : 'text-[--gray-9]'} />
                <Text size="1" color={isPastDue ? 'red' : 'gray'}>
                  {formatDate(task.dueDate)}
                </Text>
              </Flex>
              {getDifficultyBadge(task.difficulty)}
            </Flex>
          </Flex>

          <Flex justify="between" align="center" mt="1">
            <Text size="1" color="gray">Assigned by: {task.createdBy}</Text>
          </Flex>
        </Flex>
      </Card>
    );
  };

  if (isLoading) return (
    <Container>
      <Flex justify='center' align='center'>
        <Loader className='size-8' borderWidth={2} borderColor='var(--accent-9)' />
      </Flex>
    </Container>
  );

  if (isError) return (
    <Container>
      <Callout.Root color='red'>
        <Callout.Icon>
          <AlertCircleIcon size={16} />
        </Callout.Icon>
        <Callout.Text>
          {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
        </Callout.Text>
      </Callout.Root>
    </Container>
  );


  return (
    <Container>
      <Box>
        {/* Header Section */}
        <Flex justify="between" align="center" mb="5">
          <Heading as="h1" size="6" weight="bold" color="indigo">My Tasks</Heading>
        </Flex>

        {/* Filters and Controls */}
        <Card mb="5">
          <Flex direction={{ initial: 'column', sm: 'row' }} justify="between" align="center" gap="4" p="3">
            <Flex gap="4" wrap="wrap">
              <Tabs.Root defaultValue="all" value={filter} onValueChange={setFilter}>
                <Tabs.List>
                  <Tabs.Trigger value="all">All Tasks</Tabs.Trigger>
                  {/* <Tabs.Trigger value="pending">To Do</Tabs.Trigger>
                  <Tabs.Trigger value="completed">Completed</Tabs.Trigger>
                  <Tabs.Trigger value="overdue">Overdue</Tabs.Trigger>
                  <Tabs.Trigger value="starred">Starred</Tabs.Trigger> */}
                </Tabs.List>
              </Tabs.Root>
            </Flex>
          </Flex>
        </Card>

        {/* Tasks Display */}
        {tasks.length === 0 ? (
          <Card size="3" className="p-8 text-center">
            <Flex direction="column" align="center" gap="3">
              <Box className="p-3 rounded-full bg-[--accent-a3]">
                <CheckCircle size={32} className="text-[--accent-9]" />
              </Box>
              <Heading size="4">No Tasks Found</Heading>
              <Text size="2" color="gray">You don't have any tasks right now.</Text>
            </Flex>
          </Card>
        ) :(
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </Grid>
        )}

      </Box>
    </Container>
  );
}

export default StudentTasks;
