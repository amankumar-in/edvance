import { Badge, Box, Button, Callout, Card, Flex, Grid, Heading, Separator, Tabs, Text } from '@radix-ui/themes';
import { AlertCircleIcon, CheckCircle, Clock, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useGetParentTasks } from '../../api/task/task.queries';
import { Container, Loader } from '../../components';
import ManageTaskVisibilityModal from '../../components/parent/ManageTaskVisibilityModal';
import { formatDate } from '../../utils/helperFunctions';

function ParentTasks() {
  const [filter, setFilter] = useState('all');
  const [openVisibilityModal, setOpenVisibilityModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [visibleToChildren, setVisibleToChildren] = useState([]);
  const { data, isLoading, isError, error, isFetching } = useGetParentTasks({
    role: 'parent',
  });
  const { data: tasks = [] } = data ?? {};

  // Open the visibility management modal
  const handleManageVisibility = (task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenVisibilityModal(true);
    setVisibleToChildren(Array.isArray(task.visibleToChildren) ? task.visibleToChildren : []);
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
    return (
      <Card size="2" className='transition-shadow hover:shadow-md'>
        <Flex direction="column" gap="3">
          <Flex justify="between" align="end" wrap="wrap-reverse" gap='2'>
            <Flex direction="column" gap="1">
              <Flex gap="2" align="center">
                <Badge className='capitalize' color={getCategoryColor(task?.category)} variant="soft">{task?.category || 'Other'}</Badge>
              </Flex>
              <Heading size="3" style={{ marginTop: '6px' }}>{task?.title || 'Untitled Task'}</Heading>
            </Flex>
            <Button
              size="1"
              variant="outline"
              onClick={() => handleManageVisibility(task)}
            >
              <Users size={14} />
              Manage Visibility
            </Button>
          </Flex>

          <Text size="2" color="gray" className="line-clamp-2">{task?.description || 'No description'}</Text>

          <Separator size="4" className='mt-full' />

          <Flex justify="between" align="center">
            <Flex gap="3" align="center">
              <Text weight="bold" size="4" color="blue">{task?.pointValue || 0}</Text>
              <Text size="1" color="gray">points</Text>
            </Flex>

            <Flex gap="3" align="center">
              <Flex gap="1" align="center">
                <Clock size={14} className='text-[--gray-9]' />
                <Text size="1" color='gray'>
                  {task?.dueDate ? formatDate(task?.dueDate) : 'No due date'}
                </Text>
              </Flex>
              {getDifficultyBadge(task?.difficulty)}
            </Flex>
          </Flex>

          <Flex justify="between" align="center" mt="1">
            <Text size="1" color="gray">Assigned to: {task?.assignedTo?.role || '-'}</Text>
          </Flex>
        </Flex>
      </Card>
    );
  };

  if (isLoading) return (
    <Container>
      <Flex justify='center' align='center'>
        <Loader />
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
          {error?.response?.data?.message || error?.message || 'Something went wrong while fetching tasks'}
        </Callout.Text>
      </Callout.Root>
    </Container>
  );

  return (
    <Container>
      <Box className=''>
        {/* Header Section */}
        <Flex justify="between" align="center" mb="5">
          <Heading as="h1" size="6" weight="bold">Family Tasks</Heading>
        </Flex>

        {/* Filters and Controls */}
        <Card mb="5">
          <Flex direction={{ initial: 'column', sm: 'row' }} justify="between" align="center" gap="4" p="3">
            <Flex gap="4" wrap="wrap">
              <Tabs.Root defaultValue="all" value={filter} onValueChange={setFilter}>
                <Tabs.List>
                  <Tabs.Trigger value="all">All Tasks</Tabs.Trigger>
                  {/* <Tabs.Trigger value="visible">Visible to Child</Tabs.Trigger>
                  <Tabs.Trigger value="hidden">Hidden from Child</Tabs.Trigger> */}
                </Tabs.List>
              </Tabs.Root>
            </Flex>
          </Flex>
        </Card>

        {/* Tasks Display */}
        {!Array.isArray(tasks) || tasks.length === 0 ? (
          <Card size="3" className="p-8 text-center">
            <Flex direction="column" align="center" gap="3">
              <Box className="p-3 rounded-full bg-[--accent-a3]">
                <CheckCircle size={32} className="text-[--accent-9]" />
              </Box>
              <Heading size="4">No Tasks Found</Heading>
              <Text size="2" color="gray">There are no tasks assigned to your family right now.</Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
            {tasks.map(task => (
              <TaskCard key={task?._id || `task-${Math.random()}`} task={task} />
            ))
            }
          </Grid>
        )}

        {/* Visibility Management Modal */}
        <ManageTaskVisibilityModal
          openVisibilityModal={openVisibilityModal}
          setOpenVisibilityModal={setOpenVisibilityModal}
          selectedTask={selectedTask}
          visibleToChildren={visibleToChildren}
          setVisibleToChildren={setVisibleToChildren}
        />
      </Box>
    </Container>
  );
}

export default ParentTasks; 