import { Badge, Box, Callout, Card, Flex, Grid, Heading, IconButton, ScrollArea, Select, Separator, Tabs, Text, Tooltip } from '@radix-ui/themes';
import { AlertCircleIcon, Clock, Filter, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { useGetTaskCategories } from '../../api/task-category/taskCategory.queries';
import { useGetStudentTasks } from '../../api/task/task.queries';
import { EmptyStateCard, Loader } from '../../components';
import { formatDate } from '../../utils/helperFunctions';
import { taskCategoryOptions, taskDifficultyOptions } from '../../utils/constants';

const statusOptions = [
  { value: null, label: 'All Tasks', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'blue' },
  { value: 'pending_approval', label: 'Pending Approval', color: 'orange' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
]

function StudentTasks() {
  const [filter, setFilter] = useState(null);
  const [category, setCategory] = useState('all');
  const { data, isLoading, isError, error, isFetching, refetch } = useGetStudentTasks({
    role: 'student',
    status: filter,
    category: category === 'all' ? null : category,
  })
  const { data: tasks = [] } = data ?? {}

  const { data: taskCategoriesData } = useGetTaskCategories({ role: 'student' })
  const { data: taskCategories = [] } = taskCategoriesData ?? {}

  // Get status badge color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'gray';
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyOption = taskDifficultyOptions.find(option => option.value === difficulty);
    return <Badge color={difficultyOption?.color} variant="outline">{difficultyOption?.label}</Badge>;
  };



  // Task Card Component
  const TaskCard = ({ task }) => {
    return (
      <Card size="2" asChild className={`transition-shadow hover:shadow-md`}>
        <Link to={`/student/tasks/${task._id}`}>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="start">
              <Flex direction="column" gap="1">
                <Flex gap="2" align="center">
                  <Badge color={taskCategoryOptions.find(option => option.value === task.category)?.color} variant="surface">{taskCategoryOptions.find(option => option.value === task.category)?.label}</Badge>
                  <Text as='span' size="1" color="gray" className='capitalize'>
                    {task.subCategory}
                  </Text>
                </Flex>
                <Heading size="3" style={{ marginTop: '6px' }}>{task.title}</Heading>
              </Flex>
            </Flex>

            <Text size="2" className="line-clamp-2" color="gray">{task.description}</Text>

            <Separator size="4" />

            <Flex justify="between" align="center">
              <Flex gap="2" align="center">
                <Text weight="bold" size="4">{task.pointValue}</Text>
                <Text size="1">points</Text>
              </Flex>

              <Flex gap="3" align="center">
                <Flex gap="1" align="center">
                  <Clock size={14} color='var(--gray-10)' />
                  <Text size="1">
                    {formatDate(task.dueDate)}
                  </Text>
                </Flex>
                {task.difficulty && getDifficultyBadge(task.difficulty)}
              </Flex>
            </Flex>

            <Flex justify="between" align="center" mt="1">
              <Text size="1" color='gray'>Assigned by: {task.createdBy}</Text>
              <Badge className='capitalize' color={getStatusColor(task.completionStatus.status)} >{task.completionStatus.status}</Badge>
            </Flex>

          </Flex>
        </Link>
      </Card>
    );
  };

  if (isLoading) return (
    <Flex justify='center' align='center'>
      <Loader />
    </Flex>
  );

  if (isError) return (
    <Callout.Root color='red'>
      <Callout.Icon>
        <AlertCircleIcon size={16} />
      </Callout.Icon>
      <Callout.Text>
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
      </Callout.Text>
    </Callout.Root>
  );


  return (
    <Box>
      {/* Header Section */}
      <Flex justify="between" align="center" mb="5">
        <Heading as="h1" size="6" weight="bold">My Tasks</Heading>
      </Flex>

      {/* Status Helper */}
      <Callout.Root variant='surface' mb="5" color="blue">
        <Callout.Icon>
          <AlertCircleIcon size={16} />
        </Callout.Icon>
        <Callout.Text className='space-y-2'>
          <Text weight="medium">Task Status Guide:</Text>
        </Callout.Text>
        <Flex direction="column" gap="2">
          <Text as='p' size="1"><Badge color="blue" size="1">Pending</Badge> - Task is waiting to be started</Text>
          <Text as='p' size="1"><Badge color="yellow" size="1">Completed</Badge> - Task completed but not yet submitted for approval</Text>
          <Text as='p' size="1"><Badge color="orange" size="1">Pending Approval</Badge> - Task submitted and awaiting approval</Text>
          <Text as='p' size="1"><Badge color="green" size="1">Approved</Badge> - Task approved and points awarded</Text>
          <Text as='p' size="1"><Badge color="red" size="1">Rejected</Badge> - Task needs to be redone</Text>
        </Flex>
      </Callout.Root>

      {/* Filters and Controls */}
      <Card mb="5" size="2">
        <Flex justify="between" align="center" wrap="wrap" gap="4" >
          <ScrollArea className='w-max'>
            <Tabs.Root defaultValue="all">
              <Tabs.List>
                <Tabs.Trigger value="all">All Tasks ({tasks.length})</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </ScrollArea>
          <Flex gap="4" align="center" wrap="wrap">

            {/* Refresh Tasks Button */}
            <Tooltip content="Refresh tasks">
              <IconButton
                variant='ghost'
                color='gray'
                onClick={refetch}
                disabled={isFetching}
                aria-label="Refresh tasks"
              >
                <span className={`${isFetching ? 'animate-spin' : ''}`}>
                  <RefreshCw size={16} />
                </span>
              </IconButton>
            </Tooltip>

            {/* Filter Icon */}
            <Filter size={16} />

            {/* Status Filter */}
            <Flex gap="2" align="center">
              <Text as='span' size="2">Status</Text>
              <Select.Root disabled={isFetching} value={filter} onValueChange={setFilter}>
                <Select.Trigger placeholder='Filter by status' />
                <Select.Content position="popper" variant='soft'>
                  {statusOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Category Filter */}
            <Flex gap="2" align="center">
              <Text as='span' size="2">Category</Text>
              <Select.Root disabled={isFetching} value={category} onValueChange={setCategory}>
                <Select.Trigger placeholder='Filter by status' />
                <Select.Content position="popper" variant='soft'>
                  <Select.Item value='all' key='all'>
                    All
                  </Select.Item>
                  {taskCategoryOptions && taskCategoryOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value} className='capitalize'>{option.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Flex>
      </Card>

      {/* Tasks Display */}
      {tasks.length === 0 ? (
        <EmptyStateCard
          title="No Tasks Found"
          description="You don't have any tasks right now."
          icon={<Filter size={32} className="text-[--accent-9]" />}
        />
      ) : (
        <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} />
          ))}
        </Grid>
      )}

    </Box>
  );
}

export default StudentTasks;
