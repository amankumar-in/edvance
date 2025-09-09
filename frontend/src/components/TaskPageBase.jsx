import { Box, Button, Flex, Grid, Select, Separator, Spinner, Tabs, Text } from '@radix-ui/themes';
import { Filter, Plus, Sparkles } from 'lucide-react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router';
import { taskCategoryOptions } from '../utils/constants';
import EmptyStateCard from './EmptyStateCard';
import ErrorCallout from './ErrorCallout';
import FeaturedTasksCarousel from './FeaturedTasksCarousel';
import Loader from './Loader';
import PageHeader from './PageHeader';
import TaskCard from './TaskCard';

// Status filter options - 'all' is used instead of null for Radix UI Select compatibility
export const statusOptions = [
  { value: 'all', label: 'All Tasks', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'blue' },
  { value: 'pending_approval', label: 'Pending Approval', color: 'orange' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
]

/**
 * Shared task page component for both student and parent views
 * Handles role-based rendering: students see status filters, parents see visibility controls
 */
function TaskPageBase({
  tasks,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  role = 'student',
  filter,
  setFilter,
  category,
  setCategory,
  featuredTasks,
  featuredTasksLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  totalTasks,
}) {
  const { ref, inView } = useInView({
    rootMargin: '300px',
  })
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  if (isLoading || featuredTasksLoading) return (
    <Flex justify='center' align='center'>
      <Loader />
    </Flex>
  );

  if (isError) return (
    <ErrorCallout
      errorMessage={error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
    />
  );

  return (
    <Box className='space-y-6'>
      <PageHeader
        title='Tasks'
      >
        {role === 'parent' && (
          <Button asChild className='shadow-md'>
            <Link to="/parent/tasks/create">
              <Plus size={16} />
              Create Task
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Featured Tasks Carousel */}
      {featuredTasks && featuredTasks.length > 0 && (
        <div>
          <Text as='p' weight="bold" className='flex gap-2 items-center mb-2'>
            <Sparkles size={16} color='gold' />
            Featured Tasks
          </Text>
          <FeaturedTasksCarousel
            featuredTasks={featuredTasks}
            role={role}
          />
        </div>
      )}

      <div>
        <Tabs.Root defaultValue={"all"} >
          <Tabs.List>
            <Tabs.Trigger value="all" onClick={() => setCategory(null)}>All Tasks ({totalTasks})</Tabs.Trigger>
            {taskCategoryOptions && taskCategoryOptions.map((option) => (
              <Tabs.Trigger key={option.value} value={option.value} onClick={() => setCategory(option.value)}>{option.label}</Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        <Flex my="4" justify="between" align="center">
          <Text as='p' size="1" color='gray' className='flex gap-2 items-center'>
            Showing {tasks.length} tasks {isFetching && <Spinner />}
          </Text>

          <Flex gap="4" align="center" wrap="wrap">
            {/* Student-only: Status filter for task completion states */}
            {role === 'student' && (
              <Flex gap="2" align="center">
                <Text as='span' size="2">Status: </Text>
                <Select.Root disabled={isFetching} value={filter} onValueChange={setFilter}>
                  <Select.Trigger placeholder='Filter by status'/>
                  <Select.Content position="popper" variant='soft'>
                    {statusOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            )}
          </Flex>
        </Flex>

        {tasks.length === 0 ? (
          <EmptyStateCard
            title="No Tasks Found"
            description="You don't have any tasks right now."
            icon={<Filter size={32} className="text-[--accent-9]" />}
          />
        ) : (
          <div className='space-y-6'>
            <Grid columns={{ initial: '1', xs: '2', md: '3', lg: '4', xl: '5' }} gap="4">
              {tasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  taskCategoryOptions={taskCategoryOptions}
                  role={role}
                />
              ))}
            </Grid>

            {isFetchingNextPage && (
              <Flex justify='center' align='center'>
                <Loader />
              </Flex>
            )}
            {(hasNextPage && !isFetchingNextPage) && <div ref={ref}></div>}
            {!hasNextPage && !isFetchingNextPage && (
              <Flex justify='center' align='center' gap="4">
                <Text as='p' size="1" color="gray" className='text-nowrap' >No more tasks to show</Text>
              </Flex>
            )}
          </div>
        )}
      </div>
    </Box>
  );
}

export default TaskPageBase;